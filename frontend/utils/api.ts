/**
 * Centralized API configuration
 * This file contains all API-related constants and utilities
 */
import { getToken } from './auth';

// Base API URL with fallback to localhost for development
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to build full API endpoint URLs
export const getEndpoint = (path: string): string => {
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_URL}/${cleanPath}`;
};

// Common headers for API requests
export const getAuthHeaders = (token: string | null) => {
    if (!token) {
        return {
            'Content-Type': 'application/json'
        };
    }

    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

/**
 * Get authentication headers using the current token
 * This function gets the token and creates headers in one atomic operation
 * to avoid race conditions where the token might expire between getting it
 * and using it.
 */
export const getAuthHeadersWithCurrentToken = () => {
    const token = getToken();
    return getAuthHeaders(token);
};

/**
 * Create a fetch request configuration with authentication
 * @param method HTTP method (GET, POST, PUT, DELETE)
 * @param body Request body (will be JSON stringified)
 * @returns Fetch request configuration
 */
export const createAuthenticatedRequest = (method: string, body?: any) => {
    const token = getToken();

    const config: RequestInit = {
        method,
        headers: getAuthHeaders(token),
        cache: 'no-store',
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    return config;
};

/**
 * Standard API response interface
 */
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: {
        message: string;
        code: string;
    };
    statusCode?: number;
}

/**
 * Process API response to handle standardized format
 * @param response Fetch API response
 * @param transformData Optional function to transform the data before returning
 * @returns Processed data or throws an error with details
 */
export async function processApiResponse<T>(
    response: Response,
    transformData?: (data: any) => T
): Promise<T> {
    // Get response text first for debugging
    const responseText = await response.text();

    // Try to parse as JSON
    let data: ApiResponse<T>;
    try {
        data = JSON.parse(responseText);
    } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error(`Server returned an invalid response: ${responseText.substring(0, 100)}...`);
    }

    // Check if response was successful
    if (!response.ok || !data.success) {
        const errorMessage = data.error?.message || data.message || 'Unknown error occurred';
        const errorCode = data.error?.code || 'UNKNOWN_ERROR';

        const error = new Error(errorMessage);
        (error as any).code = errorCode;
        (error as any).statusCode = data.statusCode || response.status;

        throw error;
    }

    // Apply custom transformation if provided
    if (transformData) {
        return transformData(data.data);
    }

    // Return the data
    return data.data as T;
} 