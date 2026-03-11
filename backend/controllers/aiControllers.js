import aiService from '../../common/lib/aiService.js';
import Document from '../models/Document.js';
import { getDocumentText } from '../utils/documentUtils.js';

export const chatHandler = async (req, res) => {
    try {
        const { message, question, documentId, documentText } = req.body;
        const finalMessage = question || message;
        let text = documentText;

        if (!finalMessage) {
            return res.status(400).json({ message: 'No question or message provided' });
        }

        if (!text && documentId) {
            const doc = await Document.findById(documentId);
            if (doc) text = await getDocumentText(doc);
        }

        if (!text) {
            return res.status(400).json({ message: 'No document content found for chat' });
        }

        const answer = await aiService.chatWithDocument(text, finalMessage);
        res.json({ answer });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ message: 'Error processing AI chat' });
    }
};

export const summaryHandler = async (req, res) => {
    try {
        const { text, documentId } = req.body;
        let content = text;

        if (!content && documentId) {
            const doc = await Document.findById(documentId);
            if (doc) content = await getDocumentText(doc);
        }

        if (!content) {
            return res.status(400).json({ message: 'No document content found for summary' });
        }

        const summary = await aiService.summarizeDocument(content);

        // Optionally update document with the generated summary
        if (documentId) {
            await Document.findByIdAndUpdate(documentId, { summary });
        }

        res.json({ summary });
    } catch (error) {
        console.error('AI Summary Error:', error);
        res.status(500).json({ message: 'Error generating summary' });
    }
};

export const explainHandler = async (req, res) => {
    try {
        const { text, concept, documentId } = req.body;
        let content = text;

        if (!content && documentId) {
            const doc = await Document.findById(documentId);
            if (doc) content = await getDocumentText(doc);
        }

        if (!content) {
            return res.status(400).json({ message: 'No document content found for explanation' });
        }

        const explanation = await aiService.explainConcept(content, concept);
        res.json({ explanation });
    } catch (error) {
        console.error('AI Explain Error:', error);
        res.status(500).json({ message: 'Error generating explanation' });
    }
};
