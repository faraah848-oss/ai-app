import Document from '../models/Document.js';
import Quiz from '../models/Quiz.js';
import Flashcard from '../models/Flashcard.js';

export const progressHandler = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [documentCount, quizCount, flashcardCount] = await Promise.all([
            Document.countDocuments({ userId }),
            Quiz.countDocuments({ userId }),
            Flashcard.countDocuments({ userId })
        ]);

        const recentQuizzes = await Quiz.find({ userId })
            .limit(5)
            .sort({ createdAt: -1 })
            .populate('documentId', 'title');

        res.json({
            stats: {
                documents: documentCount,
                quizzes: quizCount,
                flashcards: flashcardCount
            },
            recentQuizzes
        });
    } catch (error) {
        console.error('Progress Error:', error);
        res.status(500).json({ message: 'Error fetching progress data' });
    }
};
