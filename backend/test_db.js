import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

console.log('Testing MongoDB connection...');
// Mask the password in the log for security, but show the rest to verify format
const uri = process.env.MONGODB_URI || '';
const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
console.log(`Using URI: ${maskedUri}`);

if (!uri) {
    console.error('❌ MONGODB_URI is not defined in .env');
    process.exit(1);
}

mongoose.connect(uri, { family: 4 })
    .then(() => {
        console.log('✅ MongoDB connected successfully!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:');
        console.error(err.message);
        if (err.codeName) console.error(`CodeName: ${err.codeName}`);
        if (err.code) console.error(`Code: ${err.code}`);
        process.exit(1);
    });
