import { describe, expect, it } from '@jest/globals'

import {
  BACKUP_ASSET_QUERY,
  BACKUP_DOCUMENT_QUERY,
  BACKUP_PERSPECTIVE,
  createBackupClientConfig
} from '../backup-document-scope.js'

describe('backup document scope', () => {
  it('backs up every non-asset document type', () => {
    expect(BACKUP_DOCUMENT_QUERY).toContain('_type != "sanity.imageAsset"')
    expect(BACKUP_DOCUMENT_QUERY).toContain('_type != "sanity.fileAsset"')
    expect(BACKUP_DOCUMENT_QUERY).toContain('order(_createdAt desc)')
    expect(BACKUP_DOCUMENT_QUERY).not.toContain('_type in [')
  })

  it('keeps assets on a dedicated query', () => {
    expect(BACKUP_ASSET_QUERY).toContain('_type == "sanity.imageAsset"')
    expect(BACKUP_ASSET_QUERY).toContain('_type == "sanity.fileAsset"')
    expect(BACKUP_ASSET_QUERY).toContain('order(_createdAt desc)')
  })

  it('uses raw perspective for full-content backups', () => {
    expect(BACKUP_PERSPECTIVE).toBe('raw')

    expect(
      createBackupClientConfig({
        projectId: 'project123',
        dataset: 'production',
        token: 'secret',
        apiVersion: '2025-03-31'
      })
    ).toEqual({
      projectId: 'project123',
      dataset: 'production',
      token: 'secret',
      apiVersion: '2025-03-31',
      perspective: 'raw',
      useCdn: false
    })
  })
})
