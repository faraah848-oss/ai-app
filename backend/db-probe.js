import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function probe() {
    console.log('Probing MongoDB...');
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            dbName: 'learnix'
        });
        console.log('✅ PROBE SUCCESS: Connected to MongoDB');
        process.exit(0);
    } catch (err) {
        console.error('❌ PROBE FAILED:', err.message);
        process.exit(1);
    }
}
probe();
