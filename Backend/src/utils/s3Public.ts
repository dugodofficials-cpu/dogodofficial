import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { HttpException } from '@exceptions/HttpException';
import fs from 'fs';
class S3PublicService {
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
    });
    this.bucket = process.env.AWS_S3_PUBLIC_BUCKET;
    this.region = process.env.AWS_REGION;
  }
  async uploadPublicFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<{ key: string; url: string }> {
    try {
      const key = `${folder}/${Date.now()}-${file.originalname}`;
      let body: Buffer | fs.ReadStream;
      if (file.buffer) {
        body = file.buffer;
      } else if (file.path) {
        if (!fs.existsSync(file.path)) {
          throw new Error(`File not found at path: ${file.path}`);
        }
        body = fs.createReadStream(file.path);
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
        partSize: 100 * 1024 * 1024,
        leavePartsOnError: false,
      });
      await upload.done();
      const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
      return { key, url };
    } catch (error) {
      console.error('S3 Public Upload Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(500, `Error uploading file to S3: ${errorMessage}`);
    }
  }
  async uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<{ key: string; url: string }> {
    try {
      const key = `${folder}/${Date.now()}-${file.originalname}`;
      let body: Buffer | fs.ReadStream;
      if (file.buffer) {
        body = file.buffer;
      } else if (file.path) {
        body = fs.createReadStream(file.path);
      } else {
        throw new Error('File has neither buffer nor path');
      }
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: file.mimetype,
      });
      await this.s3Client.send(command);
      const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
      return { key, url };
    } catch (error) {
      throw new HttpException(500, 'Error uploading file to S3');
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
export default new S3PublicService();