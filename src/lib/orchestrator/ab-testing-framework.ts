/**
 * A/B Testing Framework for Classification
 * 
 * Framework for testing different classification algorithms and configurations
 * to optimize performance and accuracy
 */

import { db } from '@/lib/db';
import { abTestConfigs, abTestResults } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // 0-1, determines traffic allocation
  config: {
    algorithm: string;
    parameters: Record<string, any>;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface ABTestConfig {
  id?: string;
  name: string;
  description?: string;
  isActive: boolean;
  variants: ABTestVariant[];
  trafficAllocation: Record<string, number>; // variantId -> weight
  startDate: Date;
  endDate?: Date;
  metrics: string[]; // metrics to track
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ABTestResult {
  id?: string;
  testId: string;
  variant: string;
  userId?: string;
  sessionId?: string;
  metrics: Record<string, any>;
  timestamp?: Date;
}

export interface ABTestAnalysis {
  testConfig: ABTestConfig;
  variants: Array<{
    variantId: string;
    variantName: string;
    participants: number;
    metrics: Record<string, { mean: number; stdDev: number; confidence: number; }>;
    isWinner: boolean;
  }>;
  summary: {
    totalParticipants: number;
    duration: number; // in days
    status: 'running' | 'completed' | 'paused';
    winner?: string;
  };
}

class ABTestingFramework {
  private activeTests: Map<string, ABTestConfig> = new Map();

  async initialize(): Promise<void> {
    try {
      const tests = await db.select()
        .from(abTestConfigs)
        .where(eq(abTestConfigs.isActive, true));

      this.activeTests.clear();
      tests.forEach(test => {
        this.activeTests.set(test.id, test as ABTestConfig);
      });

      console.log(`A/B Testing Framework initialized with ${this.activeTests.size} active tests`);
    } catch (error) {
      console.error('Error initializing A/B Testing Framework:', error);
    }
  }

  async createTest(config: Omit<ABTestConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ABTestConfig> {
    try {
      const testId = crypto.randomUUID();
      const now = new Date();

      const newTest: ABTestConfig = {
        ...config,
        id: testId,
        createdAt: now,
        updatedAt: now,
      };

      await db.insert(abTestConfigs).values({
        id: testId,
        name: config.name,
        description: config.description,
        isActive: config.isActive,
        variants: config.variants,
        trafficAllocation: config.trafficAllocation,
        startDate: config.startDate,
        endDate: config.endDate || null,
        metrics: config.metrics,
        createdAt: now,
        updatedAt: now,
      });

      this.activeTests.set(testId, newTest);
      return newTest;
    } catch (error) {
      console.error('Error creating A/B test:', error);
      throw error;
    }
  }

  async updateTest(testId: string, updates: Partial<ABTestConfig>): Promise<void> {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: new Date(),
      };

      await db.update(abTestConfigs)
        .set(updateData)
        .where(eq(abTestConfigs.id, testId));

      // Update local cache
      const existingTest = this.activeTests.get(testId);
      if (existingTest) {
        const updatedTest = { ...existingTest, ...updates, updatedAt: new Date() };
        this.activeTests.set(testId, updatedTest);
      }
    } catch (error) {
      console.error('Error updating A/B test:', error);
      throw error;
    }
  }

  async stopTest(testId: string): Promise<void> {
    try {
      await db.update(abTestConfigs)
        .set({ 
          isActive: false, 
          endDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(abTestConfigs.id, testId));

      this.activeTests.delete(testId);
    } catch (error) {
      console.error('Error stopping A/B test:', error);
      throw error;
    }
  }

  getActiveTests(): ABTestConfig[] {
    return Array.from(this.activeTests.values()).filter(test => 
      test.isActive && (!test.endDate || test.endDate > new Date())
    );
  }

  getTest(testId: string): ABTestConfig | undefined {
    return this.activeTests.get(testId);
  }

  getVariant(testId: string, userId?: string, sessionId?: string): ABTestVariant | undefined {
    const test = this.activeTests.get(testId);
    if (!test || !test.isActive) return undefined;

    // Simple traffic allocation based on random number
    const random = Math.random();
    let cumulativeWeight = 0;

    for (const variant of test.variants) {
      cumulativeWeight += (test.trafficAllocation[variant.id] || 0);
      if (random <= cumulativeWeight) {
        return variant;
      }
    }

    // Fallback to first variant if weights don't sum to 1
    return test.variants[0];
  }

  async recordResult(result: Omit<ABTestResult, 'id' | 'timestamp'>): Promise<void> {
    try {
      await db.insert(abTestResults).values({
        id: crypto.randomUUID(),
        testId: result.testId,
        variant: result.variant,
        userId: result.userId || null,
        sessionId: result.sessionId || null,
        metrics: result.metrics,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error recording A/B test result:', error);
      throw error;
    }
  }

  async getTestResults(testId: string): Promise<ABTestResult[]> {
    try {
      const results = await db.select()
        .from(abTestResults)
        .where(eq(abTestResults.testId, testId))
        .orderBy(desc(abTestResults.timestamp));

      return results.map(result => ({
        id: result.id,
        testId: result.testId,
        variant: result.variant,
        userId: result.userId || undefined,
        sessionId: result.sessionId || undefined,
        metrics: result.metrics as Record<string, any>,
        timestamp: result.timestamp,
      }));
    } catch (error) {
      console.error('Error getting A/B test results:', error);
      return [];
    }
  }

  async analyzeTest(testId: string): Promise<ABTestAnalysis> {
    try {
      const test = this.activeTests.get(testId);
      if (!test) {
        throw new Error(`Test ${testId} not found`);
      }

      const results = await this.getTestResults(testId);
      
      // Group results by variant
      const variantResults = new Map<string, ABTestResult[]>();
      results.forEach(result => {
        if (!variantResults.has(result.variant)) {
          variantResults.set(result.variant, []);
        }
        variantResults.get(result.variant)!.push(result);
      });

      // Calculate metrics for each variant
      const variantAnalysis = test.variants.map(variant => {
        const variantData = variantResults.get(variant.id) || [];
        const participants = variantData.length;

        const metrics: Record<string, { mean: number; stdDev: number; confidence: number; }> = {};
        
        test.metrics.forEach(metricName => {
          const values = variantData
            .map(r => r.metrics[metricName])
            .filter(v => typeof v === 'number');

          if (values.length > 0) {
            const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
            const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);
            const confidence = 1.96 * (stdDev / Math.sqrt(values.length)); // 95% confidence interval

            metrics[metricName] = { mean, stdDev, confidence };
          } else {
            metrics[metricName] = { mean: 0, stdDev: 0, confidence: 0 };
          }
        });

        return {
          variantId: variant.id,
          variantName: variant.name,
          participants,
          metrics,
          isWinner: false, // Will be calculated below
        };
      });

      // Determine winner based on primary metric (first metric)
      const primaryMetric = test.metrics[0];
      if (primaryMetric && variantAnalysis.length > 1) {
        const sortedVariants = variantAnalysis.sort((a, b) => 
          (b.metrics[primaryMetric]?.mean || 0) - (a.metrics[primaryMetric]?.mean || 0)
        );
        if (sortedVariants.length > 0) {
          sortedVariants[0].isWinner = true;
        }
      }

      const totalParticipants = results.length;
      const duration = test.endDate 
        ? Math.ceil((test.endDate.getTime() - test.startDate.getTime()) / (1000 * 60 * 60 * 24))
        : Math.ceil((Date.now() - test.startDate.getTime()) / (1000 * 60 * 60 * 24));

      const winner = variantAnalysis.find(v => v.isWinner);

      return {
        testConfig: test,
        variants: variantAnalysis,
        summary: {
          totalParticipants,
          duration,
          status: test.isActive ? 'running' : 'completed',
          winner: winner?.variantId,
        },
      };
    } catch (error) {
      console.error('Error analyzing A/B test:', error);
      throw error;
    }
  }

  async getTestHistory(): Promise<ABTestConfig[]> {
    try {
      const tests = await db.select()
        .from(abTestConfigs)
        .orderBy(desc(abTestConfigs.createdAt));

      return tests.map(test => test as ABTestConfig);
    } catch (error) {
      console.error('Error getting test history:', error);
      return [];
    }
  }

  async deleteTest(testId: string): Promise<void> {
    try {
      // Delete results first (cascade should handle this, but being explicit)
      await db.delete(abTestResults).where(eq(abTestResults.testId, testId));
      
      // Delete test config
      await db.delete(abTestConfigs).where(eq(abTestConfigs.id, testId));
      
      // Remove from local cache
      this.activeTests.delete(testId);
    } catch (error) {
      console.error('Error deleting A/B test:', error);
      throw error;
    }
  }
}

export const abTestingFramework = new ABTestingFramework();