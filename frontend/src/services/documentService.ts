import axios from 'axios';

const API_URL = 'http://localhost:5000/api/documents';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


const uploadDocument = (file: File, title: string, onUploadProgress: (progressEvent: any) => void) => {
    const formData = new FormData();
    formData.append('title', title || file.name);
    formData.append('document', file);

    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/upload`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            // Let the browser set Content-Type with boundary for FormData
        },
        onUploadProgress,
    });
};

const getDocuments = () => {
    return apiClient.get('/');
};

const deleteDocument = (id: string) => {
    return apiClient.delete(`/${id}`);
};

const documentService = { uploadDocument, getDocuments, deleteDocument };

export default documentService;