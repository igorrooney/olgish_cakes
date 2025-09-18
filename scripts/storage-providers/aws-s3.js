/**
 * AWS S3 Storage Provider for Sanity Backups
 */

const { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');

class AWSS3Provider {
  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION || 'eu-west-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
  }

  async upload({ filePath, bucket, key }) {
    const fs = require('fs');
    
    try {
      const fileContent = await fs.promises.readFile(filePath);
      
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileContent,
        ContentType: this.getContentType(filePath),
        Metadata: {
          'backup-date': new Date().toISOString(),
          'original-filename': require('path').basename(filePath)
        }
      });

      await this.client.send(command);
      
      return {
        success: true,
        key,
        url: `https://${bucket}.s3.${process.env.AWS_REGION || 'eu-west-2'}.amazonaws.com/${key}`
      };
    } catch (error) {
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  async download({ bucket, key, localPath }) {
    const fs = require('fs');
    
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
      });

      const response = await this.client.send(command);
      const chunks = [];
      
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }
      
      const fileContent = Buffer.concat(chunks);
      await fs.promises.writeFile(localPath, fileContent);
      
      return {
        success: true,
        localPath,
        size: fileContent.length
      };
    } catch (error) {
      throw new Error(`S3 download failed: ${error.message}`);
    }
  }

  async list({ bucket, prefix, maxKeys = 100 }) {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: maxKeys
      });

      const response = await this.client.send(command);
      
      return (response.Contents || []).map(item => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        etag: item.ETag
      }));
    } catch (error) {
      throw new Error(`S3 list failed: ${error.message}`);
    }
  }

  async delete({ bucket, key }) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key
      });

      await this.client.send(command);
      
      return {
        success: true,
        key
      };
    } catch (error) {
      throw new Error(`S3 delete failed: ${error.message}`);
    }
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

module.exports = new AWSS3Provider();
