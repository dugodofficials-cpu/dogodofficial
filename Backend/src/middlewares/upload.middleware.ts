import multer from 'multer';
import { HttpException } from '@exceptions/HttpException';
import path from 'path';
import fs from 'fs';
import os from 'os';
const uploadDir = path.join(os.tmpdir(), 'dugod-uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 3 * 1024 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith('audio/') ||
      file.mimetype.startsWith('image/') ||
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/epub+zip' ||
      file.mimetype === 'application/x-mobipocket-ebook' ||
      file.mimetype === 'application/vnd.amazon.ebook'
    ) {
      cb(null, true);
    } else {
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
    { name: 'audios', maxCount: 500 },
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 1 },
    { name: 'imageFile', maxCount: 1 },
    { name: 'downloadUrl', maxCount: 1 },
    { name: 'downloadFile', maxCount: 1 },
    { name: 'bookCoverArt', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 },
  ]);
  uploadMiddleware(req, res, (err) => {
    console.error('[UPLOAD DEBUG] Multer callback invoked', {
      hasError: !!err,
      hasFiles: !!req.files,
      fileCount: req.files ? Object.keys(req.files).length : 0,
      timestamp: new Date().toISOString()
    });
    if (err instanceof multer.MulterError) {
      console.error('UploadMiddleware: Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new HttpException(400, 'File is too large. Maximum size is 3GB'));
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new HttpException(400, 'Wrong field name. Use "audio", "audioFile", "audios", "image" or "imageFile"'));
      }
      return next(new HttpException(400, `Upload error: ${err.message}`));
    } else if (err) {
      console.error('UploadMiddleware: Unknown upload error:', err);
      return next(new HttpException(400, err.message));
    }
    if (req.files) {
      const file = req.files['audio']?.[0] || req.files['audioFile']?.[0] || req.files['audios']?.[0] || req.files['image']?.[0] || req.files['imageFile']?.[0] || req.files['profilePicture']?.[0];
      if (file) {
        req.file = file;
      }
    }
    next();
  });
};
export const cleanupTempFiles = (files: Express.Multer.File | Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined) => {
  if (!files) return;
  let fileArray: Express.Multer.File[] = [];
  if (Array.isArray(files)) {
    fileArray = files;
  } else if (files instanceof Object && 'path' in files) {
    fileArray = [files as Express.Multer.File];
  } else if (typeof files === 'object') {
    Object.values(files).forEach(fieldFiles => {
      if (Array.isArray(fieldFiles)) {
        fileArray.push(...fieldFiles);
      }
    });
  }
  fileArray.forEach(file => {
    if (file.path && fs.existsSync(file.path)) {
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });
    }
  });
};
export default handleMulterUpload;
