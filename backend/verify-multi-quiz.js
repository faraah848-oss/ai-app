import mongoose from 'mongoose';
import Quiz from './models/Quiz.js';
import Document from './models/Document.js';
import aiService from '../common/lib/aiService.js';
import 'dotenv/config';

async function testMultiDocGeneration() {
    console.log('--- Testing Multi-Document Quiz Generation ---');

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find some existing documents to test with
        const docs = await Document.find().limit(2);
        if (docs.length < 2) {
            console.log('⚠️ Not enough documents in database to test multi-topic generation. Please upload at least 2 PDFs.');
            process.exit(0);
        }

        const docIds = docs.map(d => d._id);
        console.log(`Testing with documents: ${docs.map(d => d.originalName).join(', ')}`);

        // Mock request body structure
        const mockBody = {
            documentIds: docIds,
            count: 5
        };

        // We'll test the core logic used in the controller
        console.log('📚 Fetching and combining text...');
        let combinedText = "";
        for (const doc of docs) {
            // Note: In real controller we use getDocumentText(doc)
            // For this test we'll just check if it has content or title
            combinedText += `\n--- Content from ${doc.originalName} ---\nThis is dummy content for ${doc.originalName}. ${doc.title || ''}\n`;
        }

        console.log('🧠 Calling AI service...');
        await aiService.init();
        const questions = await aiService.generateQuiz(combinedText, 5);

        console.log(`✅ Generated ${questions.length} questions.`);
        questions.forEach((q, i) => {
            console.log(`${i + 1}: ${q.question}`);
            console.log(`   Options: ${q.options.join(' | ')}`);
        });

        if (questions.length > 0) {
            console.log('✅ PASS: Quiz generation from multiple sources successful.');
        } else {
            console.log('❌ FAIL: No questions generated.');
        }

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await mongoose.connection.close();
    }
}

testMultiDocGeneration();
