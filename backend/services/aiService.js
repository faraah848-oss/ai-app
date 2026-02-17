let pipeline = null;
let generator = null;

export async function init() {
    // Only enable Xenova model loading when explicitly requested. This avoids
    // long remote fetches or startup failures on developers' machines.
    if (process.env.ENABLE_XENOVA !== 'true') {
        console.log('AI service: Xenova disabled (set ENABLE_XENOVA=true to enable). Using naive fallbacks.');
        return;
    }

    try {
        // Load @xenova/transformers dynamically so the server can run even if it's not installed
        console.log('AI service: attempting to load @xenova/transformers (optional)...');
        const xenova = await import('@xenova/transformers');

        // Suppress ONNX warnings
        if (xenova.env) {
            xenova.env.allowLocalModels = true; // Ensure local models are allowed
            xenova.env.useBrowserCache = false; // Disable browser cache for node
            // Try to set log level on both potential paths
            if (xenova.env.backends && xenova.env.backends.onnx) {
                xenova.env.backends.onnx.logLevel = 'error';
            }
        }

        // The package may export `pipeline` as a named export or as a property on default
        pipeline = xenova.pipeline || (xenova.default && xenova.default.pipeline);

        if (typeof pipeline !== 'function') {
            throw new Error('xenova.pipeline is not available');
        }

        console.log('AI service: initializing local model (Xenova/LaMini-Flan-T5-248M)...');
        // Create the local generator pipeline
        generator = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-248M');
        console.log('AI service: local model loaded successfully');
    } catch (e) {
        // If the package isn't installed or loading fails, log a warning but do not crash
        console.warn('AI service: @xenova/transformers not available or failed to load. Falling back to naive implementations.');
        console.debug(e && e.message ? e.message : e);
        pipeline = null;
        generator = null;
    }
}

function naiveSummary(text, maxSentences = 5) {
    if (!text) return '';
    const sentences = text
        .replace(/\r/g, ' ')
        .split(/[\.\n]\s+/)
        .map(s => s.trim())
        .filter(Boolean);
    return sentences.slice(0, maxSentences).join('. ') + (sentences.length > maxSentences ? '...' : '');
}

function naiveExplain(text, concept) {
    if (!text) return `No document content to explain ${concept}`;
    const lc = concept.toLowerCase();
    const sentences = text.split(/[\.\n]\s+/).map(s => s.trim());
    const matches = sentences.filter(s => s.toLowerCase().includes(lc));
    if (matches.length) return `Found context about ${concept}:\n\n${matches.slice(0, 4).join('. ')}.`;
    return `I couldn't find explicit references to "${concept}" in the document. Here is a brief explanation: \n\n${concept} is a concept that relates to the document content. (This is a fallback explanation.)`;
}

function naiveChat(text, question) {
    if (!text) return `No document content to answer: ${question}`;
    const qterms = question.toLowerCase().split(/\W+/).filter(Boolean);
    const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
    let best = '';
    let bestScore = 0;
    for (const p of paragraphs) {
        let score = 0;
        const pl = p.toLowerCase();
        for (const t of qterms) if (pl.includes(t)) score++;
        if (score > bestScore) { bestScore = score; best = p; }
    }
    if (bestScore > 0) return `Based on the document: \n\n${best}`;
    return `I couldn't find a direct answer in the document. Here's an excerpt: \n\n${paragraphs.slice(0, 2).join('\n\n')}`;
}

function naiveGenerateFlashcards(text, count = 5) {
    if (!text) return [];
    // Split into sentences
    const sentences = text
        .replace(/\r/g, ' ')
        .split(/[\.\?!]\s+/)
        .map(s => s.trim())
        .filter(Boolean);

    // Filter out very short/very long sentences
    const candidates = sentences.filter(s => s.split(/\s+/).length >= 6 && s.length < 300);
    if (candidates.length === 0) return [];

    // Pick up to `count` evenly spaced sentences
    const step = Math.max(1, Math.floor(candidates.length / count));
    const cards = [];
    for (let i = 0; i < candidates.length && cards.length < count; i += step) {
        const answer = candidates[i];
        const snippet = answer.split(/\s+/).slice(0, 8).join(' ');
        const question = `What does this mean: "${snippet}..."`;
        cards.push({ question, answer });
    }
    return cards;
}

