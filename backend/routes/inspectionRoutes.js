// backend/routes/inspectionRoutes.js
const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const router   = express.Router();
const auth     = require('../middleware/authMiddleware');
const { addInspection, getInspections, updateInspection, deleteInspection } =
  require('../controllers/inspectionController');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'inspections');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (/^image\//i.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

router.post('/add', auth, upload.single('photo'), addInspection);
router.get('/',     auth, getInspections);
router.put('/:id',  auth, upload.single('photo'), updateInspection);
router.delete('/:id', auth, deleteInspection);

module.exports = router;
