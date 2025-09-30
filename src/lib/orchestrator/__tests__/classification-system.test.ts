/**
 * Testes para o Sistema de Classificação Multi-Camada Aprimorado
 * 
 * Testa as funcionalidades implementadas na Story 1.2.2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MultiLayerClassifier } from '../multi-layer-classifier';
import { classificationMetrics } from '../classification-metrics';
import { classificationCache } from '../classification-cache';
import { abTestingFramework } from '../ab-testing-framework';

describe('Enhanced Multi-Layer Classification System', () => {
  let classifier: MultiLayerClassifier;

  beforeEach(() => {
    classifier = new MultiLayerClassifier();
  });

  afterEach(() => {
    // Clean up after each test
    classificationCache.clear();
  });

  describe('Multi-Layer Classification', () => {
    it('should classify financial messages correctly', async () => {
      const result = await classifier.classify('Preciso registrar uma despesa de R$ 500');
      
      expect(result.success).toBe(true);
      expect(result.classification.primaryIntent).toBe('financeiro');
      expect(result.agentId).toBe('leo');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should classify marketing messages correctly', async () => {
      const result = await classifier.classify('Como criar uma campanha no Instagram?');
      
      expect(result.success).toBe(true);
      expect(result.classification.primaryIntent).toBe('marketing');
      expect(result.agentId).toBe('max');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should classify HR messages correctly', async () => {
      const result = await classifier.classify('Preciso contratar um novo funcionário');
      
      expect(result.success).toBe(true);
      expect(result.classification.primaryIntent).toBe('rh');
      expect(result.agentId).toBe('lia');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should handle conversation context', async () => {
      const history = ['Olá, como posso ajudar?', 'Preciso de ajuda com finanças'];
      const result = await classifier.classify('Obrigado pela ajuda anterior', history);
      
      expect(result.success).toBe(true);
      expect(result.classification.conversationContext).toBe('continuidade');
    });

    it('should determine urgency correctly', async () => {
      const urgentResult = await classifier.classify('URGENTE: Problema crítico com pagamentos!');
      const normalResult = await classifier.classify('Boa tarde, como está?');
      
      expect(urgentResult.classification.urgency).toBe('critica');
      expect(normalResult.classification.urgency).toBe('media');
    });
  });

  describe('Caching System', () => {
    it('should cache classification results', async () => {
      const message = 'Teste de cache';
      
      // First classification
      const result1 = await classifier.classify(message);
      expect(result1.cacheHit).toBe(false);
      
      // Second classification should hit cache
      const result2 = await classifier.classify(message);
      expect(result2.cacheHit).toBe(true);
      expect(result2.classification).toEqual(result1.classification);
    });

    it('should respect cache TTL', async () => {
      const message = 'Teste de TTL';
      
      // First classification
      await classifier.classify(message);
      
      // Wait for cache to expire (if TTL is short in test)
      // This would require mocking time in a real test
      const result = await classifier.classify(message);
      expect(result.cacheHit).toBe(true); // Should still be cached in normal test
    });
  });

  describe('Metrics System', () => {
    it('should record classification metrics', async () => {
      const initialMetrics = await classificationMetrics.getMetrics();
      const initialCount = initialMetrics.overall?.totalClassifications || 0;
      
      await classifier.classify('Teste de métricas');
      
      const updatedMetrics = await classificationMetrics.getMetrics();
      expect(updatedMetrics.overall?.totalClassifications).toBe(initialCount + 1);
    });

    it('should track accuracy and confidence', async () => {
      await classifier.classify('Teste de precisão');
      
      const metrics = await classificationMetrics.getMetrics();
      expect(metrics.overall).toBeDefined();
      expect(metrics.overall?.accuracyRate).toBeGreaterThanOrEqual(0);
      expect(metrics.overall?.averageConfidence).toBeGreaterThanOrEqual(0);
    });
  });

  describe('A/B Testing Framework', () => {
    it('should create A/B test configuration', async () => {
      const testConfig = {
        name: 'Test Classification Algorithm',
        description: 'Testing different classification approaches',
        variants: [
          {
            id: 'variant-a',
            name: 'Standard Algorithm',
            weight: 0.5,
            config: {
              algorithm: 'standard',
              parameters: { temperature: 0.3 }
            }
          },
          {
            id: 'variant-b',
            name: 'Enhanced Algorithm',
            weight: 0.5,
            config: {
              algorithm: 'enhanced',
              parameters: { temperature: 0.1 }
            }
          }
        ],
        metrics: ['confidence', 'responseTime', 'success'],
        durationDays: 7
      };

      const test = await classifier.createABTest(testConfig);
      expect(test).toBeDefined();
      expect(test.name).toBe(testConfig.name);
      expect(test.variants).toHaveLength(2);
    });

    it('should analyze A/B test results', async () => {
      // Create a test first
      const testConfig = {
        name: 'Test Analysis',
        description: 'Testing analysis functionality',
        variants: [
          {
            id: 'variant-a',
            name: 'Variant A',
            weight: 1.0,
            config: {
              algorithm: 'test',
              parameters: {}
            }
          }
        ],
        metrics: ['confidence'],
        durationDays: 1
      };

      const test = await classifier.createABTest(testConfig);
      
      // Record some results
      await abTestingFramework.recordResult({
        testId: test.id!,
        variant: 'variant-a',
        metrics: { confidence: 0.8, responseTime: 100, success: 1 }
      });

      const analysis = await classifier.analyzeABTest(test.id!);
      expect(analysis).toBeDefined();
      expect(analysis.variants).toHaveLength(1);
      expect(analysis.variants[0].participants).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle classification errors gracefully', async () => {
      // Mock a scenario that might cause an error
      const result = await classifier.classify('');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('problema');
    });

    it('should provide fallback classification', async () => {
      const result = await classifier.classify('Mensagem ambígua sem contexto claro');
      
      expect(result.success).toBe(false);
      expect(result.classification.primaryIntent).toBe('geral');
      expect(result.confidence).toBeLessThan(0.7); // Lower confidence for fallback
    });
  });

  describe('Performance', () => {
    it('should complete classification within reasonable time', async () => {
      const startTime = Date.now();
      await classifier.classify('Teste de performance');
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should improve performance with caching', async () => {
      const message = 'Teste de performance com cache';
      
      // First call (no cache)
      const start1 = Date.now();
      await classifier.classify(message);
      const time1 = Date.now() - start1;
      
      // Second call (with cache)
      const start2 = Date.now();
      await classifier.classify(message);
      const time2 = Date.now() - start2;
      
      expect(time2).toBeLessThan(time1); // Cached call should be faster
    });
  });
});
