import express from 'express';
import { chatHandler, summaryHandler, explainHandler } from '../controllers/aiControllers.js';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/chat', chatHandler);

router.post('/summary', summaryHandler);

router.post('/explain', explainHandler);

export default router;