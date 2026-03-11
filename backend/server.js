// server.js
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
if (!process.env.MONGODB_URI) {
    dotenv.config({ path: path.join(__dirname, '../.env') });
}

import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import connectDB from '../common/lib/mongodb.js';

// Route imports
import authRoutes from './routes/auth.js';
import documentRoutes from './routes/documents.js';
import aiRoutes from './routes/ai.js';
import flashcardRoutes from './routes/flashcards.js';
import quizRoutes from './routes/quizzes.js';
import progressRoutes from './routes/progress.js';
import notesRoutes from './routes/notes.js';
import debugRoutes from './routes/debug.js';
import aiService from './services/aiService.js';

// Check essential environment variables
if (!process.env.JWT_SECRET || !process.env.MONGODB_URI) {
    console.error('🔥 FATAL ERROR: JWT_SECRET or MONGODB_URI is not defined in .env');
    process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request Logger to debug 401 errors
app.use((req, res, next) => {
    console.log(`📢 ${req.method} ${req.url}`);
    next();
});

// AI Initialize
aiService.init().catch(err => console.error('🔥 AI Init failed:', err));

// Database connection is handled by the caller (local-server.js or serverless handler)
// to ensure connection is ready before processing requests.

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/debug', debugRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Learnix API Server Running' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('🔥 Global Error Handler:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
});

export default app;

let handler;
if (!process.env.IS_LOCAL) {
    handler = serverless(app);
}

export { handler };