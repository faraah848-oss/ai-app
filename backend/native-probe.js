import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function probe() {
    console.log('Probing MongoDB (Native Driver)...');
    const client = new MongoClient(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
    });
    try {
        await client.connect();
        console.log('✅ NATIVE PROBE SUCCESS: Connected to MongoDB');
        await client.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ NATIVE PROBE FAILED:', err.message);
        process.exit(1);
    }
}
probe();
