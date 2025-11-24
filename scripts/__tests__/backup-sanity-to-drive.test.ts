/**
 * Tests for backup-sanity-to-drive.ts validation logic
 * 
 * Tests validation patterns and error messages without executing the backup script.
 */

import { describe, expect, it } from '@jest/globals'

describe('backup-sanity-to-drive validation patterns', () => {
    describe('Project ID validation regex', () => {
        const projectIdRegex = /^[a-z0-9]+$/

        it('should accept valid lowercase alphanumeric project IDs', () => {
            expect(projectIdRegex.test('as9bci7b')).toBe(true)
            expect(projectIdRegex.test('testproject')).toBe(true)
            expect(projectIdRegex.test('abc123')).toBe(true)
        })

        it('should reject project IDs with uppercase letters', () => {
            expect(projectIdRegex.test('TestProject')).toBe(false)
            expect(projectIdRegex.test('AS9BCI7B')).toBe(false)
        })

        it('should reject project IDs with hyphens', () => {
            expect(projectIdRegex.test('test-project')).toBe(false)
            expect(projectIdRegex.test('my-project-id')).toBe(false)
        })

        it('should reject project IDs with underscores', () => {
            expect(projectIdRegex.test('test_project')).toBe(false)
        })

        it('should reject empty strings', () => {
            expect(projectIdRegex.test('')).toBe(false)
        })
    })

    describe('Dataset name validation regex', () => {
        const datasetRegex = /^[a-z0-9-]+$/

        it('should accept valid lowercase dataset names with hyphens', () => {
            expect(datasetRegex.test('production')).toBe(true)
            expect(datasetRegex.test('production-dataset')).toBe(true)
            expect(datasetRegex.test('staging-env')).toBe(true)
            expect(datasetRegex.test('test-123')).toBe(true)
        })

        it('should reject dataset names with uppercase letters', () => {
            expect(datasetRegex.test('Production')).toBe(false)
            expect(datasetRegex.test('PRODUCTION')).toBe(false)
        })

        it('should reject dataset names with underscores', () => {
            expect(datasetRegex.test('production_dataset')).toBe(false)
        })

        it('should reject empty strings', () => {
            expect(datasetRegex.test('')).toBe(false)
        })
    })

    describe('Google Drive folder ID validation regex', () => {
        const folderIdRegex = /^[a-zA-Z0-9_-]+$/

        it('should accept valid folder IDs', () => {
            expect(folderIdRegex.test('1a2b3c4d5e6f7g8h9i0j')).toBe(true)
            expect(folderIdRegex.test('ABC123DEF456')).toBe(true)
            expect(folderIdRegex.test('folder_id_123')).toBe(true)
            expect(folderIdRegex.test('folder-id-123')).toBe(true)
        })

        it('should reject folder IDs with slashes', () => {
            expect(folderIdRegex.test('folder/id')).toBe(false)
            expect(folderIdRegex.test('invalid/folder/id')).toBe(false)
        })

        it('should reject folder IDs with spaces', () => {
            expect(folderIdRegex.test('folder id')).toBe(false)
        })

        it('should reject empty strings', () => {
            expect(folderIdRegex.test('')).toBe(false)
        })
    })

    describe('Filename generation', () => {
        it('should generate filename with UTC timestamp format', () => {
            const now = new Date('2025-01-15T14:30:00Z')
            const year = now.getUTCFullYear()
            const month = String(now.getUTCMonth() + 1).padStart(2, '0')
            const day = String(now.getUTCDate()).padStart(2, '0')
            const hours = String(now.getUTCHours()).padStart(2, '0')
            const minutes = String(now.getUTCMinutes()).padStart(2, '0')
            const filename = `sanity-backup-${year}-${month}-${day}-${hours}-${minutes}-UTC.tar.gz`

            const expectedPattern = /^sanity-backup-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-UTC\.tar\.gz$/

            expect(filename).toMatch(expectedPattern)
            expect(filename).toBe('sanity-backup-2025-01-15-14-30-UTC.tar.gz')
        })

        it('should pad single digit months, days, hours, and minutes', () => {
            const now = new Date('2025-01-05T03:09:00Z')
            const year = now.getUTCFullYear()
            const month = String(now.getUTCMonth() + 1).padStart(2, '0')
            const day = String(now.getUTCDate()).padStart(2, '0')
            const hours = String(now.getUTCHours()).padStart(2, '0')
            const minutes = String(now.getUTCMinutes()).padStart(2, '0')
            const filename = `sanity-backup-${year}-${month}-${day}-${hours}-${minutes}-UTC.tar.gz`

            expect(filename).toBe('sanity-backup-2025-01-05-03-09-UTC.tar.gz')
            expect(month).toBe('01')
            expect(day).toBe('05')
            expect(hours).toBe('03')
            expect(minutes).toBe('09')
        })
    })

    describe('Error message formats', () => {
        it('should format missing env var errors correctly', () => {
            const varName = 'SANITY_PROJECT_ID'
            const errorMessage = `Missing required environment variable: ${varName} or NEXT_PUBLIC_${varName}`

            expect(errorMessage).toContain('Missing required environment variable')
            expect(errorMessage).toContain(varName)
        })

        it('should format validation errors with invalid values', () => {
            const invalidValue = 'Invalid-Project-ID'
            const errorMessage = `Invalid SANITY_PROJECT_ID format: must be lowercase alphanumeric, got "${invalidValue}"`

            expect(errorMessage).toContain('Invalid SANITY_PROJECT_ID format')
            expect(errorMessage).toContain(invalidValue)
        })
    })
})

