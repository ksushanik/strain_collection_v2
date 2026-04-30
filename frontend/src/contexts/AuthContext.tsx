'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { User } from '../types/domain';
import {
    AUTH_SESSION_CHANGED_EVENT,
    clearAuthSession,
    isGuestUser,
    persistAuthenticatedSession,
    persistGuestSession,
    readAuthSession,
} from '@/lib/auth-session';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    continueAsGuest: () => void;
    logout: () => void;
    isAuthenticated: boolean;
    isGuest: boolean;
    hasToken: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasToken, setHasToken] = useState(false);

    const syncAuthState = useCallback(() => {
        const session = readAuthSession();
        setUser(session.user);
        setHasToken(!!session.token);
        setIsLoading(false);
    }, []);

    React.useEffect(() => {
        syncAuthState();

        const handleStorage = (event: StorageEvent) => {
            if (event.key && event.key !== 'token' && event.key !== 'user') return;
            syncAuthState();
        };

        const handleSessionChanged = () => {
            syncAuthState();
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChanged);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChanged);
        };
    }, [syncAuthState]);

    const login = (token: string, userData: User) => {
        persistAuthenticatedSession(token, userData);
        setUser(userData);
        setHasToken(!!token);
    };

    const continueAsGuest = () => {
        const guestUser = persistGuestSession();
        setUser(guestUser);
        setHasToken(false);
    };

    const logout = () => {
        clearAuthSession();
        setUser(null);
        setHasToken(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            continueAsGuest,
            logout,
            isAuthenticated: !!user,
            isGuest: isGuestUser(user),
            hasToken,
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
