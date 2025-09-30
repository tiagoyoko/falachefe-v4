/**
 * Session Performance Monitoring
 * Coleta métricas de performance para operações de sessão
 */

export interface SessionMetrics {
  sessionId: string;
  operation: 'create' | 'update' | 'cleanup' | 'close';
  duration: number;
  timestamp: Date;
  success: boolean;
  error?: string;
  memoryUsage?: number;
}

export class SessionMetricsCollector {
  private static metrics: SessionMetrics[] = [];
  private static readonly MAX_METRICS = 1000; // Limite de métricas em memória

  /**
   * Registra uma métrica de operação de sessão
   */
  static recordMetric(metric: Omit<SessionMetrics, 'timestamp'>): void {
    const fullMetric: SessionMetrics = {
      ...metric,
      timestamp: new Date(),
      memoryUsage: process.memoryUsage().heapUsed
    };

    this.metrics.push(fullMetric);

    // Limita o número de métricas em memória
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Log para monitoramento em tempo real
    console.log(`[SessionMetrics] ${metric.operation} - ${metric.duration}ms - ${metric.success ? 'SUCCESS' : 'FAILED'}`);
  }

  /**
   * Obtém métricas de performance
   */
  static getMetrics(): {
    total: number;
    byOperation: Record<string, { count: number; avgDuration: number; successRate: number }>;
    recentErrors: SessionMetrics[];
    memoryUsage: number;
  } {
    const total = this.metrics.length;
    const byOperation: Record<string, { count: number; avgDuration: number; successRate: number }> = {};
    const recentErrors = this.metrics
      .filter(m => !m.success)
      .slice(-10); // Últimos 10 erros

    // Agrupa por operação
    this.metrics.forEach(metric => {
      if (!byOperation[metric.operation]) {
        byOperation[metric.operation] = { count: 0, avgDuration: 0, successRate: 0 };
      }
      byOperation[metric.operation].count++;
    });

    // Calcula médias e taxas de sucesso
    Object.keys(byOperation).forEach(operation => {
      const operationMetrics = this.metrics.filter(m => m.operation === operation);
      const totalDuration = operationMetrics.reduce((sum, m) => sum + m.duration, 0);
      const successCount = operationMetrics.filter(m => m.success).length;
      
      byOperation[operation].avgDuration = totalDuration / operationMetrics.length;
      byOperation[operation].successRate = (successCount / operationMetrics.length) * 100;
    });

    return {
      total,
      byOperation,
      recentErrors,
      memoryUsage: process.memoryUsage().heapUsed
    };
  }

  /**
   * Limpa métricas antigas (mais de 1 hora)
   */
  static cleanupOldMetrics(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
  }

  /**
   * Obtém alertas de performance
   */
  static getPerformanceAlerts(): string[] {
    const alerts: string[] = [];
    const metrics = this.getMetrics();

    // Alerta para operações lentas
    Object.entries(metrics.byOperation).forEach(([operation, stats]) => {
      if (stats.avgDuration > 5000) { // Mais de 5 segundos
        alerts.push(`${operation} operations are slow: ${stats.avgDuration.toFixed(2)}ms average`);
      }
    });

    // Alerta para baixa taxa de sucesso
    Object.entries(metrics.byOperation).forEach(([operation, stats]) => {
      if (stats.successRate < 95) { // Menos de 95% de sucesso
        alerts.push(`${operation} operations have low success rate: ${stats.successRate.toFixed(2)}%`);
      }
    });

    // Alerta para uso de memória alto
    if (metrics.memoryUsage > 100 * 1024 * 1024) { // Mais de 100MB
      alerts.push(`High memory usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }

    return alerts;
  }
}

/**
 * Decorator para medir performance de métodos
 */
export function measurePerformance(operation: SessionMetrics['operation']) {
  return function (target: unknown, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const startTime = Date.now();
      let success = true;
      let error: string | undefined;

      try {
        const result = await method.apply(this, args);
        return result;
      } catch (err) {
        success = false;
        error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        const duration = Date.now() - startTime;
        SessionMetricsCollector.recordMetric({
          sessionId: String(args[0] || 'unknown'), // Assume primeiro argumento é sessionId
          operation,
          duration,
          success,
          error
        });
      }
    };
  };
}
