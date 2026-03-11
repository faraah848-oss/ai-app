import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'backend/.env') });

import connectDB from './common/lib/mongodb.js';
import User from './backend/models/User.js';

async function test() {
    try {
        console.log('1. Connecting to DB...');
        await connectDB();
        console.log('2. Connected.');

        console.log('3. Checking Users count...');
        const count = await User.countDocuments();
        console.log('4. User count:', count);

        console.log('5. Done.');
    } catch (err) {
        console.error('🔥 Test Failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

test();
