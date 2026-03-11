// routes/documents.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import auth from '../middleware/authMiddleware.js';
import { getDocumentsHandler, uploadHandler, deleteHandler } from '../controllers/documentControllers.js';
import Document from '../models/Document.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/upload', auth, upload.single('document'), uploadHandler);
router.get('/', auth, getDocumentsHandler);
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (e) { res.status(500).json({ message: e.message }); }
});
router.delete('/:id', auth, deleteHandler);

export default router;