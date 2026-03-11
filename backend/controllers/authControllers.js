import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(`📝 Attempting to register user: ${email}`);

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log(`⚠️ User already exists: ${email}`);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user (password hashing is handled by the model middleware)
        const user = new User({ name, email, password });
        await user.save();
        console.log(`✅ User registered successfully: ${email}`);

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('🔥 Registration error:', error);

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation failed',
                error: error.message,
                details: Object.values(error.errors).map(err => err.message)
            });
        }

        // Handle unique constraint errors (e.g., duplicate email)
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'User already exists',
                error: 'Email is already registered'
            });
        }

        res.status(500).json({
            message: 'Error registering user',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`🔑 Attempting to login user: ${email}`);

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`⚠️ User not found: ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log(`⚠️ Password mismatch for user: ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        console.log(`✅ User logged in successfully: ${email}`);

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
};
