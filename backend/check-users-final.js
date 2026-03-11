import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db('learnix');
        const users = await db.collection('users').find().toArray();
        console.log(`📊 Total users: ${users.length}`);
        users.forEach(u => {
            console.log(`- Email: ${u.email}, Password Format: ${u.password ? u.password.includes(':') ? 'scrypt' : 'unknown/bcrypt' : 'MISSING'}`);
        });
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.close();
    }
}
check();
