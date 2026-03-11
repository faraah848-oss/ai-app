import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    content: { type: String, required: true },
    tags: [String],
}, { timestamps: true });

export default mongoose.model('Note', noteSchema);