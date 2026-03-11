import mongoose from 'mongoose';
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    try {
        const salt = randomBytes(16).toString('hex');
        const hash = scryptSync(this.password, salt, 64).toString('hex');
        this.password = `${salt}:${hash}`;
    } catch (error) {
        throw error;
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        const [salt, hash] = this.password.split(':');
        if (!salt || !hash) return false;

        const candidateHash = scryptSync(candidatePassword, salt, 64).toString('hex');

        const bHash = Buffer.from(hash);
        const bCandidateHash = Buffer.from(candidateHash);

        if (bHash.length !== bCandidateHash.length) {
            return false;
        }

        return timingSafeEqual(bHash, bCandidateHash);
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};

// Prevent model overwrite in serverless environments
const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
