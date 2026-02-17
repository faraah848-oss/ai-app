import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, RotateCw, BookOpen, ChevronLeft, ChevronRight, Trash2, Eye } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

type ViewMode = 'history' | 'study';

export default function Flashcards() {
    const { documentId } = useParams();
    const navigate = useNavigate();
    const [flashcards, setFlashcards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('study');
    const [selectedFlashcard, setSelectedFlashcard] = useState<any>(null);

    useEffect(() => {
        fetchFlashcards();
    }, [documentId]);

    const fetchFlashcards = async () => {
        try {
            if (documentId) {
                // Fetch flashcards for specific document
                const response = await api.get(`/flashcards/document/${documentId}`);
                setFlashcards(response.data);
                setViewMode('study');
            } else {
                // Fetch all flashcards (history view)
                const response = await api.get('/flashcards');
                setFlashcards(response.data);
                setViewMode('history');
            }
        } catch (error) {
            console.error('Failed to fetch flashcards:', error);
            toast.error('Failed to load flashcards');
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async (id: string) => {
        try {
            const response = await api.patch(`/flashcards/${id}/favorite`);
            setFlashcards(flashcards.map(fc =>
                fc._id === id ? response.data : fc
            ));
            toast.success(response.data.isFavorite ? 'Added to favorites' : 'Removed from favorites');
        } catch (error) {
            toast.error('Failed to update favorite');
        }
    };

    const deleteFlashcard = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this flashcard?')) {
            try {
                await api.delete(`/flashcards/${id}`);
                const updatedFlashcards = flashcards.filter(fc => fc._id !== id);
                setFlashcards(updatedFlashcards);
                
                if (updatedFlashcards.length === 0) {
                    if (documentId) {
                        navigate(`/documents/${documentId}`);
                    }
                } else if (currentIndex >= updatedFlashcards.length) {
                    setCurrentIndex(currentIndex - 1);
                }
                
                toast.success('Flashcard deleted');
            } catch (error) {
                toast.error('Failed to delete flashcard');
            }
        }
    };

    const handleNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setFlipped(false);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setFlipped(false);
        }
    };

    const startStudying = (flashcard: any) => {
        setSelectedFlashcard(flashcard);
        const index = flashcards.findIndex(fc => fc._id === flashcard._id);
        setCurrentIndex(index);
        setFlipped(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:16px_16px] opacity-30"></div>
                <div className="relative flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm font-medium">Preparing decks...</p>
                </div>
            </div>
        );
    }

    // History view - show all flashcards as a list
    if (viewMode === 'history' && !selectedFlashcard) {
        return (
            <div className="space-y-10">
                <div className="relative max-w-6xl mx-auto space-y-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold text-slate-900">Flashcard History</h1>
                            <p className="text-slate-500 text-sm mt-1">All recently generated flashcards</p>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-sm font-semibold group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back
                        </button>
                    </div>

                    {flashcards.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                                <BookOpen className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">No flashcards yet</h3>
                            <p className="text-slate-500 mt-2 text-sm">Create flashcards from documents to get started</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {flashcards.map((fc) => (
                                <div key={fc._id} className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 shadow-lg shadow-slate-200/20 hover:shadow-xl hover:shadow-slate-200/30 transition-all duration-300 group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 w-fit px-2 py-1 rounded-md mb-3">
                                                {fc.documentId?.title || 'Document'}
                                            </p>
                                            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
                                                {fc.question}
                                            </h3>
                                        </div>
                                        <button
                                            onClick={() => toggleFavorite(fc._id)}
                                            className="ml-2 p-2 rounded-lg text-slate-300 hover:text-emerald-500 transition-colors"
                                        >
                                            <Star className={`w-5 h-5 ${fc.isFavorite ? 'fill-emerald-500 text-emerald-500' : ''}`} />
                                        </button>
                                    </div>

                                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 italic">
                                        {fc.answer}
                                    </p>

                                    <p className="text-[10px] text-slate-400 mb-4">
                                        {new Date(fc.createdAt).toLocaleDateString()}
                                    </p>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => startStudying(fc)}
                                            className="flex-1 h-9 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            Study
                                        </button>
                                        <button
                                            onClick={() => deleteFlashcard(fc._id)}
                                            className="h-9 px-3 bg-white border border-red-200 hover:bg-red-50 text-red-500 rounded-lg text-xs font-semibold flex items-center justify-center transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Study/Detail view
    if (flashcards.length === 0) {
        return (
            <div className="space-y-10">
                <div className="relative max-w-4xl mx-auto text-center">
                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl max-w-md mx-auto py-20 flex flex-col items-center shadow-xl shadow-slate-200/50">
                        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
                            <BookOpen className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">No flashcards found</h3>
                        <p className="text-slate-500 mt-2 mb-8 text-sm">Create some flashcards from the document viewer first.</p>
                        <button
                            onClick={() => documentId ? navigate(`/documents/${documentId}`) : navigate('/')}
                            className="group relative h-12 px-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 overflow-hidden"
                        >
                            <span className="relative z-10">{documentId ? 'Return to Material' : 'Back to Dashboard'}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];
    const progress = ((currentIndex + 1) / flashcards.length) * 100;

    return (
        <div className="space-y-10">
            <div className="relative max-w-3xl mx-auto space-y-10">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => {
                            if (viewMode === 'history') {
                                setSelectedFlashcard(null);
                            } else {
                                navigate(documentId ? `/documents/${documentId}` : '/');
                            }
                        }}
                        className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-sm font-semibold group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        {viewMode === 'history' ? 'Back to History' : 'Back to Material'}
                    </button>

                    <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-sm">
                        Card {currentIndex + 1} of {flashcards.length}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Flashcard Area */}
                <div className="perspective-1000 relative group">
                    <div
                        onClick={() => setFlipped(!flipped)}
                        className={`relative w-full min-h-[450px] cursor-pointer transition-all duration-700 preserve-3d shadow-2xl shadow-slate-200/50 rounded-[2.5rem] border border-slate-200/60 ${flipped ? 'rotate-y-180' : ''}`}
                    >
                        {/* Front */}
                        <div className="absolute inset-0 backface-hidden bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center">
                            <div className="absolute top-8 right-8 flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(currentCard._id);
                                    }}
                                    className="p-3 rounded-2xl bg-white border border-slate-100 hover:bg-emerald-50 text-slate-300 hover:text-emerald-500 transition-all active:scale-90 shadow-sm"
                                >
                                    <Star className={`w-6 h-6 ${currentCard.isFavorite ? 'fill-emerald-500 text-emerald-500' : ''}`} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteFlashcard(currentCard._id);
                                    }}
                                    className="p-3 rounded-2xl bg-white border border-slate-100 hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all active:scale-90 shadow-sm"
                                >
                                    <Trash2 className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 px-3 py-1 rounded-full">Question</span>
                                <p className="text-3xl font-semibold text-slate-900 leading-tight">
                                    {currentCard.question}
                                </p>
                            </div>

                            <div className="absolute bottom-10 flex flex-col items-center gap-3 opacity-30 group-hover:opacity-60 transition-opacity">
                                <RotateCw className="w-5 h-5 animate-spin-slow" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tap to Reveal</span>
                            </div>
                        </div>

                        {/* Back */}
                        <div className="absolute inset-0 backface-hidden bg-slate-900 text-white rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center rotate-y-180">
                            <div className="space-y-6">
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] bg-white/10 px-3 py-1 rounded-full">Explanation</span>
                                <p className="text-2xl font-medium leading-relaxed italic opacity-90">
                                    {currentCard.answer}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-center gap-8">
                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-500/30 transition-all disabled:opacity-20 disabled:hover:border-slate-200 shadow-lg shadow-slate-200/20"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={currentIndex === flashcards.length - 1}
                        className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl flex items-center justify-center hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-20 shadow-lg shadow-emerald-500/25"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}
