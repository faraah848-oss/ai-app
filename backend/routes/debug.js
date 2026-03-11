import express from 'express';
import aiService from '../services/aiService.js';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/ai-status', (req, res) => {
    const isReady = !!aiService.generator;
    res.json({ isReady });
});

router.get('/db-status', (req, res) => {
    const state = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({
        status: states[state] || 'unknown',
        readyState: state,
        dbName: mongoose.connection.name
    });
});

export default router;
