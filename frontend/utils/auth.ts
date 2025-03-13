/**
 * Get the authentication token from localStorage
 * @returns The authentication token or null if not found
 */
export const getToken = (): string | null => {
    if (typeof window === 'undefined') {
        return null; // Not in browser environment
    }

    const token = localStorage.getItem('token');

    // If token exists, validate it
    if (token) {
        try {
            // Check if token is expired
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000; // Convert to milliseconds

            if (Date.now() >= expiry) {
                // Token is expired, remove it
                console.log('Token expired, removing from localStorage');
                localStorage.removeItem('token');
                return null;
            }
        } catch (error) {
            console.error('Error validating token:', error);
            localStorage.removeItem('token');
            return null;
        }
    }

    return token;
};

/**
 * Check if the user is authenticated
 * @returns True if the user is authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
    return getToken() !== null;
};

/**
 * Set the authentication token in localStorage
 * @param token The authentication token to store
 */
export const setToken = (token: string): void => {
    if (typeof window === 'undefined') {
        return; // Not in browser environment
    }

    // Validate token before storing
    try {
        // Check token format
        if (!token || !token.includes('.') || token.split('.').length !== 3) {
            console.error('Invalid token format');
            return;
        }

        // Parse and validate payload
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.exp) {
            console.error('Token missing expiration');
            return;
        }

        localStorage.setItem('token', token);
        console.log('Token stored successfully');
    } catch (error) {
        console.error('Error storing token:', error);
    }
};

/**
 * Remove the authentication token from localStorage
 */
export const removeToken = (): void => {
    if (typeof window === 'undefined') {
        return; // Not in browser environment
    }
    localStorage.removeItem('token');
    console.log('Token removed from localStorage');
};

/**
 * Parse the JWT token to get the user information
 * @param token The JWT token
 * @returns The parsed user information or null if the token is invalid
 */
export const parseToken = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing token:', error);
        return null;
    }
}; 