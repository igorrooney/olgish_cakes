/**
 * Tests for logger utility
 */
import { logger, toSafeLogMetadata } from '../logger'

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
            const error = new Error('PRIVATE_SENTINEL')
            logger.error('Test error message', error)

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('[ERROR]'),
                { code: 'OPERATION_FAILED' }
            )
            expect(JSON.stringify(consoleErrorSpy.mock.calls)).not.toContain('PRIVATE_SENTINEL')
        })

        it('should log warnings in development', () => {
            const data = { key: 'value' }
            logger.warn('Test warning', data)

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('[WARN]'),
                ''
            )
        })

        it('should log info in development', () => {
            logger.info('Test info', { data: 'test' })

            expect(consoleInfoSpy).toHaveBeenCalledWith(
                expect.stringContaining('[INFO]'),
                ''
            )
        })

        it('should log debug in development', () => {
            logger.debug('Test debug', { debug: 'data' })

            expect(consoleDebugSpy).toHaveBeenCalledWith(
                expect.stringContaining('[DEBUG]'),
                ''
            )
        })

        it('should handle error without data', () => {
            logger.error('Test error message')

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('[ERROR]'),
                ''
            )
        })

        it('should handle warning without data', () => {
            logger.warn('Test warning')

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('[WARN]'),
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
        it('keeps operational error logging privacy-safe', () => {
            process.env.NODE_ENV = 'production'

            logger.error('PRIVATE_PRODUCTION_MESSAGE', {
                operation: 'orders.persist',
                code: 'DB_FAILED',
                payload: 'PRIVATE_PRODUCTION_PAYLOAD'
            })

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('[ERROR]'),
                {
                    operation: 'orders.persist',
                    code: 'DB_FAILED'
                }
            )
            expect(JSON.stringify(consoleErrorSpy.mock.calls)).not.toContain('PRIVATE_PRODUCTION')
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
                ''
            )
        })

        it('should handle null error gracefully', () => {
            logger.error('Test error', null)

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('[ERROR]'),
                ''
            )
        })

        it('should handle string errors', () => {
            logger.error('Test error', 'String error message')

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('[ERROR]'),
                { code: 'OPERATION_FAILED' }
            )
        })

        it('should handle object errors', () => {
            const errorObject = { code: 500, message: 'Server error' }
            logger.error('Test error', errorObject)

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('[ERROR]'),
                { code: 'OPERATION_FAILED' }
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
            const [timestamp, errorData] = consoleErrorSpy.mock.calls[0]

            expect(timestamp).toContain('[ERROR]')
            expect(errorData).toEqual({ code: 'OPERATION_FAILED' })
        })

        it('should format warning logs correctly', () => {
            const data = { warning: 'test' }
            logger.warn('Warning message', data)

            expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
            const [timestamp, warningData] = consoleWarnSpy.mock.calls[0]

            expect(timestamp).toContain('[WARN]')
            expect(warningData).toBe('')
        })
    })

    describe('Privacy-safe metadata', () => {
        it('never emits the caller-provided message', () => {
            const sentinel = 'PRIVATE_CALLER_MESSAGE_SENTINEL'

            logger.error(sentinel, {
                operation: 'contact.persist',
                code: 'DB_FAILED'
            })

            expect(JSON.stringify(consoleErrorSpy.mock.calls)).not.toContain(sentinel)
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('[ERROR]'),
                {
                    operation: 'contact.persist',
                    code: 'DB_FAILED'
                }
            )
        })

        it('retains only allowlisted operational fields', () => {
            const sentinel = 'PRIVATE_HEALTH_SENTINEL'

            expect(toSafeLogMetadata({
                operation: 'contact.persist',
                code: 'DB_FAILED',
                status: 503,
                recordReference: 'CONTACT-123',
                message: sentinel,
                details: sentinel,
                payload: { dietaryHealthInformation: sentinel }
            }, true)).toEqual({
                operation: 'contact.persist',
                code: 'DB_FAILED',
                status: 503,
                recordReference: 'CONTACT-123'
            })
        })

        it('rejects unsafe operation and record-reference values', () => {
            expect(toSafeLogMetadata({
                operation: 'contact persist PRIVATE_SENTINEL',
                recordReference: 'CONTACT/PRIVATE_SENTINEL',
                code: 'SAFE_CODE'
            }, true)).toEqual({ code: 'SAFE_CODE' })
        })
    })
})

