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

        console.log('Direct collection count...');
        const count = await mongoose.connection.db.collection('users').countDocuments();
        console.log('Count:', count);

        console.log('Importing User model...');
        const { default: User } = await import('./models/User.js');
        console.log('Model imported.');

        const email = 'test-' + Date.now() + '@example.com';
        console.log('Finding user:', email);
        const u = await User.findOne({ email });
        console.log('Found:', u);

    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await mongoose.disconnect();
    }
}
test();
