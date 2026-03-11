import express from 'express';
import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;

        // Fetch all stats concurrently for better performance
        const [docCount, flashcardCount, quizCount, recentDocs] = await Promise.all([
            Document.countDocuments({ userId }),
            Flashcard.countDocuments({ userId }),
            Quiz.countDocuments({ userId }),
            Document.find({ userId }).sort({ uploadedAt: -1 }).limit(5)
        ]);

        res.json({
            stats: {
                documents: docCount,
                flashcards: flashcardCount,
                quizzes: quizCount
            },
            recentActivity: {
                documents: recentDocs
            }
        });
    } catch (error) {
        console.error('Error fetching progress:', error);
        // Return zero values on error to prevent frontend crash
        res.json({
            stats: { documents: 0, flashcards: 0, quizzes: 0 },
            recentActivity: { documents: [] }
        });
    }
});

export default router;