"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const HttpException_1 = require("../exceptions/HttpException");
const fs_1 = tslib_1.__importDefault(require("fs"));
class S3PublicService {
    constructor() {
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.AWS_S3_BUCKET) {
            throw new Error('AWS credentials are not properly configured');
        }
        this.s3Client = new client_s3_1.S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
        this.bucket = process.env.AWS_S3_PUBLIC_BUCKET;
        this.region = process.env.AWS_REGION;
    }
    async uploadPublicFile(file, folder = 'uploads') {
        try {
            const key = `${folder}/${Date.now()}-${file.originalname}`;
            let body;
            if (file.buffer) {
                body = file.buffer;
            }
            else if (file.path) {
                if (!fs_1.default.existsSync(file.path)) {
                    throw new Error(`File not found at path: ${file.path}`);
                }
                body = fs_1.default.createReadStream(file.path);
            }
            else {
                throw new Error(`File has neither buffer nor path. File object: ${JSON.stringify({ originalname: file.originalname, mimetype: file.mimetype, size: file.size })}`);
            }
            const upload = new lib_storage_1.Upload({
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
        }
        catch (error) {
            console.error('S3 Public Upload Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new HttpException_1.HttpException(500, `Error uploading file to S3: ${errorMessage}`);
        }
    }
    async uploadFile(file, folder = 'uploads') {
        try {
            const key = `${folder}/${Date.now()}-${file.originalname}`;
            let body;
            if (file.buffer) {
                body = file.buffer;
            }
            else if (file.path) {
                body = fs_1.default.createReadStream(file.path);
            }
            else {
                throw new Error('File has neither buffer nor path');
            }
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: body,
                ContentType: file.mimetype,
            });
            await this.s3Client.send(command);
            const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
            return { key, url };
        }
        catch (error) {
            throw new HttpException_1.HttpException(500, 'Error uploading file to S3');
        }
    }
    async deleteFile(key) {
        try {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            await this.s3Client.send(command);
        }
        catch (error) {
            throw new HttpException_1.HttpException(500, 'Error deleting file from S3');
        }
    }
    async getSignedUrl(key, expiresIn = 604800) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            return await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
        }
        catch (error) {
            throw new HttpException_1.HttpException(500, 'Error generating signed URL');
        }
    }
}
exports.default = new S3PublicService();
//# sourceMappingURL=s3Public.js.map