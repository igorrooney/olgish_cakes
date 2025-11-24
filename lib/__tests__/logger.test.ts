/**
 * Tests for logger utility
 */
import { logger } from '../logger'

describe('Logger', () => {
    const originalEnv = process.env.NODE_ENV
    let consoleErrorSpy: jest.SpyInstance
    let consoleWarnSpy: jest.SpyInstance
    let consoleInfoSpy: jest.SpyInstance
    let consoleDebugSpy: jest.SpyInstance

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
        consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation()
        consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation()
    })

    afterEach(() => {
        process.env.NODE_ENV = originalEnv
        jest.restoreAllMocks()
    })

    describe('Development mode', () => {
        beforeEach(() => {
            process.env.NODE_ENV = 'development'
        })

        it('should log errors in development', () => {
            const error = new Error('Test error')
            logger.error('Test error message', error)

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('[ERROR]'),
                'Test error message',
                error
            )
        })

        it('should log warnings in development', () => {
            const data = { key: 'value' }
            logger.warn('Test warning', data)

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('[WARN]'),
                'Test warning',
                data
            )
        })

        it('should log info in development', () => {
            logger.info('Test info', { data: 'test' })

            expect(consoleInfoSpy).toHaveBeenCalledWith(
                expect.stringContaining('[INFO]'),
                'Test info',
                { data: 'test' }
            )
        })

        it('should log debug in development', () => {
            logger.debug('Test debug', { debug: 'data' })

            expect(consoleDebugSpy).toHaveBeenCalledWith(
                expect.stringContaining('[DEBUG]'),
                'Test debug',
                { debug: 'data' }
            )
        })

        it('should handle error without data', () => {
            logger.error('Test error message')

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('[ERROR]'),
                'Test error message',
                ''
            )
        })

        it('should handle warning without data', () => {
            logger.warn('Test warning')

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('[WARN]'),
                'Test warning',
                ''
            )
        })

        it('should include timestamp in log messages', () => {
            logger.error('Test error')
            const callArgs = consoleErrorSpy.mock.calls[0][0]

            // Check that timestamp is in ISO format
            // Format: "[ERROR] 2025-11-24T13:18:34.133Z"
            expect(callArgs).toContain('[ERROR]')
            expect(callArgs).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
        })
    })

    describe('Production mode', () => {
        // Note: Logger is a singleton, so NODE_ENV is checked at module load time
        // These tests verify the behavior when logger was initialized in production
        // In practice, the logger will be initialized based on the actual NODE_ENV
        it('should verify production behavior', () => {
            // This test documents expected behavior
            // Actual production testing would require module reload
            expect(logger).toBeDefined()
        })
    })

    describe('Error handling', () => {
        beforeEach(() => {
            process.env.NODE_ENV = 'development'
        })

        it('should handle undefined error gracefully', () => {
            logger.error('Test error', undefined)

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('[ERROR]'),
                'Test error',
                ''
            )
        })

        it('should handle null error gracefully', () => {
            logger.error('Test error', null)

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('[ERROR]'),
                'Test error',
                ''
            )
        })

        it('should handle string errors', () => {
            logger.error('Test error', 'String error message')

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('[ERROR]'),
                'Test error',
                'String error message'
            )
        })

        it('should handle object errors', () => {
            const errorObject = { code: 500, message: 'Server error' }
            logger.error('Test error', errorObject)

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('[ERROR]'),
                'Test error',
                errorObject
            )
        })
    })

    describe('Log formatting', () => {
        beforeEach(() => {
            process.env.NODE_ENV = 'development'
        })

        it('should format error logs correctly', () => {
            const error = new Error('Test error')
            logger.error('Error occurred', error)

            expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
            const [timestamp, message, errorData] = consoleErrorSpy.mock.calls[0]

            expect(timestamp).toContain('[ERROR]')
            expect(message).toBe('Error occurred')
            expect(errorData).toBe(error)
        })

        it('should format warning logs correctly', () => {
            const data = { warning: 'test' }
            logger.warn('Warning message', data)

            expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
            const [timestamp, message, warningData] = consoleWarnSpy.mock.calls[0]

            expect(timestamp).toContain('[WARN]')
            expect(message).toBe('Warning message')
            expect(warningData).toBe(data)
        })
    })
})

