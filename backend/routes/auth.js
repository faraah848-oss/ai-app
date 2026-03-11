import { Router } from 'express';
import authenticateToken from '../middleware/authMiddleware.js';
import { register as registerHandler, login as loginHandler } from '../controllers/authControllers.js';
import User from '../models/User.js';

const router = Router();

// Register
router.post('/register', registerHandler);

// Login
router.post('/login', loginHandler);

// Get user profile (protected)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile fields (Username, Email, Password) - simplified logic using the new model location
router.patch('/profile/username', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(req.user.userId, { name: name.trim() }, { new: true }).select('-password');
    res.json({ message: 'Username updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/profile/email', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByIdAndUpdate(req.user.userId, { email: email.toLowerCase() }, { new: true }).select('-password');
    res.json({ message: 'Email updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/profile/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) return res.status(401).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;