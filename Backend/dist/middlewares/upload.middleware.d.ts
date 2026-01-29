/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="multer" />
declare const handleMulterUpload: (req: any, res: any, next: any) => void;
export declare const cleanupTempFiles: (files: Express.Multer.File | Express.Multer.File[] | {
    [fieldname: string]: Express.Multer.File[];
}) => void;
export default handleMulterUpload;
