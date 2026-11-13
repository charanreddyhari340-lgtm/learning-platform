const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadsPath, documentsPath, videosPath, imagesPath } = require('../config/uploads');

// Ensure upload subdirectories exist
[uploadsPath, documentsPath, videosPath, imagesPath].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure Multer storage
const createStorage = (targetDir) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e5)}`;
      cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
    },
  });

// Format byte size to readable string
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// Determine friendly document type from extension
const getDocType = (ext) => {
  const e = ext.toLowerCase().replace('.', '');
  if (['pdf'].includes(e)) return 'pdf';
  if (['doc', 'docx', 'txt', 'rtf', 'odt', 'md'].includes(e)) return 'document';
  if (['ppt', 'pptx', 'key'].includes(e)) return 'slides';
  if (['zip', 'rar', 'tar', 'gz', '7z'].includes(e)) return 'archive';
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'sql'].includes(e)) return 'code';
  return 'document';
};

// 1. Document Upload
const documentUpload = multer({
  storage: createStorage(documentsPath),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = [
      '.pdf', '.doc', '.docx', '.txt', '.md', '.rtf',
      '.ppt', '.pptx', '.xls', '.xlsx', '.csv',
      '.zip', '.rar', '.7z', '.tar', '.gz',
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.html', '.css', '.json', '.sql'
    ];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} is not supported. Please upload PDF, Doc, Slides, Code, or Archive.`));
    }
  },
});

// 2. Video Upload
const videoUpload = multer({
  storage: createStorage(videosPath),
  limits: { fileSize: 300 * 1024 * 1024 }, // 300 MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.mp4', '.webm', '.mov', '.mkv', '.avi', '.ogg'];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Video format ${ext} is not supported. Please upload MP4, WebM, MOV, or MKV.`));
    }
  },
});

// 3. Image Upload
const imageUpload = multer({
  storage: createStorage(imagesPath),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Image format ${ext} is not supported. Please upload JPG, PNG, or WebP.`));
    }
  },
});

// Require authenticated user (instructor/admin)
router.use(protect);
router.use(authorize('instructor', 'admin'));

// POST /api/upload/document
router.post('/document', (req, res) => {
  documentUpload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a document file to upload.' });
    }

    const ext = path.extname(req.file.originalname);
    const docType = getDocType(ext);
    const fileUrl = `/uploads/documents/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      file: {
        title: req.body.title || req.file.originalname,
        filename: req.file.filename,
        originalname: req.file.originalname,
        url: fileUrl,
        type: docType,
        size: formatFileSize(req.file.size),
        bytes: req.file.size,
      },
    });
  });
});

// POST /api/upload/video
router.post('/video', (req, res) => {
  videoUpload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a video file to upload.' });
    }

    const fileUrl = `/uploads/videos/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Video uploaded successfully',
      file: {
        title: req.body.title || req.file.originalname,
        filename: req.file.filename,
        originalname: req.file.originalname,
        url: fileUrl,
        size: formatFileSize(req.file.size),
        bytes: req.file.size,
      },
    });
  });
});

// POST /api/upload/image
router.post('/image', (req, res) => {
  imageUpload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach an image file to upload.' });
    }

    const fileUrl = `/uploads/images/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        url: fileUrl,
        size: formatFileSize(req.file.size),
      },
    });
  });
});

module.exports = router;

