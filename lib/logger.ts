/**
 * Logger utility for consistent logging across the application
 * Automatically gates console output in production
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
    level: LogLevel;
    message: string;
    data?: unknown;
    timestamp: string;
}

class Logger {
    private isProduction = process.env.NODE_ENV === 'production';

    private formatMessage(level: LogLevel, message: string, data?: unknown): LogEntry {
        return {
            level,
            message,
            data,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Log error messages
     * In production, these should be sent to error tracking service
     */
    error(message: string, error?: unknown): void {
        const entry = this.formatMessage('error', message, error);

        if (!this.isProduction) {
            console.error(`[ERROR] ${entry.timestamp}`, message, error || '');
        }

        // TODO: In production, send to error tracking service (e.g., Sentry)
        // if (this.isProduction && error) {
        //   errorTrackingService.captureException(error, { extra: { message } });
        // }
    }

    /**
     * Log warning messages
     */
    warn(message: string, data?: unknown): void {
        const entry = this.formatMessage('warn', message, data);

        if (!this.isProduction) {
            console.warn(`[WARN] ${entry.timestamp}`, message, data || '');
        }
    }

    /**
     * Log info messages
     */
    info(message: string, data?: unknown): void {
        const entry = this.formatMessage('info', message, data);

        if (!this.isProduction) {
            console.info(`[INFO] ${entry.timestamp}`, message, data || '');
        }
    }

    /**
     * Log debug messages (only in development)
     */
    debug(message: string, data?: unknown): void {
        if (!this.isProduction) {
            const entry = this.formatMessage('debug', message, data);
            console.debug(`[DEBUG] ${entry.timestamp}`, message, data || '');
        }
    }
}

// Export singleton instance
export const logger = new Logger();

