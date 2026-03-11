import { pipeline as createPipeline } from '@xenova/transformers';

let generator = null;
let isInitializing = false;
let initError = null;

export async function init() {
    if (isInitializing) return;
    isInitializing = true;
    initError = null;

    try {
        if (!generator) {
            console.log('🚀 AI DEBUG: Starting model initialization...');
            console.log('🤖 AI service: Initializing local Transformers model (LaMini-Flan-T5-248M)...');
            generator = await createPipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-248M');
            console.log('✅ AI service: Local Transformers model loaded successfully');
        }
    } catch (error) {
        initError = error.message;
        console.error('❌ AI service: Initialization failed:', error.message);
    } finally {
        isInitializing = false;
    }
}

export function getStatus() {
    if (generator) return 'ready';
    if (isInitializing) return 'loading';
    if (initError) return 'error';
    return 'idle';
}

function splitTextIntoChunks(text, maxChunkSize = 10000) {
    if (!text) return [];
    if (text.length <= maxChunkSize) return [text];

    const chunks = [];
    let remainingText = text;

    while (remainingText.length > 0) {
        if (remainingText.length <= maxChunkSize) {
            chunks.push(remainingText);
            break;
        }

        let breakPoint = remainingText.lastIndexOf('\n\n', maxChunkSize);
        if (breakPoint < maxChunkSize * 0.7) {
            breakPoint = remainingText.lastIndexOf('. ', maxChunkSize);
        }
        if (breakPoint < maxChunkSize * 0.7) {
            breakPoint = maxChunkSize;
        } else {
            breakPoint += 1;
        }

        chunks.push(remainingText.substring(0, breakPoint).trim());
        remainingText = remainingText.substring(breakPoint).trim();
    }

    return chunks;
}

function extractKeySentences(text, count = 5) {
    if (!text) return [];

    // Split into sentences more robustly
    let sentences = text.split(/[.!?]+[\s\n]+/).map(s => s.trim()).filter(s => s.length > 20);
    if (sentences.length < count) {
        sentences = text.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 15);
    }
    if (sentences.length < count) {
        sentences = text.split(/[.!?\n,;]+/).map(s => s.trim()).filter(s => s.length > 10);
    }

    if (sentences.length <= count) return sentences;

    // Segmented selection to ensure topic coverage across the document
    const finalSentences = [];
    const segmentSize = Math.floor(sentences.length / count);

    for (let i = 0; i < count; i++) {
        const start = i * segmentSize;
        const end = (i === count - 1) ? sentences.length : (i + 1) * segmentSize;
        const segment = sentences.slice(start, end);

        // Pick the "best" sentence in this segment (longest/most informative)
        const bestInSegment = segment.reduce((prev, current) =>
            (current.length > prev.length) ? current : prev
            , segment[0]);

        if (bestInSegment) finalSentences.push(bestInSegment);
    }

    return finalSentences.slice(0, count);
}

function findRelevantContext(text, query, limit = 2000) {
    if (!query || typeof query !== 'string') return text.substring(0, limit);
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 3);
    const sentences = text.split(/[.!?]+\s+/);
    const scored = sentences.map(s => {
        let score = 0;
        keywords.forEach(k => { if (s.toLowerCase().includes(k)) score++; });
        return { text: s, score };
    });
    const relevant = scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(s => s.text)
        .join('. ');
    return relevant.substring(0, limit) || text.substring(0, limit);
}

