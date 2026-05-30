// backend/routes/documentRoutes.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const { uploadDocument, getDocuments, deleteDocument } =
  require('../controllers/documentController');

const uploadDir = path.join(__dirname, '..', 'uploads', 'documents');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g,'_')}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /pdf|doc|docx|xls|xlsx|jpg|jpeg|png|gif|webp|zip|rar|txt/i;
    allowed.test(path.extname(file.originalname)) ? cb(null, true) : cb(new Error('File type not supported'));
  },
});

router.post('/upload',  auth, upload.single('document'), uploadDocument);
router.get('/',         auth, getDocuments);
router.delete('/:id',   auth, deleteDocument);

module.exports = router;