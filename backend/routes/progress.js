import express from 'express';
import authenticateToken from '../middleware/auth.js';
import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';

const router = express.Router();

// Get user progress dashboard
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get counts
        const documentCount = await Document.countDocuments({ userId });
        const flashcardCount = await Flashcard.countDocuments({ userId });
        const quizCount = await Quiz.countDocuments({ userId, completedAt: { $ne: null } });

        // Get recent activity
        const recentDocuments = await Document.find({ userId }).sort({ uploadedAt: -1 }).limit(5);
        const recentQuizzes = await Quiz.find({ userId, completedAt: { $ne: null } })
            .populate('documentId', 'title')
            .sort({ completedAt: -1 })
            .limit(5);

        // Calculate average quiz score
        const completedQuizzes = await Quiz.find({ userId, score: { $ne: null } });
        const avgScore = completedQuizzes.length > 0
            ? completedQuizzes.reduce((sum, q) => sum + (q.score / q.totalQuestions) * 100, 0) / completedQuizzes.length
            : 0;

        res.json({
            stats: {
                documents: documentCount,
                flashcards: flashcardCount,
                quizzes: quizCount,
                averageScore: Math.round(avgScore)
            },
            recentActivity: {
                documents: recentDocuments,
                quizzes: recentQuizzes
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/placeholder', authenticateToken, async (req, res) => {
    try {
        res.json({ message: 'Progress endpoint' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
