/**
 * Google Cloud Storage Provider for Sanity Backups
 */

const { Storage } = require('@google-cloud/storage');

class GCPStorageProvider {
  constructor() {
    this.storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
      credentials: process.env.GOOGLE_CLOUD_CREDENTIALS ? JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS) : undefined
    });
  }

  async upload({ filePath, bucket, key }) {
    
    try {
      const bucketObj = this.storage.bucket(bucket);
      const file = bucketObj.file(key);
      
      await file.upload(filePath, {
        metadata: {
          metadata: {
            'backup-date': new Date().toISOString(),
            'original-filename': require('path').basename(filePath)
          }
        }
      });

      await file.makePublic();
      
      return {
        success: true,
        key,
        url: `https://storage.googleapis.com/${bucket}/${key}`
      };
    } catch (error) {
      throw new Error(`GCP upload failed: ${error.message}`);
    }
  }

  async download({ bucket, key, localPath }) {
    
    try {
      const bucketObj = this.storage.bucket(bucket);
      const file = bucketObj.file(key);
      
      await file.download({ destination: localPath });
      
      const [metadata] = await file.getMetadata();
      
      return {
        success: true,
        localPath,
        size: parseInt(metadata.size)
      };
    } catch (error) {
      throw new Error(`GCP download failed: ${error.message}`);
    }
  }

  async list({ bucket, prefix, maxKeys = 100 }) {
    try {
      const bucketObj = this.storage.bucket(bucket);
      const [files] = await bucketObj.getFiles({
        prefix,
        maxResults: maxKeys
      });
      
      return files.map(file => ({
        key: file.name,
        size: parseInt(file.metadata.size || 0),
        lastModified: new Date(file.metadata.timeCreated),
        etag: file.metadata.etag
      }));
    } catch (error) {
      throw new Error(`GCP list failed: ${error.message}`);
    }
  }

  async delete({ bucket, key }) {
    try {
      const bucketObj = this.storage.bucket(bucket);
      const file = bucketObj.file(key);
      
      await file.delete();
      
      return {
        success: true,
        key
      };
    } catch (error) {
      throw new Error(`GCP delete failed: ${error.message}`);
    }
  }
}

module.exports = new GCPStorageProvider();
