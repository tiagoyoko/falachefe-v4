import { db } from '@/lib/db';
import { classificationResults, classificationStats } from '@/lib/schema';
import { eq, sql, avg, sum, count, desc } from 'drizzle-orm';

export interface ClassificationRecord {
  query: string;
  agentId: string;
  confidence: number;
  reasoning: string[];
  responseTime: number;
  cacheHit: boolean;
  success: boolean;
}

export interface ClassificationMetricsData {
  totalClassifications: number;
  accuracyRate: number;
  averageConfidence: number;
  averageResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
}

class ClassificationMetrics {
  private cache = new Map<string, any>();

  async recordClassification(record: ClassificationRecord): Promise<void> {
    try {
      // Prepare data for database
      const classificationData = {
        id: crypto.randomUUID(),
        query: record.query,
        agentId: record.agentId,
        confidence: record.confidence.toString(),
        reasoning: record.reasoning,
        responseTime: record.responseTime.toString(),
        cacheHit: record.cacheHit,
        success: record.success,
        timestamp: new Date(),
      };

      // Store in database
      await db.insert(classificationResults).values(classificationData);

      // Update cache
      const cacheKey = this.generateCacheKey(record.query, record.agentId);
      this.cache.set(cacheKey, {
        ...classificationData,
        id: crypto.randomUUID(),
        timestamp: new Date()
      });

      // Update statistics
      await this.updateStatistics();
    } catch (error) {
      console.error('Error recording classification:', error);
    }
  }

  private generateCacheKey(query: string, agentId: string): string {
    return `${query}-${agentId}`;
  }

  private async updateStatistics(): Promise<void> {
    try {
      // Get total classifications
      const totalResult = await db.select({ count: count() }).from(classificationResults);
      const totalClassifications = totalResult[0]?.count || 0;

      if (totalClassifications === 0) return;

      // Get aggregated metrics
      const metricsResult = await db.select({
        avgConfidence: avg(classificationResults.confidence),
        avgResponseTime: avg(classificationResults.responseTime),
        successCount: sum(sql`case when ${classificationResults.success} then 1 else 0 end`),
        cacheHitCount: sum(sql`case when ${classificationResults.cacheHit} then 1 else 0 end`),
      }).from(classificationResults);

      const metrics = metricsResult[0];
      const successCount = parseInt(metrics.successCount?.toString() || '0');
      const cacheHitCount = parseInt(metrics.cacheHitCount?.toString() || '0');

      const accuracyRate = successCount / totalClassifications;
      const errorRate = 1 - accuracyRate;
      const cacheHitRate = cacheHitCount / totalClassifications;
      const averageConfidence = parseFloat(metrics.avgConfidence?.toString() || '0');
      const averageResponseTime = parseFloat(metrics.avgResponseTime?.toString() || '0');

      // Update or insert overall stats
      await db.insert(classificationStats).values({
        id: 'overall',
        totalClassifications,
        accuracyRate: accuracyRate.toString(),
        averageConfidence: averageConfidence.toString(),
        averageResponseTime: averageResponseTime.toString(),
        errorRate: errorRate.toString(),
        cacheHitRate: cacheHitRate.toString(),
        lastUpdated: new Date(),
        createdAt: new Date(),
      }).onConflictDoUpdate({
        target: classificationStats.id,
        set: {
          totalClassifications,
          accuracyRate: accuracyRate.toString(),
          averageConfidence: averageConfidence.toString(),
          averageResponseTime: averageResponseTime.toString(),
          errorRate: errorRate.toString(),
          cacheHitRate: cacheHitRate.toString(),
          lastUpdated: new Date(),
        }
      });

    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  }

  async getMetrics(): Promise<{
    overall: ClassificationMetricsData | null;
    recentResults: any[];
    trends: any[];
  }> {
    try {
      // Get overall stats
      const overallStats = await db.select()
        .from(classificationStats)
        .where(eq(classificationStats.id, 'overall'))
        .limit(1);

      // Get recent results
      const recentResults = await db.select()
        .from(classificationResults)
        .orderBy(desc(classificationResults.timestamp))
        .limit(100);

      // Get trends (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const trends = await db.select({
        date: sql`date_trunc('day', ${classificationResults.timestamp})`,
        avgConfidence: avg(classificationResults.confidence),
        avgResponseTime: avg(classificationResults.responseTime),
        totalCount: count(),
      })
        .from(classificationResults)
        .where(sql`${classificationResults.timestamp} >= ${sevenDaysAgo}`)
        .groupBy(sql`date_trunc('day', ${classificationResults.timestamp})`)
        .orderBy(sql`date_trunc('day', ${classificationResults.timestamp})`);

      return {
        overall: overallStats[0] ? {
          totalClassifications: overallStats[0].totalClassifications,
          accuracyRate: parseFloat(overallStats[0].accuracyRate),
          averageConfidence: parseFloat(overallStats[0].averageConfidence),
          averageResponseTime: parseFloat(overallStats[0].averageResponseTime),
          errorRate: parseFloat(overallStats[0].errorRate),
          cacheHitRate: parseFloat(overallStats[0].cacheHitRate),
        } : null,
        recentResults,
        trends,
      };
    } catch (error) {
      console.error('Error getting metrics:', error);
      return {
        overall: null,
        recentResults: [],
        trends: [],
      };
    }
  }

  async getAgentMetrics(agentId: string): Promise<{
    totalClassifications: number;
    accuracyRate: number;
    averageConfidence: number;
    averageResponseTime: number;
    errorRate: number;
    cacheHitRate: number;
  }> {
    try {
      const agentResults = await db.select({
        totalCount: count(),
        avgConfidence: avg(classificationResults.confidence),
        avgResponseTime: avg(classificationResults.responseTime),
        successCount: sum(sql`case when ${classificationResults.success} then 1 else 0 end`),
        cacheHitCount: sum(sql`case when ${classificationResults.cacheHit} then 1 else 0 end`),
      })
        .from(classificationResults)
        .where(eq(classificationResults.agentId, agentId));

      const metrics = agentResults[0];
      const totalClassifications = metrics.totalCount || 0;
      const successCount = parseInt(metrics.successCount?.toString() || '0');
      const cacheHitCount = parseInt(metrics.cacheHitCount?.toString() || '0');

      return {
        totalClassifications,
        accuracyRate: totalClassifications > 0 ? successCount / totalClassifications : 0,
        averageConfidence: parseFloat(metrics.avgConfidence?.toString() || '0'),
        averageResponseTime: parseFloat(metrics.avgResponseTime?.toString() || '0'),
        errorRate: totalClassifications > 0 ? 1 - (successCount / totalClassifications) : 0,
        cacheHitRate: totalClassifications > 0 ? cacheHitCount / totalClassifications : 0,
      };
    } catch (error) {
      console.error('Error getting agent metrics:', error);
      return {
        totalClassifications: 0,
        accuracyRate: 0,
        averageConfidence: 0,
        averageResponseTime: 0,
        errorRate: 0,
        cacheHitRate: 0,
      };
    }
  }

  async clearMetrics(): Promise<void> {
    try {
      await db.delete(classificationResults);
      await db.delete(classificationStats);
      this.cache.clear();
    } catch (error) {
      console.error('Error clearing metrics:', error);
    }
  }
}

export const classificationMetrics = new ClassificationMetrics();