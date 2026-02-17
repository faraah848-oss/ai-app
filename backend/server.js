import 'dotenv/config'; // Loads .env as the very first thing
import express from 'express';
import cors from 'cors';
// import dotenv from 'dotenv'; // Removed since 'dotenv/config' does it automatically
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import documentRoutes from './routes/documents.js';
import aiRoutes from './routes/ai.js';
import flashcardRoutes from './routes/flashcards.js';
import quizRoutes from './routes/quizzes.js';
import progressRoutes from './routes/progress.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// Check for essential environment variables
if (!process.env.JWT_SECRET || !process.env.MONGODB_URI) {
  console.error('🔥 FATAL ERROR: JWT_SECRET or MONGODB_URI is not defined in your .env file.');
  process.exit(1);
}

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// API Key Validation
// No API key required for local AI

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  next();
});

// Database connection
async function connectMongo() {
  const MAX_RETRIES = 5;
  let retryDelay = 2000; // Start with 2 seconds

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      console.log(`🔌 Attempting MongoDB connection (Attempt ${i + 1}/${MAX_RETRIES})...`);
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 30000 });
      console.log('✅ MongoDB connected successfully');
      return;
    } catch (err) {
      console.error('❌ MongoDB connection error:');
      console.error(err && err.message ? err.message : err);
      if (i < MAX_RETRIES - 1) {
        console.log(`⚠️ Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay *= 2; // Exponential backoff
      } else {
        console.error('Please verify your MONGODB_URI, network access, and credentials.');
        process.exit(1);
      }
    }
  }
}

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
  connectMongo();
});

// Listen for connection errors after the initial connection was established
mongoose.connection.on('error', (err) => { console.error('❌ MongoDB runtime error:', err); });

connectMongo();

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception thrown:', err);
  // Recommended: perform any cleanup here, then exit process if necessary
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Learnix API Server Running' });
});

// Validating Local AI Model Availability (Optional Debug Route)
app.get('/api/debug/ai-status', async (req, res) => {
  try {
    res.json({ status: 'Local AI model is configured' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Global Error Loader:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} is busy, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error(err);
    }
  });
};

startServer(PORT);
