'use client';

import React, { createContext, useContext, useState } from 'react';
import { User } from '../types/domain';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isGuest: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    continueAsGuest: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_STORAGE_KEY = 'guest';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isGuest, setIsGuest] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            if (token && storedUser) {
                setUser(JSON.parse(storedUser) as User);
                setIsGuest(false);
            } else {
                setUser(null);
                setIsGuest(localStorage.getItem(GUEST_STORAGE_KEY) === 'true');
            }
        } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem(GUEST_STORAGE_KEY);
            setUser(null);
            setIsGuest(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.removeItem(GUEST_STORAGE_KEY);
        setUser(userData);
        setIsGuest(false);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem(GUEST_STORAGE_KEY);
        setUser(null);
        setIsGuest(false);
    };

    const continueAsGuest = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.setItem(GUEST_STORAGE_KEY, 'true');
        setUser(null);
        setIsGuest(true);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isGuest,
            login,
            logout,
            continueAsGuest,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
