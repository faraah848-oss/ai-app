import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : '/api';

const api = axios.create({
    baseURL,
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    // Add Authorization header only for protected routes
    if (token && config.url !== '/auth/login' && config.url !== '/auth/register') {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle global errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Log user out if unauthorized or forbidden
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // We could also trigger a window reload or use a custom event to update state across the app
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
