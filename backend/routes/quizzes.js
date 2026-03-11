import express from 'express';
import authenticateToken from '../middleware/authMiddleware.js';
import { generateHandler, submitHandler, getHistoryHandler } from '../controllers/quizControllers.js';
import Quiz from '../models/Quiz.js';

const router = express.Router();

router.post('/generate', authenticateToken, generateHandler);
router.post('/:id/submit', authenticateToken, submitHandler);
router.get('/', authenticateToken, getHistoryHandler);

router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user.userId }).populate('documentId', 'title');
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const quizzes = await Quiz.find({ userId: req.user.userId }).populate('documentId', 'title').sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await Quiz.deleteOne({ _id: req.params.id, userId: req.user.userId });
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;