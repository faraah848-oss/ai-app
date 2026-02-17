import express from 'express';
import dotenv from 'dotenv';
import aiService from '../services/aiService.js';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import authenticateToken from '../middleware/auth.js';
import Document from '../models/Document.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Initialize AI service
aiService.init().catch(err => console.warn('AI service init error:', err && err.message));

// Extract text from PDF
async function extractTextFromPDF(filepath) {
    const dataBuffer = fs.readFileSync(filepath);
    const data = await pdfParse(dataBuffer);
    return data.text;
}

// Chat with document
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        // AI service check handled internally


        const { documentId, question } = req.body;
        console.log(`🤖 AI Chat: Question about doc ${documentId}`);

        const document = await Document.findOne({ _id: documentId, userId: req.user.id });
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const fullPath = path.join(__dirname, '../uploads', path.basename(document.filepath));
        const pdfText = await extractTextFromPDF(fullPath);
        console.log('⏳ Generating AI response...');
        const answer = await aiService.chatWithDocument(pdfText, question);
        console.log('✅ AI response received');

        res.json({ answer });
    } catch (error) {
        console.error('❌ AI chat failed:', error);
        let errorMessage = 'AI chat failed';
        if (error.message?.includes('API_KEY_INVALID') || error.status === 400) {
            errorMessage = 'Invalid Gemini API Key. Please check your backend .env file.';
        }
        res.status(500).json({ message: errorMessage, error: error.message });
    }
});

// Generate summary
router.post('/summary', authenticateToken, async (req, res) => {
    try {
        // AI service check handled internally

        const { documentId } = req.body;
        console.log(`📝 AI Summary: Generating for doc ${documentId}`);

        const document = await Document.findOne({ _id: documentId, userId: req.user.id });
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const fullPath = path.join(__dirname, '../uploads', path.basename(document.filepath));
        const pdfText = await extractTextFromPDF(fullPath);
        console.log('⏳ Generating summary...');
        const summary = await aiService.summarizeDocument(pdfText);
        console.log('✅ Summary generated');

        // Save summary to document
        document.summary = summary;
        await document.save();

        res.json({ summary });
    } catch (error) {
        console.error('❌ Summary generation failed:', error);
        let errorMessage = 'Summary generation failed';
        if (error.message?.includes('API_KEY_INVALID') || error.status === 400) {
            errorMessage = 'Invalid Gemini API Key. Please check your backend .env file.';
        }
        res.status(500).json({ message: errorMessage, error: error.message });
    }
});

// Explain concept
router.post('/explain', authenticateToken, async (req, res) => {
    try {
        // AI service check handled internally

        const { documentId, concept } = req.body;
        console.log(`💡 AI Explain: "${concept}" for doc ${documentId}`);

        const document = await Document.findOne({ _id: documentId, userId: req.user.id });
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const fullPath = path.join(__dirname, '../uploads', path.basename(document.filepath));
        const pdfText = await extractTextFromPDF(fullPath);
        console.log('⏳ Generating explanation...');
        const explanation = await aiService.explainConcept(pdfText, concept);
        console.log('✅ Explanation generated');

        res.json({ explanation });
    } catch (error) {
        console.error('❌ Explanation failed:', error);
        let errorMessage = 'Explanation failed';
        if (error.message?.includes('API_KEY_INVALID') || error.status === 400) {
            errorMessage = 'Invalid Gemini API Key. Please check your backend .env file.';
        }
        res.status(500).json({ message: errorMessage, error: error.message });
    }
});

// Placeholder AI generation route
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        res.json({ message: 'AI generation endpoint' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;