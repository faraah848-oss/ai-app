import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import DocumentViewer from './pages/DocumentViewer';
import Flashcards from './pages/Flashcards';
import Quiz from './pages/Quiz';
import QuizResults from './pages/QuizResults';
import QuizHistory from './pages/QuizHistory';
import Profile from './pages/Profile';

import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';

function App() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:16px_16px] opacity-30"></div>
                <div className="relative w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
        return isAuthenticated ? (
            <div className="flex min-h-screen bg-slate-50/50">
                <Sidebar />
                <main className="flex-1 ml-64 p-8 relative min-h-screen">
                    {children}
                </main>
            </div>
        ) : (
            <Navigate to="/login" />
        );
    };

    return (
        <div className="min-h-screen relative">
            <Toaster position="top-right" />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
                <Route path="/documents/:id" element={<ProtectedRoute><DocumentViewer /></ProtectedRoute>} />
                <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
                <Route path="/flashcards/:documentId" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
                <Route path="/quizzes" element={<ProtectedRoute><QuizHistory /></ProtectedRoute>} />
                <Route path="/quiz/:quizId" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
                <Route path="/quiz/:quizId/results" element={<ProtectedRoute><QuizResults /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default App;
