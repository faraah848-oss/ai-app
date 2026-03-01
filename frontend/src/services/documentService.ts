import api from '../utils/api';

const uploadDocument = (file: File, title: string, onUploadProgress: (progressEvent: any) => void) => {
    const formData = new FormData();
    formData.append('title', title || file.name);
    formData.append('document', file);

    return api.post('/documents/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
    });
};

const getDocuments = () => {
    return api.get('/documents');
};

const deleteDocument = (id: string) => {
    return api.delete(`/documents/${id}`);
};

const documentService = { uploadDocument, getDocuments, deleteDocument };

export default documentService;