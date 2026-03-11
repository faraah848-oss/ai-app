import aiService from '../../common/lib/aiService.js';
import Flashcard from '../models/Flashcard.js';
import Document from '../models/Document.js';
import { getDocumentText } from '../utils/documentUtils.js';

export const generateHandler = async (req, res) => {
    try {
        const { text, count, documentId } = req.body;
        let content = text;

        if (!content && documentId) {
            const doc = await Document.findById(documentId);
            if (doc) content = await getDocumentText(doc);
        }

        if (!content) {
            return res.status(400).json({ message: 'No document content found for flashcards' });
        }

        const cards = await aiService.generateFlashcards(content, count);

        // Optionally save to DB if documentId is provided
        if (documentId) {
            const flashcardDocs = cards.map(card => ({
                userId: req.user.userId,
                documentId,
                question: card.question,
                answer: card.answer
            }));
            await Flashcard.insertMany(flashcardDocs);
        }

        res.json(cards);
    } catch (error) {
        console.error('Flashcard Generation Error:', error);
        res.status(500).json({ message: 'Error generating flashcards' });
    }
};

export const flashcardRouter = async (req, res) => {
    // This is a catch-all for the router.js that was previously used
    // We'll implement basic CRUD here
    try {
        const { method } = req;
        if (method === 'GET') {
            if (req.params.documentId) {
                const cards = await Flashcard.find({ documentId: req.params.documentId, userId: req.user.userId });
                return res.json(cards);
            }
            const allCards = await Flashcard.find({ userId: req.user.userId });
            return res.json(allCards);
        }
        if (method === 'DELETE') {
            await Flashcard.deleteOne({ _id: req.params.id, userId: req.user.userId });
            return res.json({ message: 'Deleted' });
        }
        if (method === 'PATCH' && req.url.includes('favorite')) {
            const card = await Flashcard.findOne({ _id: req.params.id, userId: req.user.userId });
            if (card) {
                card.isFavorite = !card.isFavorite;
                await card.save();
                return res.json(card);
            }
        }
        res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
