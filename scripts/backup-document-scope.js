export const BACKUP_DOCUMENT_QUERY = '*[_type != "sanity.imageAsset" && _type != "sanity.fileAsset"] | order(_createdAt desc)'

export const BACKUP_ASSET_QUERY = '*[_type == "sanity.imageAsset" || _type == "sanity.fileAsset"] | order(_createdAt desc)'

export const BACKUP_PERSPECTIVE = 'raw'

export function createBackupClientConfig(config) {
  return {
    projectId: config.projectId,
    dataset: config.dataset,
    token: config.token,
    apiVersion: config.apiVersion,
    perspective: BACKUP_PERSPECTIVE,
    useCdn: false
  }
}
