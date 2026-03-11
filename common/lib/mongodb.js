import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return mongoose.connection;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI is missing from environment variables");
    }

    const dbName = process.env.MONGODB_DB_NAME || 'learnix';

    // Disable buffering so we get immediate errors if connection is lost
    mongoose.set('bufferCommands', false);

    const options = {
        serverSelectionTimeoutMS: 15000, // Reduced from 30s to fail faster
        socketTimeoutMS: 45000,
        connectTimeoutMS: 15000,
        heartbeatFrequencyMS: 5000, // Check health more frequently
        dbName: dbName,
        retryWrites: true,
        w: 'majority',
        maxPoolSize: 10,
        minPoolSize: 2
    };

    try {
        console.log(`📍 Connecting to MongoDB [DB: ${dbName}]...`);
        console.log("📍 URI:", uri.replace(/:([^@]+)@/, ":****@"));

        const conn = await mongoose.connect(uri, options);

        isConnected = conn.connections[0].readyState === 1;

        mongoose.connection.on('connected', () => {
            console.log("✅ MongoDB connected successfully");
            isConnected = true;
        });

        mongoose.connection.on('error', (err) => {
            console.error("❌ MongoDB runtime error:", err.message);
            isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.warn("⚠️ MongoDB disconnected");
            isConnected = false;
        });

        console.log(`✅ MongoDB connected via common/lib/mongodb.js to database: ${dbName}`);
        return conn;
    } catch (err) {
        console.error("❌ MongoDB connection error details:");
        console.error(`   - Message: ${err.message}`);
        console.error(`   - Name: ${err.name}`);
        if (err.reason) {
            console.error(`   - Reason: ${JSON.stringify(err.reason)}`);
        }
        throw err;
    }
};

export default connectDB;
