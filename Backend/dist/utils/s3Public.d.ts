/// <reference types="multer" />
declare class S3PublicService {
    private s3Client;
    private bucket;
    private region;
    constructor();
    uploadPublicFile(file: Express.Multer.File, folder?: string): Promise<{
        key: string;
        url: string;
    }>;
    uploadFile(file: Express.Multer.File, folder?: string): Promise<{
        key: string;
        url: string;
    }>;
    deleteFile(key: string): Promise<void>;
    getSignedUrl(key: string, expiresIn?: number): Promise<string>;
}
declare const _default: S3PublicService;
export default _default;
