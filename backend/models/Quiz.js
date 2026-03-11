import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: false
    },
    documentIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: false
    }],
    documentIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: false
    }],
    questions: [{
        question: String,
        options: [String],
        correctAnswer: Number,
        explanation: String
    }],
    score: {
        type: Number,
        default: null
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    userAnswers: [{
        type: Number
    }],
    completedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
