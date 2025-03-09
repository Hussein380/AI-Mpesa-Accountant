/**
 * Shared model types
 * 
 * This file contains TypeScript interfaces that match the backend MongoDB models.
 * Use these types throughout the frontend to ensure consistency with the backend.
 */

/**
 * Transaction model
 * Matches the backend Transaction.js model
 */
export interface Transaction {
    _id: string;
    user: string;  // User ID reference
    transactionId: string;
    date: string;
    type: 'SENT' | 'RECEIVED' | 'PAYMENT' | 'WITHDRAWAL' | 'DEPOSIT' | 'OTHER';
    amount: number;
    balance?: number;
    recipient?: string;
    sender?: string;
    description?: string;
    category: 'FOOD' | 'TRANSPORT' | 'UTILITIES' | 'ENTERTAINMENT' | 'SHOPPING' | 'HEALTH' | 'EDUCATION' | 'OTHER';
    source: 'PDF' | 'SMS' | 'MANUAL' | 'TEST';
    createdAt: string;
    mpesaReference?: string;
}

/**
 * User model
 * Matches the backend user.model.js model
 */
export interface User {
    _id: string;
    name: string;
    email: string;
    password?: string;  // Only included in backend, not in frontend responses
    phoneNumber?: string;
    role: 'user' | 'admin';
    createdAt: string;
}

/**
 * Statement model
 * Matches the backend statement.model.js model
 */
export interface Statement {
    _id: string;
    user: string;  // User ID reference
    filename: string;
    originalFilename: string;
    fileSize: number;
    mimeType: string;
    startDate?: string;
    endDate?: string;
    transactionCount?: number;
    processed: boolean;
    createdAt: string;
}

/**
 * Chat Message model
 * Matches the backend chat.model.js model
 */
export interface ChatMessage {
    _id: string;
    user: string;  // User ID reference
    sessionId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: string;
}

/**
 * API Response interfaces
 */
export interface PaginatedResponse<T> {
    total: number;
    page: number;
    pages: number;
    items: T[];
}

export interface TransactionResponse {
    transactions: Transaction[];
    pagination: {
        total: number;
        page: number;
        pages: number;
    };
} 