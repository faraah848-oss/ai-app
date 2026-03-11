import aiService from '../common/lib/aiService.js';

async function testDeduplication() {
    console.log('--- Testing Quiz Deduplication ---');
    const text = `
    Machine learning is a field of inquiry devoted to understanding and building methods that 'learn', that is, methods that leverage data to improve performance on some set of tasks. It is seen as a part of artificial intelligence.
    Machine learning algorithms build a model based on sample data, known as training data, in order to make predictions or decisions without being explicitly programmed to do so.
    Machine learning is a field of inquiry devoted to understanding and building methods that 'learn', that is, methods that leverage data to improve performance on some set of tasks. It is seen as a part of artificial intelligence.
    `; // Repeated text intentionally

    // We expect the deduplication logic to handle the repeated sentences
    try {
        const questions = await aiService.generateQuiz(text, 5);
        console.log(`Generated ${questions.length} questions.`);

        const questionTexts = questions.map(q => q.question);
        const uniqueQuestions = new Set(questionTexts);

        console.log('Questions:');
        questionTexts.forEach((q, i) => console.log(`${i + 1}: ${q}`));

        if (uniqueQuestions.size === questionTexts.length) {
            console.log('✅ PASS: All questions are unique.');
        } else {
            console.log(`❌ FAIL: Found ${questionTexts.length - uniqueQuestions.size} duplicates.`);
        }
    } catch (err) {
        console.error('❌ Error during test:', err);
    }
}

async function run() {
    await aiService.init();
    await testDeduplication();
    process.exit(0);
}

run();
