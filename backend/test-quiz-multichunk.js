import aiService from '../common/lib/aiService.js';

async function testMultiChunkCoverage() {
    console.log('--- Testing Multi-Chunk Balanced Coverage ---');

    // Create a 15,000 character text (likely 2-3 chunks)
    // Every 4000 chars has a very distinct topic
    let text = "";
    for (let i = 0; i < 4; i++) {
        const topic = `TOPIC_${String.fromCharCode(65 + i)}`;
        const content = `This section is dedicated entirely to ${topic}. It discusses the unique properties of ${topic} and how it differs from others. `.repeat(30);
        text += `\n\n--- Start of ${topic} ---\n\n${content}\n\n`;
    }

    const requestedCount = 4;
    try {
        await aiService.init();
        console.log(`Input text length: ${text.length} chars`);
        const questions = await aiService.generateQuiz(text, requestedCount);

        console.log(`Requested: ${requestedCount}, Generated: ${questions.length}`);

        const topicsMentioned = new Set();
        questions.forEach((q, i) => {
            console.log(`${i + 1}: ${q.question}`);
            // Check which topic is mentioned in the question or explanation
            if (q.question.includes('TOPIC_A') || q.explanation.includes('TOPIC_A')) topicsMentioned.add('A');
            if (q.question.includes('TOPIC_B') || q.explanation.includes('TOPIC_B')) topicsMentioned.add('B');
            if (q.question.includes('TOPIC_C') || q.explanation.includes('TOPIC_C')) topicsMentioned.add('C');
            if (q.question.includes('TOPIC_D') || q.explanation.includes('TOPIC_D')) topicsMentioned.add('D');
        });

        console.log(`Unique Chapters Covered: ${topicsMentioned.size} / 4`);

        if (topicsMentioned.size >= 3) {
            console.log('✅ PASS: Quiz is well-distributed across chunks/topics.');
        } else {
            console.log('❌ FAIL: Quiz is bunched in too few sections.');
        }

        const uniqueQuestions = new Set(questions.map(q => q.question.toLowerCase()));
        if (uniqueQuestions.size === questions.length) {
            console.log('✅ PASS: All questions are unique.');
        } else {
            console.log('❌ FAIL: Duplicate questions found.');
        }

    } catch (err) {
        console.error('❌ Error during test:', err);
    }
}

testMultiChunkCoverage().then(() => process.exit(0));
