import express from 'express';
import dotenv from 'dotenv';
import aiService from '../services/aiService.js';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import authenticateToken from '../middleware/auth.js';
import Flashcard from '../models/Flashcard.js';
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

// Generate flashcards
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const { documentId, count = 10 } = req.body;
        console.log(`🃏 AI Flashcards: Generating ${count} for doc ${documentId}`);

        const document = await Document.findOne({ _id: documentId, userId: req.user.id });
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const fullPath = path.join(__dirname, '../uploads', path.basename(document.filepath));
        const pdfText = await extractTextFromPDF(fullPath);

        console.log('⏳ Generating flashcards with local AI...');
        const flashcardsData = await aiService.generateFlashcards(pdfText, count);
        console.log(`✅ Generated ${flashcardsData.length} flashcards`);

        // Save flashcards to database
        const flashcards = await Flashcard.insertMany(
            flashcardsData.map(fc => ({
                userId: req.user.id,
                documentId,
                question: fc.question,
                answer: fc.answer
            }))
        );

        res.json({ flashcards });
    } catch (error) {
        console.error('❌ Flashcard generation failed:', error);
        res.status(500).json({ message: 'Flashcard generation failed', error: error.message });
    }
});

// Get flashcards for document
router.get('/document/:documentId', authenticateToken, async (req, res) => {
    try {
        const flashcards = await Flashcard.find({
            documentId: req.params.documentId,
            userId: req.user.id
        }).sort({ createdAt: -1 });

        res.json(flashcards);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Toggle favorite
router.patch('/:id/favorite', authenticateToken, async (req, res) => {
    try {
        const flashcard = await Flashcard.findOne({ _id: req.params.id, userId: req.user.id });
        if (!flashcard) {
            return res.status(404).json({ message: 'Flashcard not found' });
        }

        flashcard.isFavorite = !flashcard.isFavorite;
        await flashcard.save();

        res.json(flashcard);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all flashcards for user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const flashcards = await Flashcard.find({ userId: req.user.id })
            .populate('documentId', 'title')
            .sort({ createdAt: -1 });

        res.json(flashcards);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a flashcard
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const flashcard = await Flashcard.findOne({ _id: req.params.id, userId: req.user.id });
        if (!flashcard) {
            return res.status(404).json({ message: 'Flashcard not found' });
        }

        await Flashcard.deleteOne({ _id: req.params.id });
        res.json({ message: 'Flashcard deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;