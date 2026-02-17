import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, BookOpen, Trophy, Clock, Bell } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface ProgressData {
    stats: {
        documents: number;
        flashcards: number;
        quizzes: number;
        averageScore: number;
    };
    recentActivity: {
        documents: any[];
        quizzes: any[];
    };
}

export default function Dashboard() {
    const { user } = useAuth();
    const [progress, setProgress] = useState<ProgressData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProgress();
    }, []);

    const fetchProgress = async () => {
        try {
            const response = await api.get('/progress');
            setProgress(response.data);
        } catch (error) {
            console.error('Failed to fetch progress:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Area */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 mt-1 font-medium">Track your learning progress and activity</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <Bell className="w-6 h-6" />
                    </button>
                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">
                        {user?.name.charAt(0)}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 bg-slate-200/50 rounded-3xl" />
                    ))}
                </div>
            ) : (
                <>
                    {/* Stats Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Documents Stat */}
                        <div className="bg-white border border-slate-100/60 rounded-[2rem] p-8 flex justify-between items-center shadow-sm">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Total Documents</p>
                                <p className="text-4xl font-bold text-slate-900">{progress?.stats.documents || 0}</p>
                            </div>
                            <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20">
                                <FileText className="w-7 h-7 text-white" />
                            </div>
                        </div>

                        {/* Flashcards Stat */}
                        <div className="bg-white border border-slate-100/60 rounded-[2rem] p-8 flex justify-between items-center shadow-sm">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Total Flashcards</p>
                                <p className="text-4xl font-bold text-slate-900">{progress?.stats.flashcards || 0}</p>
                            </div>
                            <div className="w-14 h-14 bg-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
                                <BookOpen className="w-7 h-7 text-white" />
                            </div>
                        </div>

                        {/* Quizzes Stat */}
                        <div className="bg-white border border-slate-100/60 rounded-[2rem] p-8 flex justify-between items-center shadow-sm">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Total Quizzes</p>
                                <p className="text-4xl font-bold text-slate-900">{progress?.stats.quizzes || 0}</p>
                            </div>
                            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Trophy className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Section */}
                    <div className="bg-white border border-slate-100/60 rounded-[2rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5 text-slate-500" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
                        </div>

                        <div className="space-y-4">
                            {progress?.recentActivity.documents.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 text-sm font-medium">
                                    No activity records found
                                </div>
                            ) : (
                                progress?.recentActivity.documents.map((doc: any) => (
                                    <div
                                        key={doc._id}
                                        className="group p-6 rounded-2xl border border-slate-50 hover:border-emerald-500/20 hover:bg-slate-50/50 transition-all duration-300 flex items-center justify-between"
                                    >
                                        <div className="flex gap-4">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">
                                                    Accessed Document: <span className="text-slate-600 font-medium">{doc.title}</span>
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
                                                    {new Date(doc.uploadDate).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Link
                                            to={`/documents/${doc._id}`}
                                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                                        >
                                            View
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
