import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI;
console.log('--- DB CONNECTION DIAGNOSTIC ---');
console.log('URI:', uri.replace(/:([^@]+)@/, ':****@'));

async function testConnection() {
    const timeout = setTimeout(() => {
        console.error('❌ TIMEOUT: Connection attempt took more than 20 seconds. This is often an IP Whitelisting issue on MongoDB Atlas.');
        process.exit(1);
    }, 20000);

    try {
        console.log('Attempting to connect...');
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000
        });
        clearTimeout(timeout);
        console.log('✅ SUCCESS: Connected to MongoDB cluster.');
        process.exit(0);
    } catch (err) {
        clearTimeout(timeout);
        console.error('❌ ERROR:', err.message);
        if (err.name === 'MongooseServerSelectionError') {
            console.error('This error strongly suggests that the IP address of this machine is NOT whitelisted on your MongoDB Atlas cluster or there is a firewall blocking the outbound connection on port 27017.');
        }
        process.exit(1);
    }
}

testConnection();
