import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { HttpException } from '@exceptions/HttpException';
import fs from 'fs';
class S3Service {
  private s3Client: S3Client;
  private bucket: string;
  private region: string;
  constructor() {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.AWS_S3_BUCKET) {
      throw new Error('AWS credentials are not properly configured');
    }
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      maxAttempts: 5,
    });
    this.bucket = process.env.AWS_S3_BUCKET;
    this.region = process.env.AWS_REGION;
  }
  async uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<{ key: string; url: string }> {
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
      const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
      return { key, url };
    } catch (error) {
      console.error('S3 Upload Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(500, `Error uploading file to S3: ${errorMessage}`);
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