import aiService from '../common/lib/aiService.js';

async function testCoverage() {
    console.log('--- Testing Quiz Coverage and Count ---');

    // Create a text with 10 distinct sections
    const text = Array.from({ length: 10 }, (_, i) =>
        `Section ${i + 1}: This is a unique sentence about topic ${String.fromCharCode(65 + i)} that covers various aspects of subject ${i}. It is meant to be distinct from other sections to test coverage.`
    ).join('\n\n');

    const requestedCount = 8;
    try {
        await aiService.init();
        const questions = await aiService.generateQuiz(text, requestedCount);

        console.log(`Requested: ${requestedCount}, Generated: ${questions.length}`);

        const questionTexts = questions.map(q => q.question);
        const uniqueQuestions = new Set(questionTexts.map(q => q.toLowerCase()));

        console.log('Questions Generated:');
        questions.forEach((q, i) => {
            console.log(`${i + 1}: ${q.question}`);
            console.log(`   Ref: ${q.explanation}`);
        });

        const allMatch = questions.length === requestedCount;
        const allUnique = uniqueQuestions.size === requestedCount;

        if (allMatch && allUnique) {
            console.log('✅ PASS: Count and Uniqueness verified.');
        } else {
            console.log(`❌ FAIL: Count match: ${allMatch}, Unique: ${allUnique} (${uniqueQuestions.size}/${questions.length})`);
        }

        // Check coverage: are they from different sections?
        const mentions = Array.from({ length: 10 }, (_, i) => `topic ${String.fromCharCode(65 + i)}`);
        const covered = mentions.filter(m => questions.some(q => q.explanation.includes(m)));

        console.log(`Coverage: ${covered.length} unique topics covered out of ${requestedCount} questions.`);

        if (covered.length >= requestedCount * 0.7) {
            console.log('✅ PASS: Good topic coverage.');
        } else {
            console.log('❌ FAIL: Poor topic coverage.');
        }

    } catch (err) {
        console.error('❌ Error during test:', err);
    }
}

testCoverage().then(() => process.exit(0));
