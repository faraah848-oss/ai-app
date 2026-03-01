import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, ArrowRight, Check, HelpCircle } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

export default function Quiz() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

    const fetchQuiz = async () => {
        try {
            const response = await api.get(`/quizzes/${quizId}`);
            setQuiz(response.data);
            setAnswers(new Array(response.data.questions.length).fill(-1));
        } catch (error) {
            console.error('Failed to fetch quiz:', error);
            toast.error('Failed to load quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (answerIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = answerIndex;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        if (answers.includes(-1)) {
            toast.error('Please answer all questions before submitting! 🍨');
            return;
        }

        setSubmitting(true);
        const toastId = toast.loading('Calculating your score...');
        try {
            await api.post(`/quizzes/${quizId}/submit`, { answers });
            toast.success('Quiz submitted! ✨', { id: toastId });
            navigate(`/quiz/${quizId}/results`);
        } catch (error) {
            toast.error('Submission failed', { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:16px_16px] opacity-30"></div>
                <div className="relative flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm font-medium">Drafting questions...</p>
                </div>
            </div>
        );
    }

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                    <HelpCircle className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Quiz Empty</h2>
                <p className="text-slate-500 mb-8 max-w-sm">We couldn't generate questions for this document. Try with a different or longer document.</p>
                <button
                    onClick={() => navigate('/documents')}
                    className="btn-primary px-8 h-12"
                >
                    Back to Documents
                </button>
            </div>
        );
    }

    const question = quiz.questions[currentQuestion];

    if (!question) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-500">Error: Question not found at index {currentQuestion}</p>
                <button onClick={() => setCurrentQuestion(0)} className="mt-4 text-emerald-600 font-bold">Restart Quiz</button>
            </div>
        );
    }

    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
        <div className="space-y-10">
            <div className="relative max-w-4xl mx-auto space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 w-fit px-2 py-0.5 rounded-md">
                            <Trophy className="w-3 h-3" />
                            Knowledge Check
                        </div>
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Active Assessment</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-400 tracking-widest uppercase shadow-sm">
                            <HelpCircle className="w-3.5 h-3.5" />
                            Question {currentQuestion + 1} / {quiz.questions.length}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Question Card */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-10 shadow-xl shadow-slate-200/50">
                            <h2 className="text-xl font-semibold text-slate-900 mb-10 leading-relaxed text-center">
                                {question.question}
                            </h2>

                            <div className="space-y-3">
                                {question.options.map((option: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        className={`w-full p-5 rounded-2xl text-left transition-all border-2 flex items-center justify-between group ${answers[currentQuestion] === idx
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold shadow-lg shadow-emerald-500/10'
                                            : 'bg-white text-slate-600 border-slate-100 hover:border-emerald-500/30 hover:bg-slate-50/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${answers[currentQuestion] === idx
                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                : 'border-slate-200 bg-slate-50 group-hover:border-emerald-500/30'
                                                }`}>
                                                {answers[currentQuestion] === idx ? (
                                                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-400">{String.fromCharCode(65 + idx)}</span>
                                                )}
                                            </div>
                                            <span className="text-sm font-medium">{option}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between gap-6 px-2">
                            <button
                                onClick={handlePrevious}
                                disabled={currentQuestion === 0}
                                className="h-12 px-6 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-20 shadow-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Previous
                            </button>

                            {currentQuestion === quiz.questions.length - 1 ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="group relative h-12 px-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 overflow-hidden"
                                >
                                    <span className="relative z-10">
                                        {submitting ? 'Submitting...' : 'Complete Evaluation'}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className="group relative h-12 px-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Next Question
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-4 space-y-6 sticky top-28">
                        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-1 border-b border-slate-50 pb-4">Quiz Matrix</h3>
                            <div className="grid grid-cols-5 gap-3">
                                {quiz.questions.map((_: any, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentQuestion(idx)}
                                        className={`w-full aspect-square rounded-xl font-bold text-xs transition-all flex items-center justify-center border-2 ${idx === currentQuestion
                                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-110 z-10'
                                            : answers[idx] !== -1
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20'
                                                : 'bg-white text-slate-300 border-slate-100 hover:border-slate-300'
                                            }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-10 space-y-5 pt-6 border-t border-slate-50">
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                                    <span className="text-slate-400">Completion</span>
                                    <span className="text-slate-900">{Math.round(progress)}%</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                                    <span className="text-slate-400">Status</span>
                                    <span className={`px-2 py-0.5 rounded-md ${answers.includes(-1) ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {answers.includes(-1) ? 'In Progress' : 'Ready'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
