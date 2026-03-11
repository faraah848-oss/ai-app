import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function test() {
    console.log('URI:', process.env.MONGODB_URI ? 'Defined' : 'UNDEFINED');
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');
        const count = await mongoose.connection.db.collection('users').countDocuments();
        console.log('User count:', count);
    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}
test();
