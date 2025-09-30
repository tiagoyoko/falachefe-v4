/**
 * Classification Cache System
 * 
 * In-memory cache for classification results to improve performance
 * and reduce API calls to OpenAI
 */

import { ClassificationRecord } from './classification-metrics';

export interface CacheEntry {
  result: ClassificationRecord;
  timestamp: number;
  hits: number;
  ttl: number; // Time to live in milliseconds
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  memoryUsage: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}

export class ClassificationCache {
  private static instance: ClassificationCache;
  private cache = new Map<string, CacheEntry>();
  private stats = {
    hits: 0,
    misses: 0,
    totalRequests: 0
  };
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxSize = 1000; // Maximum number of entries
  private cleanupInterval: NodeJS.Timeout | null = null;

  static getInstance(): ClassificationCache {
    if (!ClassificationCache.instance) {
      ClassificationCache.instance = new ClassificationCache();
    }
    return ClassificationCache.instance;
  }

  constructor() {
    // Start cleanup interval (every minute)
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  /**
   * Generate cache key from query and context
   */
  private generateKey(query: string, context?: Record<string, any>): string {
    const normalizedQuery = query.toLowerCase().trim();
    const contextStr = context ? JSON.stringify(context) : '';
    return `${normalizedQuery}:${contextStr}`;
  }

  /**
   * Get cached classification result
   */
  get(query: string, context?: Record<string, any>): ClassificationRecord | null {
    this.stats.totalRequests++;
    
    const key = this.generateKey(query, context);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update hit count and return result
    entry.hits++;
    this.stats.hits++;
    
    return {
      ...entry.result,
      cacheHit: true
    };
  }

  /**
   * Store classification result in cache
   */
  set(
    query: string, 
    result: ClassificationRecord, 
    context?: Record<string, any>,
    ttl?: number
  ): void {
    const key = this.generateKey(query, context);
    const now = Date.now();

    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry = {
      result: {
        ...result,
        cacheHit: false // This will be set to true when retrieved
      },
      timestamp: now,
      hits: 0,
      ttl: ttl || this.defaultTTL
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if query is cached
   */
  has(query: string, context?: Record<string, any>): boolean {
    const key = this.generateKey(query, context);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove specific entry from cache
   */
  delete(query: string, context?: Record<string, any>): boolean {
    const key = this.generateKey(query, context);
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0
    };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const timestamps = entries.map(e => e.timestamp);
    
    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: this.stats.totalRequests > 0 
        ? this.stats.hits / this.stats.totalRequests 
        : 0,
      memoryUsage: this.estimateMemoryUsage(),
      oldestEntry: timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null,
      newestEntry: timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null
    };
  }

  /**
   * Get cache entries by pattern
   */
  getEntriesByPattern(pattern: RegExp): Array<{ key: string; entry: CacheEntry }> {
    const results: Array<{ key: string; entry: CacheEntry }> = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (pattern.test(key)) {
        results.push({ key, entry });
      }
    }
    
    return results;
  }

  /**
   * Warm up cache with common queries
   */
  async warmup(queries: Array<{ query: string; context?: Record<string, any> }>): Promise<void> {
    // This would typically pre-populate cache with common queries
    // Implementation depends on specific use case
    console.log(`Warming up cache with ${queries.length} queries`);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired cache entries`);
    }
  }

  /**
   * Evict oldest entry when cache is full
   */
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Estimate memory usage of cache
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      // Rough estimation: key length + result size + metadata
      totalSize += key.length * 2; // 2 bytes per character (UTF-16)
      totalSize += JSON.stringify(entry.result).length * 2;
      totalSize += 32; // Metadata overhead
    }
    
    return totalSize;
  }

  /**
   * Destroy cache and cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Export singleton instance
export const classificationCache = ClassificationCache.getInstance();
