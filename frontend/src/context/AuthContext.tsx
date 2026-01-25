import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

interface User {
    id: string;
    email: string;
    full_name?: string;
    is_active: boolean;
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    login: (token: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(null);

    const fetchUser = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
        } catch (error) {
            console.error("Failed to fetch user", error);
            // Optional: logout if token is invalid
            // logout();
        }
    };

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setUser(null);
        }
    }, [token]);

    const login = async (newToken: string) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        // User will be fetched by useEffect
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
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
