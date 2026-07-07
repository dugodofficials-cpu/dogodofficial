import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { HttpException } from '@backend/exceptions/HttpException';
import fs from 'fs';
class S3Service {
  private s3Client: S3Client;
  private bucket: string;
  private endpoint: string;
  constructor() {
    if (!process.env.STORAGE_API_URL || !process.env.STORAGE_TOKEN_ID || !process.env.STORAGE_TOKEN_SECRET || !process.env.STORAGE_BUCKET_NAME) {
      throw new Error('Storage credentials are not properly configured');
    }
    this.endpoint = process.env.STORAGE_API_URL;
    this.bucket = process.env.STORAGE_BUCKET_NAME;
    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region: 'auto',
      forcePathStyle: false,
      credentials: {
        accessKeyId: process.env.STORAGE_TOKEN_ID,
        secretAccessKey: process.env.STORAGE_TOKEN_SECRET,
      },
      maxAttempts: 5,
    });
  }
  async uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<{ key: string }> {
    try {
      const key = `${folder}/${Date.now()}-${file.originalname}`;
      let body: Buffer | fs.ReadStream;
      if (file.buffer) {
        body = file.buffer;
      } else if (file.path) {
        if (!fs.existsSync(file.path)) {
          throw new Error(`File not found at path: ${file.path}`);
        }
        const stream = fs.createReadStream(file.path, {
          highWaterMark: 16 * 1024 * 1024
        });
        stream.on('error', (err) => {
          console.error('S3Service: Stream error:', err);
        });
        body = stream;
      } else {
        throw new Error(`File has neither buffer nor path. File object: ${JSON.stringify({ originalname: file.originalname, mimetype: file.mimetype, size: file.size })}`);
      }
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: file.mimetype,
        },
        partSize: 50 * 1024 * 1024,
        leavePartsOnError: false,
        queueSize: 4,
      });
      const uploadPromise = upload.done();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout after 10 minutes')), 10 * 60 * 1000);
      });
      await Promise.race([uploadPromise, timeoutPromise]);
      return { key };
    } catch (error) {
      console.error('Storage Upload Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(500, `Error uploading file to storage: ${errorMessage}`);
    }
  }
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.s3Client.send(command);
    } catch (error) {
      throw new HttpException(500, 'Error deleting file from S3');
    }
  }
  async getSignedUrl(key: string, expiresIn: number = 604800): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      throw new HttpException(500, 'Error generating signed URL');
    }
  }
}
export default new S3Service();