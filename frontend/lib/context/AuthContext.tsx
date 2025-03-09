"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, setToken, removeToken, isAuthenticated } from '../../utils/auth';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string, phoneNumber?: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoading(true);

                if (isAuthenticated()) {
                    const token = getToken();

                    try {
                        // Decode the token to get user info
                        const payload = JSON.parse(atob(token.split('.')[1]));

                        // Set user from token payload
                        setUser({
                            id: payload.id,
                            name: payload.name || 'User',
                            email: payload.email || 'user@example.com'
                        });
                    } catch (error) {
                        console.error('Token parsing error:', error);
                        removeToken();
                    }
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Invalid email or password');
            }

            const data = await response.json();

            // Store token and user data
            setToken(data.token);
            setUser({
                id: data.user.id,
                name: data.user.name,
                email: data.user.email
            });

            // Debug router
            console.log('Login successful, redirecting to dashboard...');
            console.log('Router object:', router);

            // Redirect to dashboard with a slight delay to ensure state is updated
            setTimeout(() => {
                router.push('/dashboard');
            }, 100);

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (name: string, email: string, password: string, phoneNumber?: string) => {
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, phoneNumber })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create account');
            }

            const data = await response.json();

            // Store token and user data
            setToken(data.token);
            setUser({
                id: data.user.id,
                name: data.user.name,
                email: data.user.email
            });

            // Redirect to dashboard
            router.push('/dashboard');

            return data;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            removeToken();
            setUser(null);
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                login,
                signup,
                logout,
                loading
            }}
        >
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