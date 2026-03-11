import app from './server.js';

import connectDB from '../common/lib/mongodb.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        console.log('⏳ Connecting to Database...');
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(`\n✅ Local Server running on http://localhost:${PORT}`);
            console.log(`   - API endpoint: http://localhost:${PORT}/api`);
            console.log(`   - Health check: http://localhost:${PORT}/\n`);
        });

        server.on('error', (e) => {
            if (e.code === 'EADDRINUSE') {
                console.error(`\n🔥 Port ${PORT} is already in use.`);
                console.error(`   Please kill the process running on port ${PORT} or use a different port.\n`);
                process.exit(1);
            }
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
}

startServer();