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

        console.log('Defining schema...');
        const userSchema = new mongoose.Schema({
            name: String,
            email: { type: String, unique: true },
            password: String
        });
        console.log('Schema defined.');

        console.log('Compiling model...');
        const User = mongoose.model('UserTest', userSchema);
        console.log('Model compiled.');

        console.log('Finding user...');
        const u = await User.findOne({});
        console.log('Found:', u);

    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await mongoose.disconnect();
    }
}
test();
