import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadDirs = ['uploads/products', 'uploads/avatars', 'uploads/reviews'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';

    if (req.baseUrl.includes('products')) {
      uploadPath += 'products/';
    } else if (req.baseUrl.includes('users')) {
      uploadPath += 'avatars/';
    } else if (req.baseUrl.includes('reviews')) {
      uploadPath += 'reviews/';
    }

    // Use absolute path so multer writes to the same folder served by express
    const fullUploadPath = path.join(__dirname, '..', uploadPath);
    cb(null, fullUploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept any file where the MIME type indicates an image.
  // This allows WebP, SVG, TIFF, HEIC and other image types.
  if (file && file.mimetype && file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed'));
};

// Configure multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 20 * 1024 * 1024 // 20MB default
  },
  fileFilter: fileFilter
});

export const uploadMultiple = upload.array('images', 5);
export const uploadSingle = upload.single('image');