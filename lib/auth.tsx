'use client';

/**
 * Auth Context and Hooks
 * 
 * Provides authentication state management across the app
 * Uses in-memory access tokens and HTTP-only refresh token cookies
 */

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
    getCurrentUser,
    logout as apiLogout,
    refreshAccessToken,
    hasAccessToken,
    type UserResponse,
} from './api';

interface AuthContextType {
    user: UserResponse | null;
    isLoading: boolean;
    isLoggedIn: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const refreshUser = useCallback(async () => {
        setIsLoading(true);

        try {
            // First, try to get user with current access token
            if (hasAccessToken()) {
                const userData = await getCurrentUser();
                setUser(userData);
                setIsLoading(false);
                return;
            }

            // No access token, try to refresh using HTTP-only cookie
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                const userData = await getCurrentUser();
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch {
            // Token refresh failed or user fetch failed
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const logout = useCallback(async () => {
        await apiLogout();
        setUser(null);
        router.push('/login');
    }, [router]);

    const value: AuthContextType = {
        user,
        isLoading,
        isLoggedIn: !!user,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

/** Hook to require authentication - redirects to login if not authenticated */
export function useRequireAuth(): AuthContextType {
    const auth = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!auth.isLoading && !auth.isLoggedIn) {
            router.push('/login');
        }
    }, [auth.isLoading, auth.isLoggedIn, router]);

    return auth;
}
