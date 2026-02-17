import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BrainCircuit, Home, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-2xl px-6 h-16 flex justify-between items-center shadow-lg shadow-slate-200/20">
                    <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <BrainCircuit className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-semibold text-slate-900 tracking-tight">Learnix</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link
                            to="/"
                            className={`p-2.5 rounded-xl transition-all duration-200 ${isActive('/')
                                ? 'bg-emerald-50 text-emerald-600 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Home className="w-5 h-5" strokeWidth={isActive('/') ? 2.5 : 2} />
                        </Link>

                        <Link
                            to="/documents"
                            className={`p-2.5 rounded-xl transition-all duration-200 ${isActive('/documents')
                                ? 'bg-emerald-50 text-emerald-600 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <FileText className="w-5 h-5" strokeWidth={isActive('/documents') ? 2.5 : 2} />
                        </Link>

                        <div className="w-px h-6 bg-slate-200 mx-2" />

                        <div className="flex items-center gap-3 pl-2">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <span className="text-xs font-semibold text-slate-900">{user?.name}</span>
                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Learner</span>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                                title="Sign out"
                            >
                                <LogOut className="w-5 h-5" strokeWidth={2} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
