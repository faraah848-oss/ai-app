import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

mongoose.set('debug', true);

async function test() {
    try {
        console.log('Connecting...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const schema = new mongoose.Schema({ email: String });
        const UserMinimal = mongoose.model('UserMinimal', schema, 'users');

        console.log('Finding user...');
        const u = await UserMinimal.findOne({});
        console.log('Found:', u ? u.email : 'null');
    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await mongoose.disconnect();
    }
}
test();