export default {
    init,
    async chatWithDocument(text, question) {
        if (generator) {
            try {
                // Truncate text to avoid hitting max token limits too easily, though T5 handles more.
                // Keeping it reasonable for speed.
                const context = text.substring(0, 2000);
                const prompt = `Question: ${question} Context: ${context} Answer:`;
                const output = await generator(prompt, { max_new_tokens: 150, temperature: 0.7 });
                return output[0].generated_text;
            } catch (e) {
                console.error('Local AI chat failed, falling back to naive', e);
            }
        }
        return naiveChat(text, question);
    },

    async summarizeDocument(text) {
        if (generator) {
            try {
                const context = text.substring(0, 3000);
                const prompt = `Summarize: ${context}`;
                const output = await generator(prompt, { max_new_tokens: 200, temperature: 0.5 });
                return output[0].generated_text;
            } catch (e) {
                console.error('Local AI summary failed, falling back to naive', e);
            }
        }
        return naiveSummary(text);
    },

    async explainConcept(text, concept) {
        if (generator) {
            try {
                const context = text.substring(0, 2000);
                const prompt = `Explain "${concept}" based on: ${context}`;
                const output = await generator(prompt, { max_new_tokens: 150, temperature: 0.7 });
                return output[0].generated_text;
            } catch (e) {
                console.error('Local AI explain failed, falling back to naive', e);
            }
        }
        return naiveExplain(text, concept);
    },

    async generateFlashcards(text, count = 5) {
        if (generator) {
            try {
                const context = text.substring(0, 2000);
                const prompt = `Generate ${count} Q&A flashcards from this text. Format: Q: Question? A: Answer. Context: ${context}`;
                const output = await generator(prompt, { max_new_tokens: 300, temperature: 0.7 });
                const generated = output[0].generated_text;

                // Parse Q: A: format
                const cards = [];
                const parts = generated.split(/Q:/g);
                for (const part of parts) {
                    if (!part.trim()) continue;
                    const aSplit = part.split(/A:/);
                    if (aSplit.length === 2) {
                        cards.push({
                            question: aSplit[0].trim(),
                            answer: aSplit[1].trim()
                        });
                    }
                }
                // Return exact count if possible, or all found
                return cards.slice(0, count);
            } catch (e) {
                console.error('Local AI flashcard generation failed', e);
            }
        }
        // Naive fallback: pick informative sentences and convert to Q/A
        try {
            const naive = naiveGenerateFlashcards(text, count);
            return naive;
        } catch (e) {
            console.error('Naive flashcard generation failed', e);
            return [];
        }
    },

    async generateQuiz(text, count = 5) {
        if (generator) {
            try {
                const context = text.substring(0, 2000);
                // Simple format: Q: Question? O: op1, op2, op3, op4 C: Correct
                const prompt = `Generate ${count} quiz questions. Format: Q: Question? O: op1, op2, op3, op4 C: Correct Answer. Context: ${context}`;
                const output = await generator(prompt, { max_new_tokens: 400, temperature: 0.7 });
                const generated = output[0].generated_text;

                const questions = [];
                const parts = generated.split(/Q:/g);
                for (const part of parts) {
                    if (!part.trim()) continue;
                    const oSplit = part.split(/O:/);
                    if (oSplit.length === 2) {
                        const qText = oSplit[0].trim();
                        const cSplit = oSplit[1].split(/C:/);
                        if (cSplit.length === 2) {
                            const optionsStr = cSplit[0].trim();
                            const correct = cSplit[1].trim();
                            const options = optionsStr.split(',').map(o => o.trim());

                            // Find correct index
                            let correctIndex = options.findIndex(o => o.toLowerCase().includes(correct.toLowerCase()));
                            if (correctIndex === -1) correctIndex = 0; // Default to first if match fails

                            questions.push({
                                question: qText,
                                options: options.slice(0, 4), // Ensure 4 options
                                correctAnswer: correctIndex,
                                explanation: 'Generated by local AI'
                            });
                        }
                    }
                }
                return questions.slice(0, count);
            } catch (e) {
                console.error('Local AI quiz generation failed', e);
            }
        }
        // Naive fallback: create simple multiple-choice questions
        try {
            const naive = naiveGenerateQuiz(text, count);
            return naive;
        } catch (e) {
            console.error('Naive quiz generation failed', e);
            return [];
        }
    }
};

function naiveGenerateQuiz(text, count = 5) {
    if (!text) return [];
    const sentences = text
        .replace(/\r/g, ' ')
        .split(/[\.\?!]\s+/)
        .map(s => s.trim())
        .filter(Boolean);

    const candidates = sentences.filter(s => s.split(/\s+/).length >= 6 && s.length < 250);
    if (candidates.length === 0) return [];

    const questions = [];
    const usedAnswers = new Set();

    for (let i = 0; i < candidates.length && questions.length < count; i++) {
        const sentence = candidates[i];
        const words = sentence.split(/\s+/).filter(Boolean);
        const start = Math.floor(words.length / 3);
        const answerWords = words.slice(start, Math.min(start + 3, words.length));
        let correct = answerWords.join(' ');
        if (correct.length > 60) correct = correct.split(' ').slice(0, 3).join(' ');
        if (usedAnswers.has(correct.toLowerCase())) continue;
        usedAnswers.add(correct.toLowerCase());

        // Build distractors from other candidate sentences (take similar-length snippets)
        const distractors = [];
        for (let j = 0; j < candidates.length && distractors.length < 3; j++) {
            if (j === i) continue;
            const s2 = candidates[j];
            const w2 = s2.split(/\s+/).filter(Boolean);
            const start2 = Math.floor(w2.length / 3);
            let d = w2.slice(start2, Math.min(start2 + 3, w2.length)).join(' ');
            if (d.length > 60) d = d.split(' ').slice(0, 3).join(' ');
            if (!d || d.toLowerCase() === correct.toLowerCase()) continue;
            if (!distractors.includes(d)) distractors.push(d);
        }

        // If too few distractors, create simple altered distractors
        while (distractors.length < 3) {
            const fake = correct.split(' ').map((w, idx) => (idx === 0 ? w.split('').reverse().join('') : w)).join(' ');
            if (!distractors.includes(fake)) distractors.push(fake);
            if (distractors.length >= 3) break;
        }

        const options = [correct, ...distractors].slice(0, 4);
        // Shuffle options
        for (let k = options.length - 1; k > 0; k--) {
            const r = Math.floor(Math.random() * (k + 1));
            [options[k], options[r]] = [options[r], options[k]];
        }
        const correctIndex = options.findIndex(o => o === correct);

        questions.push({
            question: `Based on the document, what best completes: "${sentence.split(' ').slice(0, 8).join(' ')}..."`,
            options,
            correctAnswer: correctIndex === -1 ? 0 : correctIndex,
            explanation: 'Auto-generated (naive)'
        });
    }
    return questions.slice(0, count);
}
