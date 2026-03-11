import aiService from '../../common/lib/aiService.js';
import Quiz from '../models/Quiz.js';
import Document from '../models/Document.js';
import { getDocumentText } from '../utils/documentUtils.js';

export const generateHandler = async (req, res) => {
    try {
        const { text, count, questionCount, documentId } = req.body;
        const finalCount = count || questionCount || 5;
        let content = text;

        console.log(`🎲 Quiz Generation Request: documentId=${documentId}, count=${finalCount}, hasFixedText=${!!text}`);

        if (!content && (documentId || req.body.documentIds)) {
            if (req.body.documentIds && Array.isArray(req.body.documentIds)) {
                console.log(`📚 Fetching text from multiple documents: ${req.body.documentIds.join(', ')}`);
                const docs = await Document.find({ _id: { $in: req.body.documentIds } });

                let combinedText = "";
                for (const doc of docs) {
                    const text = await getDocumentText(doc);
                    if (text) {
                        combinedText += `\n--- Content from ${doc.originalName} ---\n${text}\n`;
                    }
                }
                content = combinedText;
            } else if (documentId) {
                const doc = await Document.findById(documentId);
                if (!doc) {
                    console.warn(`⚠️ Document not found: ${documentId}`);
                    return res.status(404).json({ message: 'The document record could not be found.' });
                }

                content = await getDocumentText(doc);
            }
        }

        if (!content || content.trim().length < 10) {
            const docTitle = documentId ? (await Document.findById(documentId))?.title : 'this document';
            console.warn(`⚠️ Content insufficient for quiz generation: length=${content?.length || 0} for ${docTitle}`);
            return res.status(400).json({
                message: `No readable text was found in "${docTitle}" (length: ${content?.trim().length || 0} chars). If it is a scan, the AI cannot read it yet. Please try a different document with selectable text.`
            });
        }

        console.log(`🧠 Calling AI service to generate ${finalCount} questions...`);
        const questions = await aiService.generateQuiz(content, finalCount);
        console.log(`✅ AI successfully generated ${questions.length} questions.`);

        // Determine documentIds to save
        let finalDocumentIds = [];
        if (req.body.documentIds && Array.isArray(req.body.documentIds)) {
            finalDocumentIds = req.body.documentIds;
        } else if (documentId) {
            finalDocumentIds = [documentId];
        }

        // Save quiz to database so frontend can access it by ID
        const newQuiz = new Quiz({
            userId: req.user.userId,
            documentId: documentId, // Keep for single-doc fallback
            documentIds: finalDocumentIds,
            questions: questions,
            totalQuestions: questions.length,
            score: null,
            userAnswers: []
        });

        await newQuiz.save();
        console.log(`💾 Quiz saved to database: ${newQuiz._id}`);

        // Frontend expects { quiz: { ... } }
        res.json({ quiz: newQuiz });
    } catch (error) {
        console.error('❌ Quiz Generation Error:', error);
        res.status(500).json({ message: 'Something went wrong while designing your quiz: ' + error.message });
    }
};

export const submitHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { answers } = req.body;

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Invalid submission: answers array is required.' });
        }

        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        if (quiz.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized: You can only submit your own quizzes.' });
        }

        // Calculate score on the backend
        let score = 0;
        quiz.questions.forEach((question, index) => {
            if (answers[index] === question.correctAnswer) {
                score++;
            }
        });

        // Update quiz document
        quiz.userAnswers = answers;
        quiz.score = score;
        quiz.completedAt = new Date();

        await quiz.save();

        console.log(`✅ Quiz submitted and scored: ${id}, score: ${score}/${quiz.totalQuestions}`);

        res.json(quiz);
    } catch (error) {
        console.error('❌ Quiz Submission Error:', error);
        res.status(500).json({ message: 'Error submitting quiz: ' + error.message });
    }
};

export const getHistoryHandler = async (req, res) => {
    try {
        const history = await Quiz.find({ userId: req.user.userId })
            .populate('documentId', 'title')
            .sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        console.error('❌ Quiz History Error:', error);
        res.status(500).json({ message: 'Error fetching quiz history: ' + error.message });
    }
};
