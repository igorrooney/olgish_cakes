/**
 * Performance logging utility for structured data generation
 * Provides consistent timing and performance tracking across components
 */

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

class PerformanceLogger {
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Start a performance timer
   * @param name - Unique identifier for this measurement
   */
  start(name: string): void {
    this.timers.set(name, performance.now());
  }

  /**
   * End a performance timer and optionally log the result
   * @param name - Timer identifier (must match the start() call)
   * @param metadata - Optional metadata to include with the metric
   * @param logImmediately - Whether to log immediately (default: true in development)
   * @returns Duration in milliseconds
   */
  end(name: string, metadata?: Record<string, unknown>, logImmediately = !this.isProduction): number {
    const startTime = this.timers.get(name);
    
    if (!startTime) {
      if (!this.isProduction) {
        console.warn(`[Performance] No start time found for "${name}"`);
      }
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);

    if (logImmediately && !this.isProduction) {
      const metadataStr = metadata ? ` (${JSON.stringify(metadata)})` : '';
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms${metadataStr}`);
    }

    return duration;
  }

  /**
   * Measure execution time of an async function
   * @param name - Name for this measurement
   * @param fn - Async function to measure
   * @param metadata - Optional metadata
   * @returns Result of the function
   */
  async measure<T>(
    name: string, 
    fn: () => Promise<T>, 
    metadata?: Record<string, unknown>
  ): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name, metadata);
      return result;
    } catch (error) {
      this.end(name, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics summary with statistics
   */
  getSummary(): {
    total: number;
    average: number;
    min: number;
    max: number;
    metrics: PerformanceMetric[];
  } {
    if (this.metrics.length === 0) {
      return { total: 0, average: 0, min: 0, max: 0, metrics: [] };
    }

    const durations = this.metrics.map(m => m.duration);
    const total = durations.reduce((sum, d) => sum + d, 0);

    return {
      total,
      average: total / this.metrics.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      metrics: this.metrics
    };
  }

  /**
   * Log a summary of all metrics
   */
  logSummary(): void {
    if (this.isProduction) return;

    const summary = this.getSummary();
    
    console.log('\n' + '='.repeat(60));
    console.log('⚡ PERFORMANCE SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total operations:  ${this.metrics.length}`);
    console.log(`Total time:        ${summary.total.toFixed(2)}ms`);
    console.log(`Average:           ${summary.average.toFixed(2)}ms`);
    console.log(`Min:               ${summary.min.toFixed(2)}ms`);
    console.log(`Max:               ${summary.max.toFixed(2)}ms`);
    console.log('='.repeat(60) + '\n');

    if (this.metrics.length > 0) {
      console.log('📊 Individual Metrics:');
      this.metrics.forEach(metric => {
        const metadataStr = metric.metadata ? ` ${JSON.stringify(metric.metadata)}` : '';
        console.log(`  • ${metric.name}: ${metric.duration.toFixed(2)}ms${metadataStr}`);
      });
      console.log('');
    }
  }

  /**
   * Clear all recorded metrics
   */
  clear(): void {
    this.metrics = [];
    this.timers.clear();
  }

  /**
   * Check if any metric exceeds a threshold and log warnings
   * @param thresholds - Map of metric names to threshold values in ms
   */
  checkThresholds(thresholds: Record<string, number>): boolean {
    if (this.isProduction) return true;

    let allWithinThreshold = true;

    for (const metric of this.metrics) {
      const threshold = thresholds[metric.name];
      if (threshold && metric.duration > threshold) {
        console.warn(
          `⚠️  [Performance] "${metric.name}" exceeded threshold: ${metric.duration.toFixed(2)}ms > ${threshold}ms`
        );
        allWithinThreshold = false;
      }
    }

    return allWithinThreshold;
  }
}

// Singleton instance
export const perfLogger = new PerformanceLogger();

// Export convenience functions
export const startTimer = perfLogger.start.bind(perfLogger);
export const endTimer = perfLogger.end.bind(perfLogger);
export const measureAsync = perfLogger.measure.bind(perfLogger);
export const getPerformanceMetrics = perfLogger.getMetrics.bind(perfLogger);
export const logPerformanceSummary = perfLogger.logSummary.bind(perfLogger);
export const clearPerformanceMetrics = perfLogger.clear.bind(perfLogger);
export const checkPerformanceThresholds = perfLogger.checkThresholds.bind(perfLogger);

