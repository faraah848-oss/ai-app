import { MongoClient } from 'mongodb';
import 'dotenv/config';

async function test() {
    console.log('--- Native MongoDB Driver Test ---');
    console.log('URI:', process.env.MONGODB_URI ? 'Defined' : 'MISSING');

    const client = new MongoClient(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
    });

    try {
        console.log('Connecting...');
        await client.connect();
        console.log('✅ Connected successfully!');
        const dbs = await client.db().admin().listDatabases();
        console.log('Databases:', dbs.databases.map(d => d.name));
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
    } finally {
        await client.close();
    }
}
test();
