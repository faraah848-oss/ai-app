import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Register request received:', req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ User registered successfully:', user.email);
    res.status(201).json({ message: 'User registered successfully', token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('❌ Register error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login request received:', { email: req.body.email });
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ User logged in successfully:', user.email);
    res.json({ message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Get user profile (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    console.log('👤 Profile request for user:', req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('❌ Profile error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Update username (protected route)
router.patch('/profile/username', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Username cannot be empty' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true }
    ).select('-password');

    console.log('✅ Username updated for user:', req.user.id);
    res.json({ message: 'Username updated successfully', user });
  } catch (error) {
    console.error('❌ Update username error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Update email (protected route)
router.patch('/profile/email', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || email.trim().length === 0) {
      return res.status(400).json({ message: 'Email cannot be empty' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user.id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { email: email.toLowerCase() },
      { new: true }
    ).select('-password');

    console.log('✅ Email updated for user:', req.user.id);
    res.json({ message: 'Email updated successfully', user });
  } catch (error) {
    console.error('❌ Update email error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Update password (protected route)
router.patch('/profile/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id);

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log('✅ Password updated for user:', req.user.id);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('❌ Update password error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

export default router;
