import express from 'express';
import Note from '../models/Note.js';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

// Get all notes
router.get('/', async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user.userId }).sort({ updatedAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notes' });
    }
});

// Create note
router.post('/', async (req, res) => {
    try {
        const { content, documentId, tags } = req.body;
        const note = new Note({
            userId: req.user.userId,
            content,
            documentId,
            tags
        });
        await note.save();
        res.status(201).json(note);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving note' });
    }
});

// Get notes for a specific document
router.get('/document/:documentId', async (req, res) => {
    try {
        const notes = await Note.find({ 
            userId: req.user.userId, 
            documentId: req.params.documentId 
        }).sort({ updatedAt: -1 });
        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes for document:', error);
        res.status(500).json({ message: 'Error fetching notes for document' });
    }
});

// Delete note
router.delete('/:id', async (req, res) => {
    try {
        await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        res.json({ message: 'Note deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting note' });
    }
});

export default router;