import Document from '../models/Document.js';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

export const getDocumentsHandler = async (req, res) => {
    try {
        const documents = await Document.find({ userId: req.user.userId }).sort({ uploadedAt: -1 });
        res.json(documents);
    } catch (error) {
        console.error('Get Documents Error:', error);
        res.status(500).json({ message: 'Error fetching documents' });
    }
};

export const uploadHandler = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        let content = '';
        if (req.file.mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(req.file.path);
            const data = await pdf(dataBuffer);
            content = data.text;
        } else if (req.file.mimetype === 'text/plain') {
            content = fs.readFileSync(req.file.path, 'utf8');
        }

        const newDocument = new Document({
            userId: req.user.userId,
            title: req.file.originalname,
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            filepath: req.file.path,
            content: content
        });

        await newDocument.save();
        res.status(201).json(newDocument);
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Error uploading document' });
    }
};

export const deleteHandler = async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, userId: req.user.userId });
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Delete from filesystem
        if (doc.filepath && fs.existsSync(doc.filepath)) {
            fs.unlinkSync(doc.filepath);
        }

        await Document.deleteOne({ _id: req.params.id });
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ message: 'Error deleting document' });
    }
};
