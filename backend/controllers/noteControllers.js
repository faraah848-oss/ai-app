import Note from '../models/Note.js';
import aiService from '../../common/lib/aiService.js';

export const noteRouter = async (req, res) => {
    try {
        const { method } = req;
        if (method === 'GET') {
            const notes = await Note.find({ documentId: req.params.documentId, userId: req.user.userId });
            return res.json(notes);
        }
        if (method === 'POST') {
            if (req.url.includes('summarize')) {
                const { text } = req.body;
                const summary = await aiService.summarizeDocument(text);
                return res.json({ summary });
            }
            const { documentId, content, pageNumber } = req.body;
            const newNote = new Note({
                userId: req.user.userId,
                documentId,
                content,
                pageNumber: pageNumber || 1
            });
            await newNote.save();
            return res.status(201).json(newNote);
        }
        if (method === 'DELETE') {
            await Note.deleteOne({ _id: req.params.id, userId: req.user.userId });
            return res.json({ message: 'Deleted' });
        }
        res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
