import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { HttpException } from '@backend/exceptions/HttpException';
import fs from 'fs';
class S3PublicService {
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
    });
  }
  // Objects in this bucket are not publicly readable; callers must store the
  // returned key and resolve it to a fresh signed URL at serve time (see
  // @backend/middlewares/signPublicUrls.middleware).
  async uploadPublicFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<{ key: string }> {
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
      return { key };
    } catch (error) {
      console.error('S3 Public Upload Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(500, `Error uploading file to S3: ${errorMessage}`);
    }
  }
  async uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<{ key: string }> {
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
      return { key };
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
  // Lets a client upload a file directly to storage (bypassing the Vercel
  // serverless function's ~4.5MB request-body cap, which is a hard platform
  // limit — routing file bytes through the function at all can never work
  // for anything much bigger than that, no matter what multer allows).
  async getPresignedUploadUrl(key: string, contentType: string, expiresIn: number = 300): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      throw new HttpException(500, 'Error generating upload URL');
    }
  }
}
export default new S3PublicService();