import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function test() {
    try {
        console.log('Connecting...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const userSchema = new mongoose.Schema({
            name: { type: String, required: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }, { autoIndex: false });

        console.log('Compiling model...');
        const User = mongoose.model('UserDebug', userSchema, 'users');
        console.log('Model compiled.');

        console.log('Finding user...');
        const u = await User.findOne({});
        console.log('Found:', u ? u.email : 'null');

    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await mongoose.disconnect();
    }
}
test();
