import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, X, Award, Home, RefreshCw, BarChart3, HelpCircle, Trash2 } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

export default function QuizResults() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

    const fetchQuiz = async () => {
        try {
            const response = await api.get(`/quizzes/${quizId}`);
            setQuiz(response.data);
        } catch (error) {
            console.error('Failed to fetch quiz results:', error);
            toast.error('Failed to load results');
        } finally {
            setLoading(false);
        }
    };

    const deleteQuiz = async () => {
        if (window.confirm('Are you sure you want to delete this quiz from your history?')) {
            try {
                await api.delete(`/quizzes/${quizId}`);
                toast.success('Quiz deleted from history');
                navigate('/');
            } catch (error) {
                toast.error('Failed to delete quiz');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:16px_16px] opacity-30"></div>
                <div className="relative flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm font-medium">Finalizing score...</p>
                </div>
            </div>
        );
    }

    const percentage = quiz.totalQuestions > 0 ? Math.round((quiz.score / quiz.totalQuestions) * 100) : 0;

    return (
        <div className="space-y-10">
            <div className="relative max-w-4xl mx-auto space-y-10">
                {/* Score Hero Card */}
                <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl text-center p-12 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                        <Award className="w-64 h-64" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                            <Award className="w-10 h-10" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Assessment Completed</h1>
                            <p className="text-slate-500 text-sm">Great job! Here is how you performed in this session.</p>
                        </div>

                        <div className="py-8">
                            <div className="relative inline-flex items-center justify-center">
                                <svg className="w-48 h-48 transform -rotate-90">
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-slate-100"
                                    />
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={552.92}
                                        strokeDashoffset={552.92 - (552.92 * percentage) / 100}
                                        className="text-emerald-500 transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute text-center">
                                    <span className="text-5xl font-bold text-slate-900">{percentage}%</span>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Accuracy</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto p-4 bg-slate-50/50 rounded-2xl border border-slate-100/60 shadow-inner">
                            <div className="text-center">
                                <p className="text-lg font-semibold text-slate-900">{quiz.score}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Correct</p>
                            </div>
                            <div className="text-center border-l border-slate-200">
                                <p className="text-lg font-semibold text-slate-900">{quiz.totalQuestions}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                            <button
                                onClick={() => navigate('/')}
                                className="h-12 px-8 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Home className="w-4 h-4" />
                                Dashboard
                            </button>
                            <button
                                onClick={() => navigate(`/documents/${quiz.documentId._id}`)}
                                className="group relative h-12 px-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4" />
                                    Study More
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            </button>
                            <button
                                onClick={deleteQuiz}
                                className="h-12 px-8 bg-white border border-red-200 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Analysis Breakdown */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2 text-slate-500">
                        <BarChart3 className="w-4 h-4" />
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">Detailed Item Analysis</h2>
                    </div>

                    <div className="grid gap-6">
                        {quiz.questions.map((question: any, idx: number) => {
                            const userAnswer = quiz.userAnswers[idx];
                            const isCorrect = userAnswer === question.correctAnswer;

                            return (
                                <div key={idx} className={`bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-0 overflow-hidden shadow-lg shadow-slate-200/20 group hover:border-emerald-500/30 transition-all duration-300`}>
                                    <div className={`px-6 py-4 border-b border-slate-100/60 flex items-center justify-between ${isCorrect ? 'bg-emerald-50/20' : 'bg-red-50/20'}`}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question {idx + 1}</span>
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {isCorrect ? 'Correct' : 'Needs Review'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-8">
                                        <p className="text-lg font-medium text-slate-900 leading-snug">
                                            {question.question}
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {question.options.map((option: string, optIdx: number) => {
                                                const isUserAnswer = optIdx === userAnswer;
                                                const isCorrectAnswer = optIdx === question.correctAnswer;

                                                return (
                                                    <div
                                                        key={optIdx}
                                                        className={`p-4 rounded-xl border-2 text-sm font-medium flex items-center justify-between transition-all ${isCorrectAnswer
                                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                                                            : isUserAnswer
                                                                ? 'bg-red-50 border-red-500 text-red-700 shadow-sm'
                                                                : 'bg-white border-slate-100 text-slate-400'
                                                            }`}
                                                    >
                                                        <span className="flex-1 pr-4">{option}</span>
                                                        {isCorrectAnswer && <Check className="w-4 h-4 flex-shrink-0" strokeWidth={3} />}
                                                        {isUserAnswer && !isCorrectAnswer && <X className="w-4 h-4 flex-shrink-0" strokeWidth={3} />}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {question.explanation && (
                                            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-2 shadow-inner">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <HelpCircle className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Academic Rationale</span>
                                                </div>
                                                <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                                                    {question.explanation}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
