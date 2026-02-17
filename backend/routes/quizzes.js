import express from 'express';
import dotenv from 'dotenv';
import aiService from '../services/aiService.js';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import authenticateToken from '../middleware/auth.js';
import Quiz from '../models/Quiz.js';
import Document from '../models/Document.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Extract text from PDF
async function extractTextFromPDF(filepath) {
    const dataBuffer = fs.readFileSync(filepath);
    const data = await pdfParse(dataBuffer);
    return data.text;
}

// Generate quiz
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const { documentId, questionCount = 5 } = req.body;
        console.log(`❓ AI Quiz: Generating ${questionCount} questions for doc ${documentId}`);

        const document = await Document.findOne({ _id: documentId, userId: req.user.id });
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const fullPath = path.join(__dirname, '../uploads', path.basename(document.filepath));
        const pdfText = await extractTextFromPDF(fullPath);

        console.log('⏳ Generating quiz with local AI...');
        const questions = await aiService.generateQuiz(pdfText, questionCount);
        console.log(`✅ Generated ${questions.length} quiz questions`);

        // Save quiz to database
        const quiz = new Quiz({
            userId: req.user.id,
            documentId,
            questions,
            totalQuestions: questions.length
        });
        await quiz.save();

        res.json({ quiz });

    } catch (error) {
        console.error('❌ Quiz generation failed:', error);
        res.status(500).json({ message: 'Quiz generation failed', error: error.message });
    }
});

// Submit quiz answers
router.post('/:id/submit', authenticateToken, async (req, res) => {
    try {
        const { answers } = req.body;
        console.log(`✅ Quiz Submit: ID ${req.params.id}`);

        const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user.id });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Calculate score
        let correctCount = 0;
        quiz.questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswer) {
                correctCount++;
            }
        });

        quiz.userAnswers = answers;
        quiz.score = correctCount;
        quiz.completedAt = new Date();
        await quiz.save();

        res.json({ quiz, score: correctCount, total: quiz.totalQuestions });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get quiz by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user.id })
            .populate('documentId', 'title');

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all quizzes for user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const quizzes = await Quiz.find({ userId: req.user.id })
            .populate('documentId', 'title')
            .sort({ createdAt: -1 });

        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a quiz
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user.id });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        await Quiz.deleteOne({ _id: req.params.id });
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;