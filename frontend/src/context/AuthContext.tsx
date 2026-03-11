import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import authService from '../services/authService';

interface User {
    id: string;
    name: string;
    email: string;
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const savedUser = localStorage.getItem('user');
            const savedToken = localStorage.getItem('token');

            if (savedToken && !savedUser) {
                // Token exists but user data is missing, fetch from database
                try {
                    const data = await authService.getProfile(savedToken);
                    const fetchedUser: User = {
                        id: data.user._id,
                        name: data.user.name,
                        email: data.user.email,
                        createdAt: data.user.createdAt
                    };
                    setUser(fetchedUser);
                    localStorage.setItem('user', JSON.stringify(fetchedUser));
                } catch (error) {
                    console.error('Failed to fetch user profile:', error);
                    // Clear invalid token/user if profile fetch fails
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                }
            } else if (savedUser && savedToken) {
                setUser(JSON.parse(savedUser));
            }
            setLoading(false);
        };

        fetchUserProfile();
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