const aiService = {
    init,
    getStatus,

    async chatWithDocument(text, question) {
        if (!question || question.trim().length === 0) {
            return "Please ask a specific question about the document.";
        }
        if (!text || text.trim().length < 20) {
            return "No readable text found in this document.";
        }
        if (generator) {
            try {
                const context = findRelevantContext(text, question, 1000);
                const prompt = `Context: ${context}\n\nQuestion: ${question}\n\nAnswer:`;
                const output = await generator(prompt, { max_new_tokens: 200, temperature: 0.7 });
                return output[0].generated_text;
            } catch (e) {
                console.error('Local AI chat failed', e);
            }
        }
        return "AI is still warming up.";
    },

    async summarizeDocument(text) {
        if (!text || text.trim().length <= 1) {
            return "The document appears to be empty.";
        }

        // Increase character limit for individual chunks
        const maxChars = 8000;

        if (text.length > maxChars) {
            // For very large documents, we don't want to recurse too many times
            const chunks = splitTextIntoChunks(text, maxChars);

            // If we have too many chunks, sample them for the summary
            const maxChunksToProcess = 10;
            let processingChunks = chunks;
            if (chunks.length > maxChunksToProcess) {
                console.log(`⚠️ Large document: Sampling ${maxChunksToProcess} of ${chunks.length} chunks for summary.`);
                const step = Math.floor(chunks.length / maxChunksToProcess);
                processingChunks = chunks.filter((_, i) => i % step === 0).slice(0, maxChunksToProcess);
            }

            const summaries = [];
            for (let i = 0; i < processingChunks.length; i++) {
                const chunkSummary = await this.summarizeDocument(processingChunks[i]);
                summaries.push(chunkSummary);
            }

            const combinedSummary = summaries.join('\n\n');
            if (combinedSummary.length > maxChars) {
                // One final condensation if still too large
                const prompt = `Condense these summaries into one cohesive overview:\n\n${combinedSummary.substring(0, maxChars)}`;
                if (generator) {
                    try {
                        const output = await generator(prompt, { max_new_tokens: 500, temperature: 0.5 });
                        return output[0].generated_text;
                    } catch (e) {
                        return extractKeySentences(combinedSummary, 10).map(s => `- ${s}`).join('\n');
                    }
                }
            }
            return combinedSummary;
        }

        if (generator) {
            try {
                const prompt = `Summarize text:\n\n${text}`;
                const output = await generator(prompt, { max_new_tokens: 300, temperature: 0.5 });
                return output[0].generated_text;
            } catch (e) {
                console.error('Local AI summary failed', e);
            }
        }
        return extractKeySentences(text, 5).map(s => `- ${s}`).join('\n');
    },

    async explainConcept(text, concept) {
        if (!concept || concept.trim().length === 0) {
            return "Please provide a concept or term to explain.";
        }
        if (!text || text.trim().length < 20) {
            return "No readable text found to explain this concept.";
        }
        if (generator) {
            try {
                const context = findRelevantContext(text, concept, 1500);
                const prompt = `Explain "${concept}" context: ${context}`;
                const output = await generator(prompt, { max_new_tokens: 250, temperature: 0.7 });
                return output[0].generated_text;
            } catch (e) {
                console.error('Local AI explain failed', e);
            }
        }
        return `The term "${concept}" is discussed in the context of: ${extractKeySentences(findRelevantContext(text, concept, 1000), 2).join(' ')}`;
    },

    async generateFlashcards(text, count = 5) {
        if (!text || text.trim().length < 10) {
            return [{ question: "Content too short", answer: "Too little readable text." }];
        }

        const maxChars = 8000;
        if (text.length > maxChars) {
            const chunks = splitTextIntoChunks(text, maxChars);

            // Sampling: Select up to 15 chunks evenly distributed
            const maxChunksToProcess = 15;
            let processingChunks = chunks;
            if (chunks.length > maxChunksToProcess) {
                const step = Math.floor(chunks.length / maxChunksToProcess);
                processingChunks = chunks.filter((_, i) => i % step === 0).slice(0, maxChunksToProcess);
            }

            const cardsPerChunk = Math.ceil(count / processingChunks.length);
            let allCards = [];
            for (const chunk of processingChunks) {
                const chunkCards = await this.generateFlashcards(chunk, cardsPerChunk);
                allCards = allCards.concat(chunkCards);
                if (allCards.length >= count) break;
            }
            return allCards.slice(0, count);
        }
        if (generator) {
            try {
                let sentences = extractKeySentences(text, count);
                const initialLength = sentences.length;
                while (sentences.length < count && initialLength > 0) {
                    sentences.push(sentences[sentences.length % initialLength]);
                }
                const cards = [];
                for (const s of sentences) {
                    const prompt = `Generate a short question for this statement: "${s.substring(0, 150)}"\nQuestion:`;
                    const output = await generator(prompt, { max_new_tokens: 50, temperature: 0.7 });
                    let question = output[0].generated_text.trim();
                    if (question.length < 5 || question.includes(s.substring(0, 20))) {
                        question = `What is mentioned here: "${s.substring(0, 40)}..."?`;
                    }
                    cards.push({ question, answer: s });
                    if (cards.length >= count) break;
                }
                if (cards.length > 0) return cards.slice(0, count);
            } catch (e) {
                console.error('Local AI flashcard generation failed', e);
            }
        }
        let sentences = extractKeySentences(text, count * 2);
        const cards = [];
        for (let i = 0; i < sentences.length && cards.length < count; i += 2) {
            if (sentences[i + 1]) {
                cards.push({
                    question: `Explain the following: "${sentences[i].substring(0, 100)}..."`,
                    answer: sentences[i + 1]
                });
            }
        }
        return cards.slice(0, count);
    },

    async generateQuiz(text, count = 5) {
        if (!text || text.trim().length < 20) {
            return [{
                question: "Could not generate questions",
                options: ["Content too brief", "Insufficient context", "Empty document", "OCR error"],
                correctAnswer: 0,
                explanation: "Insufficient text to generate a meaningful quiz."
            }];
        }

        const maxChars = 8000;
        if (text.length > maxChars) {
            const chunks = splitTextIntoChunks(text, maxChars);

            // Sampling: Select up to 15 chunks evenly distributed
            const maxChunksToProcess = 15;
            let processingChunks = chunks;
            if (chunks.length > maxChunksToProcess) {
                const step = Math.floor(chunks.length / maxChunksToProcess);
                processingChunks = chunks.filter((_, i) => i % step === 0).slice(0, maxChunksToProcess);
            }

            // Distribute count across chunks more equitably
            let allQuestions = [];
            const seenQuestionTexts = new Set();

            for (let i = 0; i < processingChunks.length; i++) {
                const chunk = processingChunks[i];
                // Target cumulative count for this stage
                const targetCumulative = Math.ceil(((i + 1) / processingChunks.length) * count);
                const toFetch = targetCumulative - allQuestions.length;

                if (toFetch <= 0) continue;

                const chunkQuestions = await this.generateQuiz(chunk, toFetch + 1);
                for (const q of chunkQuestions) {
                    const qNormalized = q.question.toLowerCase().trim();
                    if (!seenQuestionTexts.has(qNormalized)) {
                        allQuestions.push(q);
                        seenQuestionTexts.add(qNormalized);
                    }
                    if (allQuestions.length >= targetCumulative) break;
                }
            }

            // Final check: top up if needed
            if (allQuestions.length < count) {
                for (const chunk of processingChunks) {
                    const extra = await this.generateQuiz(chunk, count - allQuestions.length);
                    for (const q of extra) {
                        if (!seenQuestionTexts.has(q.question.toLowerCase().trim())) {
                            allQuestions.push(q);
                            seenQuestionTexts.add(q.question.toLowerCase().trim());
                        }
                        if (allQuestions.length >= count) break;
                    }
                    if (allQuestions.length >= count) break;
                }
            }

            return allQuestions.slice(0, count);
        }

        if (generator) {
            try {
                // Request 2x candidates to allow for filtering and deduplication
                const sentences = extractKeySentences(text, count * 2);
                let questions = [];
                const seenQuestions = new Set();

                for (const s of sentences) {
                    const prompt = `Based on the following statement, create a unique multiple-choice question with 4 options. The question should test the understanding of the main point.
Avoid generic questions. The correct answer must be one of the options.

Statement: "${s}"

Format the output strictly as follows:
Question: <Your question here>
Options: <Option 1> | <Option 2> | <Option 3> | <Option 4>
Correct Answer: <The correct option text>
Explanation: <A brief explanation of why the answer is correct>`;

                    const output = await generator(prompt, { max_new_tokens: 250, temperature: 0.8, do_sample: true });
                    const generatedText = output[0].generated_text;

                    const questionMatch = generatedText.match(/Question: (.*)/i);
                    const optionsMatch = generatedText.match(/Options: (.*)/i);
                    const answerMatch = generatedText.match(/Correct Answer: (.*)/i);
                    const explanationMatch = generatedText.match(/Explanation: (.*)/i);

                    if (questionMatch && optionsMatch && answerMatch) {
                        const question = questionMatch[1].trim();

                        // Deduplication check
                        if (seenQuestions.has(question.toLowerCase())) continue;

                        const options = optionsMatch[1].split('|').map(opt => opt.trim());
                        const correctAnswerText = answerMatch[1].trim();
                        const explanation = explanationMatch ? explanationMatch[1].trim() : `The text implies: "${s}"`;

                        if (options.length === 4) {
                            const correctAnswerIndex = options.findIndex(opt => opt.toLowerCase() === correctAnswerText.toLowerCase());
                            if (correctAnswerIndex !== -1) {
                                seenQuestions.add(question.toLowerCase());
                                questions.push({
                                    question,
                                    options,
                                    correctAnswer: correctAnswerIndex,
                                    explanation
                                });
                            }
                        }
                    }
                    if (questions.length >= count) break;
                }

                if (questions.length >= count) return questions.slice(0, count);

                // If AI-generated ones aren't enough, we'll continue to fallback below
                console.log(`⚠️ AI only generated ${questions.length}/${count} valid questions. Using fallback for the rest.`);
            } catch (e) {
                console.error('Local AI quiz generation failed, falling back to simple method.', e);
            }
        }

        // Fallback or Top-up to the original simple quiz generation with variety
        const fallbackSentences = extractKeySentences(text, count * 3);
        const questionTemplates = [
            "Which of the following points is emphasized in the text?",
            "Based on the material, what can be concluded about this topic?",
            "What is the primary focus of the discussed content?",
            "According to the text, which statement is true?",
            "Based on the provided information, which of these is correct?"
        ];

        let finalQuestions = []; // Start fresh if AI completely failed, or use existing if topping up
        // Note: For now, the previous block returns if questions.length > 0 if it reached count.
        // If it didn't, we need to merge. Let's make it robust.

        // This logic is a bit messy, let's fix it.
        // I will re-extract to ensure we have enough.

        let questions = [];
        // If we have some from AI, let's keep them
        // Actually, let's just use the 'questions' variable from above if it exists in scope, 
        // but it doesn't in a clean way unless I refactor.

        // Refactored flow:
        // 1. Try AI for all.
        // 2. If AI < count, top up with fallback.

        // Re-implementing more cleanly:
        let combinedQuestions = [];
        const combinedSeenQuestions = new Set();

        // This is a bit of a re-do of the loop above, but I'll optimize it.
        // (Self-correction: I'll just adjust the existing logic to be better)

        return this._generateQuizInternal(text, count);
    },

    async _generateQuizInternal(text, count) {
        let results = [];
        const seen = new Set();
        const seenSentences = new Set();

        const fallbackTemplates = [
            "Based on the content, which statement is true about \"{ref}\"?",
            "What is the primary focus of the section discussing \"{ref}\"?",
            "According to the text, what can be concluded regarding \"{ref}\"?",
            "Which of the following best describes the information about \"{ref}\"?",
            "The passage mentions \"{ref}\" - what is the key takeaway?",
            "What does the author suggest in the context of \"{ref}\"?",
            "Which detail is highlighted concerning \"{ref}\"?",
            "What is the significance of \"{ref}\" as described in the text?",
            "Regarding \"{ref}\", which of these points is emphasized?",
            "Based on the provided material, what is true about \"{ref}\"?"
        ];

        if (generator) {
            try {
                const sentences = extractKeySentences(text, count * 3);
                for (const s of sentences) {
                    const prompt = `Based on this: "${s}"\nCreate a unique multiple-choice question.\nQuestion:\nOptions: A|B|C|D\nCorrect Answer: <Full text of correct option>\nExplanation:`;
                    const output = await generator(prompt, { max_new_tokens: 300, temperature: 0.85, do_sample: true });
                    const genText = output[0].generated_text;

                    const q = genText.match(/Question: (.*)/i)?.[1]?.trim();
                    const optsMatch = genText.match(/Options: (.*)/i);
                    const ans = genText.match(/Correct Answer: (.*)/i)?.[1]?.trim();

                    if (q && optsMatch && ans) {
                        const opts = optsMatch[1].split('|').map(o => o.trim());
                        if (opts.length === 4 && !seen.has(q.toLowerCase())) {
                            const idx = opts.findIndex(o => o.toLowerCase() === ans.toLowerCase());
                            if (idx !== -1) {
                                seen.add(q.toLowerCase());
                                seenSentences.add(s.toLowerCase());
                                results.push({
                                    question: q,
                                    options: opts,
                                    correctAnswer: idx,
                                    explanation: genText.match(/Explanation: (.*)/i)?.[1]?.trim() || `Verified by: "${s.substring(0, 100)}..."`
                                });
                            }
                        }
                    }
                    if (results.length >= count) return results;
                }
            } catch (err) { console.error("AI Gen error", err); }
        }

        // Top up with varied fallback
        const sentences = extractKeySentences(text, count * 6);
        for (const s of sentences) {
            if (results.length >= count) break;
            if (seenSentences.has(s.toLowerCase())) continue;

            let refText = s.substring(0, 60).replace(/^[^a-zA-Z0-9]+/, "").trim();
            if (refText.length > 50) refText = refText.substring(0, 47) + "...";
            const template = fallbackTemplates[results.length % fallbackTemplates.length];
            const q = template.replace("{ref}", refText);

            if (seen.has(q.toLowerCase())) continue;

            const options = [s];
            let retries = 0;
            while (options.length < 4 && retries < 20) {
                const dist = sentences[Math.floor(Math.random() * sentences.length)];
                if (dist && !options.includes(dist) && dist.length > 10) options.push(dist);
                retries++;
            }

            if (options.length < 4) {
                const fill = ["None of the mentioned points", "Further study is required", "Detailed in later sections", "Not explicitly stated"];
                for (const f of fill) {
                    if (options.length < 4 && !options.includes(f)) options.push(f);
                }
            }

            const shuffled = [...options].sort(() => Math.random() - 0.5);
            results.push({
                question: q,
                options: shuffled,
                correctAnswer: shuffled.indexOf(s),
                explanation: `The material states: "${s}"`
            });
            seen.add(q.toLowerCase());
            seenSentences.add(s.toLowerCase());
        }

        return results.slice(0, count);
    }
};

export default aiService;
