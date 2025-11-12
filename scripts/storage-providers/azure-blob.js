/**
 * Azure Blob Storage Provider for Sanity Backups
 */

const { BlobServiceClient, DefaultAzureCredential } = require('@azure/storage-blob');

class AzureBlobProvider {
  constructor() {
    this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    this.accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    this.accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    
    if (this.connectionString) {
      this.client = BlobServiceClient.fromConnectionString(this.connectionString);
    } else if (this.accountName && this.accountKey) {
      this.client = new BlobServiceClient(
        `https://${this.accountName}.blob.core.windows.net`,
        new DefaultAzureCredential()
      );
    } else {
      throw new Error('Azure storage credentials not configured');
    }
  }

  async upload({ filePath, bucket, key }) {
    const fs = require('fs');
    
    try {
      const containerClient = this.client.getContainerClient(bucket);
      const blockBlobClient = containerClient.getBlockBlobClient(key);
      
      const fileContent = await fs.promises.readFile(filePath);
      
      await blockBlobClient.upload(fileContent, fileContent.length, {
        blobHTTPHeaders: {
          blobContentType: this.getContentType(filePath)
        },
        metadata: {
          'backup-date': new Date().toISOString(),
          'original-filename': require('path').basename(filePath)
        }
      });
      
      return {
        success: true,
        key,
        url: blockBlobClient.url
      };
    } catch (error) {
      throw new Error(`Azure upload failed: ${error.message}`);
    }
  }

  async download({ bucket, key, localPath }) {
    const fs = require('fs');
    
    try {
      const containerClient = this.client.getContainerClient(bucket);
      const blockBlobClient = containerClient.getBlockBlobClient(key);
      
      const downloadResponse = await blockBlobClient.download(0);
      const downloadedContent = await this.streamToBuffer(downloadResponse.readableStreamBody);
      
      await fs.promises.writeFile(localPath, downloadedContent);
      
      const properties = await blockBlobClient.getProperties();
      
      return {
        success: true,
        localPath,
        size: properties.contentLength
      };
    } catch (error) {
      throw new Error(`Azure download failed: ${error.message}`);
    }
  }

  async list({ bucket, prefix, maxKeys = 100 }) {
    try {
      const containerClient = this.client.getContainerClient(bucket);
      const blobs = [];
      
      const listOptions = {
        prefix,
        maxPageSize: maxKeys
      };
      
      for await (const blob of containerClient.listBlobsFlat(listOptions)) {
        blobs.push({
          key: blob.name,
          size: blob.properties.contentLength,
          lastModified: blob.properties.lastModified,
          etag: blob.properties.etag
        });
      }
      
      return blobs;
    } catch (error) {
      throw new Error(`Azure list failed: ${error.message}`);
    }
  }

  async delete({ bucket, key }) {
    try {
      const containerClient = this.client.getContainerClient(bucket);
      const blockBlobClient = containerClient.getBlockBlobClient(key);
      
      await blockBlobClient.delete();
      
      return {
        success: true,
        key
      };
    } catch (error) {
      throw new Error(`Azure delete failed: ${error.message}`);
    }
  }

  async streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on('data', (data) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readableStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      readableStream.on('error', reject);
    });
  }

  getContentType(filePath) {
    const ext = require('path').extname(filePath).toLowerCase();
    const types = {
      '.json': 'application/json',
      '.gz': 'application/gzip',
      '.tar': 'application/x-tar',
      '.zip': 'application/zip'
    };
    return types[ext] || 'application/octet-stream';
  }
}

module.exports = new AzureBlobProvider();
