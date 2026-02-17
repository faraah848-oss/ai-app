import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Trash2, Eye, HelpCircle } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

export default function QuizHistory() {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const response = await api.get('/quizzes');
            setQuizzes(response.data);
        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
            toast.error('Failed to load quizzes');
        } finally {
            setLoading(false);
        }
    };

    const deleteQuiz = async (quizId: string) => {
        if (window.confirm('Are you sure you want to delete this quiz from your history?')) {
            try {
                await api.delete(`/quizzes/${quizId}`);
                setQuizzes(quizzes.filter(q => q._id !== quizId));
                toast.success('Quiz deleted from history');
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
                    <p className="text-slate-400 text-sm font-medium">Loading quizzes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="relative max-w-6xl mx-auto space-y-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900">Quiz History</h1>
                        <p className="text-slate-500 text-sm mt-1">Review and manage your completed assessments</p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-sm font-semibold group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>
                </div>

                {quizzes.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                            <Trophy className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">No quizzes yet</h3>
                        <p className="text-slate-500 mt-2 text-sm">Take your first quiz to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz) => {
                            const percentage = Math.round((quiz.score / quiz.totalQuestions) * 100);
                            const scoreColor = percentage >= 80 ? 'emerald' : percentage >= 60 ? 'yellow' : 'red';

                            return (
                                <div key={quiz._id} className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 shadow-lg shadow-slate-200/20 hover:shadow-xl hover:shadow-slate-200/30 transition-all duration-300 group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 w-fit px-2 py-1 rounded-md mb-3">
                                                {quiz.documentId?.title || 'Quiz'}
                                            </p>
                                            <h3 className="text-sm font-semibold text-slate-900 mb-2">
                                                Assessment #{quiz._id.slice(-6).toUpperCase()}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Score Display */}
                                    <div className="mb-4 p-4 bg-slate-50/50 rounded-lg border border-slate-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-slate-500 font-medium">Your Score</span>
                                            <span className={`text-2xl font-bold text-${scoreColor}-600`}>
                                                {percentage}%
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r from-${scoreColor}-500 to-${scoreColor}-400`}
                                                style={{
                                                    width: `${percentage}%`,
                                                    background: scoreColor === 'emerald' 
                                                        ? 'linear-gradient(to right, rgb(16, 185, 129), rgb(52, 211, 153))'
                                                        : scoreColor === 'yellow'
                                                        ? 'linear-gradient(to right, rgb(217, 119, 6), rgb(251, 146, 60))'
                                                        : 'linear-gradient(to right, rgb(239, 68, 68), rgb(248, 113, 113))'
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs text-slate-500">
                                            <span>{quiz.score} correct</span>
                                            <span>of {quiz.totalQuestions}</span>
                                        </div>
                                    </div>

                                    {/* Quiz Details */}
                                    <div className="space-y-2 mb-4 text-xs text-slate-600">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Questions:</span>
                                            <span className="font-semibold">{quiz.totalQuestions}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Completed:</span>
                                            <span className="font-semibold">
                                                {quiz.completedAt ? new Date(quiz.completedAt).toLocaleDateString() : 'In Progress'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/quiz/${quiz._id}/results`)}
                                            className="flex-1 h-9 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            Review
                                        </button>
                                        <button
                                            onClick={() => deleteQuiz(quiz._id)}
                                            className="h-9 px-3 bg-white border border-red-200 hover:bg-red-50 text-red-500 rounded-lg text-xs font-semibold flex items-center justify-center transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Summary Stats */}
                {quizzes.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 shadow-lg shadow-slate-200/20">
                            <div className="flex items-center gap-3 mb-3">
                                <HelpCircle className="w-5 h-5 text-emerald-600" />
                                <h3 className="text-sm font-semibold text-slate-900">Total Quizzes</h3>
                            </div>
                            <p className="text-3xl font-bold text-emerald-600">{quizzes.length}</p>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 shadow-lg shadow-slate-200/20">
                            <div className="flex items-center gap-3 mb-3">
                                <Trophy className="w-5 h-5 text-amber-600" />
                                <h3 className="text-sm font-semibold text-slate-900">Average Score</h3>
                            </div>
                            <p className="text-3xl font-bold text-amber-600">
                                {Math.round(
                                    quizzes.reduce((sum, q) => sum + (q.score / q.totalQuestions) * 100, 0) / quizzes.length
                                )}%
                            </p>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 shadow-lg shadow-slate-200/20">
                            <div className="flex items-center gap-3 mb-3">
                                <HelpCircle className="w-5 h-5 text-teal-600" />
                                <h3 className="text-sm font-semibold text-slate-900">Total Questions</h3>
                            </div>
                            <p className="text-3xl font-bold text-teal-600">
                                {quizzes.reduce((sum, q) => sum + q.totalQuestions, 0)}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
