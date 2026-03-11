import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Sparkles, BookOpen, Trophy, Send, BrainCircuit, Layout, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function DocumentViewer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [document, setDocument] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'chat' | 'summary' | 'explain' | 'notes'>('chat');

    // PDF State
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    // Chat state
    const [question, setQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState<Array<{ q: string, a: string }>>([]);
    const [chatLoading, setChatLoading] = useState(false);

    // Summary state
    const [summary, setSummary] = useState('');
    const [summaryLoading, setSummaryLoading] = useState(false);

    // Explain state
    const [concept, setConcept] = useState('');
    const [explanation, setExplanation] = useState('');
    const [explainLoading, setExplainLoading] = useState(false);

    // Notes state
    const [notes, setNotes] = useState<any[]>([]);
    const [noteContent, setNoteContent] = useState('');
    const [notesLoading, setNotesLoading] = useState(false);
    const [noteSummary, setNoteSummary] = useState('');
    const [noteSummaryLoading, setNoteSummaryLoading] = useState(false);

    // AI Model Status
    const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

    useEffect(() => {
        fetchDocument();
        fetchNotes();
        checkAIStatus();
    }, [id]);

    const checkAIStatus = async () => {
        try {
            const response = await api.get('/debug/ai-status');
            setAiStatus(response.data.status);
            // If still loading, check again in 10 seconds
            if (response.data.status === 'loading') {
                setTimeout(checkAIStatus, 10000);
            }
        } catch (error) {
            console.warn('AI status check failed');
        }
    };

    const fetchNotes = async () => {
        setNotesLoading(true);
        try {
            const response = await api.get(`/notes/document/${id}`);
            setNotes(response.data);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        } finally {
            setNotesLoading(false);
        }
    };

    const fetchDocument = async () => {
        try {
            const response = await api.get(`/documents/${id}`);
            setDocument(response.data);
            if (response.data.summary) {
                setSummary(response.data.summary);
            }
        } catch (error) {
            console.error('Failed to fetch document:', error);
            toast.error('Failed to load document');
        } finally {
            setLoading(false);
        }
    };

    const handleChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;

        setChatLoading(true);
        try {
            const response = await api.post('/ai/chat', {
                documentId: id,
                question
            });
            setChatHistory([...chatHistory, { q: question, a: response.data.answer }]);
            setQuestion('');
        } catch (error: any) {
            const message = error.response?.data?.error || error.response?.data?.message || 'AI chat failed';
            toast.error(message);
        } finally {
            setChatLoading(false);
        }
    };

    const handleGenerateSummary = async () => {
        setSummaryLoading(true);
        const toastId = toast.loading('Brewing your summary...');
        try {
            const response = await api.post('/ai/summary', { documentId: id });
            setSummary(response.data.summary);
            toast.success('Summary generated!', { id: toastId });
        } catch (error: any) {
            const message = error.response?.data?.error || error.response?.data?.message || 'Summary generation failed';
            toast.error(message, { id: toastId });
        } finally {
            setSummaryLoading(false);
        }
    };

    const handleExplain = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!concept.trim()) return;

        setExplainLoading(true);
        try {
            const response = await api.post('/ai/explain', {
                documentId: id,
                concept
            });
            setExplanation(response.data.explanation);
        } catch (error: any) {
            const message = error.response?.data?.error || error.response?.data?.message || 'Explanation failed';
            toast.error(message);
        } finally {
            setExplainLoading(false);
        }
    };

    const handleGenerateFlashcards = async () => {
        const count = prompt('How many flashcards? (default: 10)') || '10';
        const toastId = toast.loading('Creating flashcards...');
        try {
            await api.post('/flashcards/generate', {
                documentId: id,
                count: parseInt(count)
            });
            toast.success('Generated! Let\'s study!', { id: toastId });
            navigate(`/flashcards/${id}`);
        } catch (error: any) {
            const message = error.response?.data?.error || error.response?.data?.message || 'Flashcard generation failed';
            toast.error(message, { id: toastId });
        }
    };

    const handleGenerateQuiz = async () => {
        const count = prompt('How many questions? (default: 5)') || '5';
        const toastId = toast.loading('Designing your quiz...');
        try {
            const response = await api.post('/quizzes/generate', {
                documentId: id,
                questionCount: parseInt(count)
            });
            toast.success('Quiz is ready!', { id: toastId });
            navigate(`/quiz/${response.data.quiz._id}`);
        } catch (error: any) {
            console.error('Quiz generation error:', error);
            const message = error.response?.data?.message || 'Quiz generation failed. Please try again or use a different document.';
            toast.error(message, { id: toastId });
        }
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteContent.trim()) return;

        try {
            const response = await api.post('/notes', {
                documentId: id,
                content: noteContent,
                pageNumber
            });
            setNotes([response.data, ...notes]);
            setNoteContent('');
            toast.success('Note saved!');
        } catch (error: any) {
            console.error('Failed to save note:', error);
            const message = error.response?.data?.message || error.response?.data?.error || 'Failed to save note';
            toast.error(message);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        try {
            await api.delete(`/notes/${noteId}`);
            setNotes(notes.filter(n => n._id !== noteId));
            toast.success('Note removed');
        } catch (error: any) {
            toast.error('Failed to delete note');
        }
    };

    const handleSummarizeNotes = async () => {
        if (notes.length === 0) return toast.error('Add some notes first!');

        setNoteSummaryLoading(true);
        const toastId = toast.loading('Summarizing your notes...');
        try {
            const response = await api.post('/notes/summarize', { documentId: id });
            setNoteSummary(response.data.summary);
            toast.success('Notes summarized!', { id: toastId });
        } catch (error: any) {
            toast.error('Failed to summarize notes', { id: toastId });
        } finally {
            setNoteSummaryLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm font-medium">Analyzing material...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Document Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 w-fit px-2 py-0.5 rounded-md">
                            <BrainCircuit className="w-3 h-3" />
                            AI Powered Context
                        </div>
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{document?.title}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleGenerateFlashcards}
                            className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2"
                        >
                            <BookOpen className="w-4 h-4 text-emerald-500" />
                            Flashcards
                        </button>
                        <button
                            onClick={handleGenerateQuiz}
                            className="h-10 px-4 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all flex items-center gap-2"
                        >
                            <Trophy className="w-4 h-4 text-emerald-400" />
                            Take Quiz
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="glass-card p-0 overflow-hidden border-slate-100 flex flex-col min-h-[750px] shadow-2xl shadow-slate-200/40 bg-slate-50/50">
                            <div className="px-6 py-4 border-b border-slate-100 bg-white/50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                                <div className="flex items-center gap-2">
                                    <Layout className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-semibold text-slate-900">Document Review</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
                                        <button
                                            onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                                            disabled={pageNumber <= 1}
                                            className="p-1 hover:bg-slate-100 rounded-md disabled:opacity-30 transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4 text-slate-600" />
                                        </button>
                                        <span className="text-xs font-bold text-slate-600 min-w-[3rem] text-center">
                                            {pageNumber} / {numPages || '--'}
                                        </span>
                                        <button
                                            onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages || prev))}
                                            disabled={pageNumber >= (numPages || 1)}
                                            className="p-1 hover:bg-slate-100 rounded-md disabled:opacity-30 transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4 text-slate-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center p-8 overflow-y-auto custom-scrollbar">
                                {document && (
                                    <Document
                                        file={`${import.meta.env.VITE_API_BASE_URL || ''}/uploads/${document.filename}`}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        loading={
                                            <div className="flex flex-col items-center gap-4 py-20">
                                                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                <p className="text-slate-400 text-sm font-medium">Loading PDF...</p>
                                            </div>
                                        }
                                        error={
                                            <div className="text-center py-20 space-y-4">
                                                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
                                                    <Info className="w-8 h-8 text-red-400" />
                                                </div>
                                                <p className="text-slate-500">Failed to load PDF.</p>
                                            </div>
                                        }
                                        className="shadow-2xl"
                                    >
                                        <Page
                                            pageNumber={pageNumber}
                                            className="shadow-xl"
                                            width={600}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                        />
                                    </Document>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* AI Assistant Sidebar */}
                    <div className="lg:col-span-4 sticky top-28 h-fit">
                        <div className="glass-card p-0 overflow-hidden border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col h-[750px]">
                            {/* AI Model Status Banner */}
                            {aiStatus === 'loading' && (
                                <div className="bg-emerald-500 text-white px-4 py-2 flex items-center gap-3 animate-pulse">
                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Local AI Model Downloading... (~700MB)</span>
                                </div>
                            )}
                            {aiStatus === 'error' && (
                                <div className="bg-amber-500 text-white px-4 py-2 flex items-center gap-3">
                                    <Info className="w-3 h-3" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Using Fast Heuristics (Model failed to load)</span>
                                </div>
                            )}
                            {aiStatus === 'ready' && (
                                <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 flex items-center gap-2 border-b border-emerald-100">
                                    <Sparkles className="w-3 h-3" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">Local AI Brain: Ready</span>
                                </div>
                            )}

                            {/* Tabs */}
                            <div className="flex border-b border-slate-100 p-1 bg-slate-50/30">
                                {['chat', 'summary', 'explain', 'notes'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-tight rounded-xl transition-all ${activeTab === tab
                                            ? 'bg-white text-emerald-600 shadow-sm'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="p-6 flex-1 flex flex-col overflow-hidden bg-white/50 backdrop-blur-sm">
                                {activeTab === 'chat' && (
                                    <>
                                        <div className="flex-1 overflow-y-auto mb-6 space-y-4 pr-1 custom-scrollbar">
                                            {chatHistory.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center text-center opacity-60 px-4">
                                                    <div className="w-12 h-12 mb-4 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                                        <MessageSquare className="w-5 h-5 text-emerald-600" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-900 mb-1">AI Study Buddy</p>
                                                    <p className="text-xs text-slate-400">Ask any question about the document to clarify your doubts.</p>
                                                </div>
                                            ) : (
                                                chatHistory.map((chat, idx) => (
                                                    <div key={idx} className="space-y-2">
                                                        <div className="flex justify-end">
                                                            <div className="bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-2xl rounded-tr-none shadow-sm shadow-slate-200">
                                                                {chat.q}
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-start">
                                                            <div className="bg-white border border-slate-100 text-slate-700 text-xs font-medium px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm shadow-slate-200/10">
                                                                {chat.a}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <form onSubmit={handleChat} className="relative">
                                            <input
                                                type="text"
                                                value={question}
                                                onChange={(e) => setQuestion(e.target.value)}
                                                placeholder="Type your question..."
                                                className="w-full h-11 pl-4 pr-12 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all font-medium"
                                                disabled={chatLoading}
                                            />
                                            <button
                                                type="submit"
                                                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors disabled:opacity-30"
                                                disabled={chatLoading || !question.trim()}
                                            >
                                                {chatLoading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                            </button>
                                        </form>
                                    </>
                                )}

                                {activeTab === 'summary' && (
                                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                                        {summary ? (
                                            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
                                                <div className="flex items-center gap-2 text-emerald-600 mb-4 pb-4 border-b border-slate-50">
                                                    <Sparkles className="w-4 h-4" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Document Insight</span>
                                                </div>
                                                <p className="text-sm leading-relaxed text-slate-600 font-medium whitespace-pre-wrap">
                                                    {summary}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6">
                                                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                                                    <Layout className="w-8 h-8" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold text-slate-900">Need a quick brief?</p>
                                                    <p className="text-xs text-slate-400">Generate a comprehensive summary of the key takeaways.</p>
                                                </div>
                                                <button
                                                    onClick={handleGenerateSummary}
                                                    className="btn-primary w-full h-10 text-xs px-6"
                                                    disabled={summaryLoading}
                                                >
                                                    {summaryLoading ? 'Processing...' : 'Summarize Material'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'explain' && (
                                    <div className="flex-1 flex flex-col overflow-hidden">
                                        <form onSubmit={handleExplain} className="mb-6 space-y-3">
                                            <div className="flex items-center gap-2 text-slate-500 px-1">
                                                <Info className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Complex Concepts</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={concept}
                                                    onChange={(e) => setConcept(e.target.value)}
                                                    placeholder="Search concept..."
                                                    className="w-full h-10 px-4 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-all font-medium"
                                                    disabled={explainLoading}
                                                />
                                                <button
                                                    type="submit"
                                                    className="h-10 px-4 bg-slate-900 text-white text-[10px] font-bold uppercase rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-30"
                                                    disabled={explainLoading || !concept.trim()}
                                                >
                                                    {explainLoading ? '...' : 'Dive'}
                                                </button>
                                            </div>
                                        </form>

                                        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                                            {explanation ? (
                                                <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm border-l-4 border-l-emerald-500">
                                                    <p className="text-sm leading-relaxed text-slate-600 font-medium">
                                                        {explanation}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                                                    <BrainCircuit className="w-10 h-10 mb-4" />
                                                    <p className="text-[10px] font-bold uppercase tracking-widest">Search a concept above</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'notes' && (
                                    <div className="flex-1 flex flex-col overflow-hidden">
                                        <form onSubmit={handleAddNote} className="mb-6 space-y-3">
                                            <div className="flex items-center justify-between px-1">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <BookOpen className="w-4 h-4" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Page {pageNumber} Notes</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleSummarizeNotes}
                                                    disabled={noteSummaryLoading || notes.length === 0}
                                                    className="text-[9px] font-bold text-emerald-600 hover:text-emerald-700 uppercase"
                                                >
                                                    Summarize All
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <textarea
                                                    value={noteContent}
                                                    onChange={(e) => setNoteContent(e.target.value)}
                                                    placeholder="Add a thought for this page..."
                                                    className="w-full h-24 p-4 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-all font-medium resize-none shadow-sm"
                                                    disabled={notesLoading}
                                                />
                                                <button
                                                    type="submit"
                                                    className="absolute right-2 bottom-2 w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-slate-800 transition-colors disabled:opacity-30"
                                                    disabled={notesLoading || !noteContent.trim()}
                                                >
                                                    <Send className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </form>

                                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-4">
                                            {noteSummary && (
                                                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl mb-4 relative group">
                                                    <div className="flex items-center gap-2 text-emerald-700 mb-2">
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">Note Summary</span>
                                                    </div>
                                                    <p className="text-xs text-emerald-800 leading-relaxed font-medium">{noteSummary}</p>
                                                    <button
                                                        onClick={() => setNoteSummary('')}
                                                        className="absolute top-2 right-2 text-emerald-400 hover:text-emerald-600"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )}

                                            {notes.length === 0 ? (
                                                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-10">
                                                    <Layout className="w-10 h-10 mb-4" />
                                                    <p className="text-[10px] font-bold uppercase tracking-widest">No notes yet</p>
                                                </div>
                                            ) : (
                                                notes.map((note: any) => (
                                                    <div
                                                        key={note._id}
                                                        className="group bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:border-slate-200 transition-all"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 bg-slate-50 rounded-md">
                                                                Page {note.pageNumber}
                                                            </span>
                                                            <button
                                                                onClick={() => handleDeleteNote(note._id)}
                                                                className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                                            >
                                                                <Info className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                                            {note.content}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
