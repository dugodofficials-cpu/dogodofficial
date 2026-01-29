"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupTempFiles = void 0;
const tslib_1 = require("tslib");
const multer_1 = tslib_1.__importDefault(require("multer"));
const HttpException_1 = require("../exceptions/HttpException");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const os_1 = tslib_1.__importDefault(require("os"));
const uploadDir = path_1.default.join(os_1.default.tmpdir(), 'dugod-uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
        },
    }),
    limits: {
        fileSize: 3 * 1024 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/') ||
            file.mimetype.startsWith('image/') ||
            file.mimetype === 'application/pdf' ||
            file.mimetype === 'application/epub+zip' ||
            file.mimetype === 'application/x-mobipocket-ebook' ||
            file.mimetype === 'application/vnd.amazon.ebook') {
            cb(null, true);
        }
        else {
            cb(new Error('Only audio files, images, and ebook files (PDF, EPUB, MOBI) are allowed'));
        }
    }
});
const handleMulterUpload = (req, res, next) => {
    console.error('[UPLOAD DEBUG] Multer middleware started', {
        contentType: req.headers['content-type'],
        contentLength: req.headers['content-length'],
        timestamp: new Date().toISOString()
    });
    const uploadMiddleware = upload.fields([
        { name: 'audio', maxCount: 1 },
        { name: 'audioFile', maxCount: 1 },
        { name: 'image', maxCount: 1 },
        { name: 'images', maxCount: 1 },
        { name: 'imageFile', maxCount: 1 },
        { name: 'downloadUrl', maxCount: 1 },
        { name: 'downloadFile', maxCount: 1 },
        { name: 'bookCoverArt', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 },
    ]);
    uploadMiddleware(req, res, (err) => {
        var _a, _b, _c, _d;
        console.error('[UPLOAD DEBUG] Multer callback invoked', {
            hasError: !!err,
            hasFiles: !!req.files,
            fileCount: req.files ? Object.keys(req.files).length : 0,
            timestamp: new Date().toISOString()
        });
        if (err instanceof multer_1.default.MulterError) {
            console.error('UploadMiddleware: Multer error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(new HttpException_1.HttpException(400, 'File is too large. Maximum size is 3GB'));
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return next(new HttpException_1.HttpException(400, 'Wrong field name. Use "audio", "audioFile", "image" or "imageFile"'));
            }
            return next(new HttpException_1.HttpException(400, `Upload error: ${err.message}`));
        }
        else if (err) {
            console.error('UploadMiddleware: Unknown upload error:', err);
            return next(new HttpException_1.HttpException(400, err.message));
        }
        if (req.files) {
            const file = ((_a = req.files['audio']) === null || _a === void 0 ? void 0 : _a[0]) || ((_b = req.files['audioFile']) === null || _b === void 0 ? void 0 : _b[0]) || ((_c = req.files['image']) === null || _c === void 0 ? void 0 : _c[0]) || ((_d = req.files['imageFile']) === null || _d === void 0 ? void 0 : _d[0]);
            if (file) {
                req.file = file;
            }
        }
        next();
    });
};
const cleanupTempFiles = (files) => {
    if (!files)
        return;
    let fileArray = [];
    if (Array.isArray(files)) {
        fileArray = files;
    }
    else if (files instanceof Object && 'path' in files) {
        fileArray = [files];
    }
    else if (typeof files === 'object') {
        Object.values(files).forEach(fieldFiles => {
            if (Array.isArray(fieldFiles)) {
                fileArray.push(...fieldFiles);
            }
        });
    }
    fileArray.forEach(file => {
        if (file.path && fs_1.default.existsSync(file.path)) {
            fs_1.default.unlink(file.path, (err) => {
                if (err)
                    console.error('Error deleting temp file:', err);
            });
        }
    });
};
exports.cleanupTempFiles = cleanupTempFiles;
exports.default = handleMulterUpload;
//# sourceMappingURL=upload.middleware.js.map