"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, setToken, removeToken, isAuthenticated } from '../../utils/auth';
import { getEndpoint } from '../../utils/api'

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
            console.log(`Attempting to login with API URL: ${getEndpoint('auth/login')}`);

            const response = await fetch(getEndpoint('auth/login'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            console.log(`Login response status: ${response.status}`);

            // Get response text first for debugging
            const responseText = await response.text();
            console.log('Response text preview:', responseText.substring(0, 150));

            // Check if the response is HTML (indicating an error page)
            if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                console.error('Received HTML response instead of JSON:', responseText.substring(0, 100));
                throw new Error('The server returned an HTML page instead of JSON. This usually indicates a server error or incorrect API URL.');
            }

            // Try to parse as JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse response as JSON:', parseError);
                throw new Error('Invalid response from server. Please try again later.');
            }

            // Check if the response has the new standardized format
            if (data.success !== undefined) {
                // New format
                if (!data.success) {
                    throw new Error(data.error?.message || 'Login failed');
                }

                // Extract user data from the new format
                const userData = data.data;

                // Store token and user data
                setToken(userData.token);
                setUser({
                    id: userData._id, // Note: backend uses _id, frontend uses id
                    name: userData.name,
                    email: userData.email
                });
            } else {
                // Old format (for backward compatibility)
                setToken(data.token);
                setUser({
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email
                });
            }

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
            console.log(`Attempting to register with API URL: ${getEndpoint('auth/register')}`);

            const response = await fetch(getEndpoint('auth/register'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, phoneNumber })
            });

            console.log(`Register response status: ${response.status}`);

            // Get response text first for debugging
            const responseText = await response.text();
            console.log('Response text preview:', responseText.substring(0, 150));

            // Check if the response is HTML (indicating an error page)
            if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                console.error('Received HTML response instead of JSON:', responseText.substring(0, 100));
                throw new Error('The server returned an HTML page instead of JSON. This usually indicates a server error or incorrect API URL.');
            }

            // Try to parse as JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse response as JSON:', parseError);
                throw new Error('Invalid response from server. Please try again later.');
            }

            // Check if the response has the new standardized format
            if (data.success !== undefined) {
                // New format
                if (!data.success) {
                    throw new Error(data.error?.message || 'Registration failed');
                }

                // Extract user data from the new format
                const userData = data.data;

                // Store token and user data
                setToken(userData.token);
                setUser({
                    id: userData._id, // Note: backend uses _id, frontend uses id
                    name: userData.name,
                    email: userData.email
                });
            } else {
                // Old format (for backward compatibility)
                setToken(data.token);
                setUser({
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email
                });
            }

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