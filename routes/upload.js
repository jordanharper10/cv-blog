const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');

const router = express.Router();
const ADMIN_TOKEN = process.env.BLOG_ADMIN_TOKEN || '';

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!ADMIN_TOKEN) return res.status(500).json({ error: 'Admin token not set' });
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorised' });
  next();
}

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(() => {});

// Basic file filter (images only)
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      const ts = Date.now();
      cb(null, `${base}-${ts}${ext}`);
    }
  }),
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(png|jpe?g|gif|webp|svg\+xml)$/.test(file.mimetype);
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 5MB
});

router.post('/', requireAuth, upload.single('image'), (req, res) => {
  // Public URL to the uploaded file
  const filename = req.file.filename;
  const url = `/uploads/${filename}`;
  res.status(201).json({ url });
});

module.exports = router;
