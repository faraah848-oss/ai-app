import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Trash2, CheckCircle2, Trophy } from 'lucide-react';
import api from '../utils/api';
import documentService from '../services/documentService';
import { toast } from 'react-hot-toast';

interface Document {
    _id: string;
    originalName: string;
    createdAt: string;
    fileSize: number;
}

const Documents = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [generatingQuiz, setGeneratingQuiz] = useState(false);

    const fetchDocuments = async () => {
        try {
            const response = await documentService.getDocuments();
            setDocuments(response.data);
        } catch (error) {
            toast.error('Failed to fetch documents.');
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent navigation when clicking delete
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        try {
            await documentService.deleteDocument(id);
            setDocuments(documents.filter(doc => doc._id !== id));
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
            toast.success('Document deleted');
        } catch (error) {
            toast.error('Failed to delete document');
        }
    };

    const toggleSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleMultiTopicQuiz = async () => {
        if (selectedIds.length === 0) return;

        setGeneratingQuiz(true);
        const toastId = toast.loading(`Designing quiz from ${selectedIds.length} topics...`);
        try {
            const response = await api.post('/quizzes/generate', {
                documentIds: selectedIds,
                count: 5 // Default for multi-topic
            });
            toast.success('Multi-topic quiz is ready!', { id: toastId });
            navigate(`/quiz/${response.data.quiz._id}`);
        } catch (error: any) {
            console.error('Quiz generation error:', error);
            const message = error.response?.data?.message || 'Failed to generate multi-topic quiz.';
            toast.error(message, { id: toastId });
        } finally {
            setGeneratingQuiz(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            await documentService.uploadDocument(file, file.name, (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
            });
            toast.success(`'${file.name}' uploaded successfully!`);
            fetchDocuments(); // Refresh the list
        } catch (error) {
            const apiError = error as { response?: { data?: { message?: string } } };
            toast.error(apiError.response?.data?.message || 'Upload failed.');
        } finally {
            setUploading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false,
    });

    return (
        <div className="max-w-5xl mx-auto pt-28 px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">My Documents</h1>
                    <p className="text-slate-500">Upload and manage your study materials here.</p>
                </div>

                {selectedIds.length > 0 && (
                    <button
                        onClick={handleMultiTopicQuiz}
                        disabled={generatingQuiz}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 animate-in slide-in-from-right-4"
                    >
                        <Trophy className="w-4 h-4 text-emerald-400" />
                        Generate Quiz from {selectedIds.length} Selected
                    </button>
                )}
            </div>

            {/* Upload Zone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'}`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <UploadCloud className={`w-8 h-8 transition-colors ${isDragActive ? 'text-emerald-600' : 'text-slate-500'}`} />
                    </div>
                    {isDragActive ? (
                        <p className="text-lg font-semibold text-emerald-600">Drop the PDF here...</p>
                    ) : (
                        <>
                            <p className="text-lg font-semibold text-slate-700">Drag & drop a PDF here, or click to select</p>
                            <p className="text-sm text-slate-500 mt-1">Maximum file size: 10MB</p>
                        </>
                    )}
                </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
                <div className="mt-6">
                    <p className="text-sm font-medium text-slate-600 mb-2">Uploading...</p>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                </div>
            )}

            {/* Document List */}
            <div className="mt-12">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Uploaded Files</h2>
                {documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.map((doc) => (
                            <div
                                key={doc._id}
                                onClick={() => navigate(`/documents/${doc._id}`)}
                                className={`bg-white border rounded-xl p-5 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer group relative ${selectedIds.includes(doc._id) ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200/70'}`}
                            >
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <button
                                        onClick={(e) => toggleSelection(doc._id, e)}
                                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${selectedIds.includes(doc._id) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-transparent hover:bg-slate-200'}`}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-semibold text-slate-800 truncate" title={doc.originalName}>
                                            {doc.originalName}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span>{formatFileSize(doc.fileSize)}</span>
                                            <span>•</span>
                                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => handleDelete(doc._id, e)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete document"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed">
                        <p className="text-slate-500">You haven't uploaded any documents yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Documents;