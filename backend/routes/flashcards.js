import express from 'express';
import authenticateToken from '../middleware/authMiddleware.js';
import { generateHandler, flashcardRouter } from '../controllers/flashcardControllers.js';

const router = express.Router();

router.post('/generate', authenticateToken, generateHandler);
router.get('/document/:documentId', authenticateToken, flashcardRouter);
router.patch('/:id/favorite', authenticateToken, flashcardRouter);
router.get('/', authenticateToken, flashcardRouter);
router.delete('/:id', authenticateToken, flashcardRouter);

export default router;