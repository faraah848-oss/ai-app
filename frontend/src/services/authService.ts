import api from '../utils/api';

const authService = {
    login: async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || 'Login failed');
        }
    },

    register: async (userData: any) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || 'Registration failed');
        }
    },

    getProfile: async (token: string) => {
        try {
            const response = await api.get('/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch profile');
        }
    }
};

export default authService;
