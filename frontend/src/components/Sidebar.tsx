import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, BookOpen, User, LogOut, BrainCircuit, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Documents', path: '/documents', icon: FileText },
        { name: 'Flashcards', path: '/flashcards', icon: BookOpen },
        { name: 'Quizzes', path: '/quizzes', icon: Trophy },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 px-4 py-8 flex flex-col z-40">
            <div className="flex items-center gap-3 px-2 mb-10">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-slate-900 tracking-tight">AI Learning Assistant</span>
            </div>

            <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-4 border-t border-slate-50">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
