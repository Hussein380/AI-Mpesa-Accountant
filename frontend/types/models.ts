/**
 * User model
 */
export interface User {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    role?: 'user' | 'admin';
    createdAt: string;
}

/**
 * Transaction model
 */
export interface Transaction {
    _id?: string;
    transactionId: string;
    date: string | Date;
    type: 'SENT' | 'RECEIVED' | 'PAYMENT' | 'WITHDRAWAL' | 'DEPOSIT' | 'OTHER';
    amount: number;
    balance?: number | null;
    recipient?: string;
    sender?: string;
    description?: string;
    category?: string;
    source?: 'PDF' | 'SMS' | 'MANUAL' | 'TEST';
    mpesaReference?: string;
    confidence?: number;
    format?: string;
    parsingMethod?: string;
    statementRef?: string;
    createdAt?: string;
    user?: string;
}

/**
 * Statement model
 */
export interface Statement {
    _id: string;
    filename: string;
    originalFilename: string;
    fileSize: number;
    mimeType: string;
    startDate: string | Date;
    endDate: string | Date;
    format?: string;
    confidence?: number;
    transactionCount: number;
    totalIncome: number;
    totalExpenses: number;
    netAmount: number;
    processed: boolean;
    processingErrors?: Array<{
        message: string;
        code: string;
        timestamp: string;
    }>;
    reprocessCount?: number;
    lastProcessed?: string | Date;
    analysis?: any;
    createdAt: string;
    user: string;
}

/**
 * Chat message model
 */
export interface ChatMessage {
    _id?: string;
    user?: string;
    sessionId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt?: string;
}

/**
 * API response model
 */
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: {
        message: string;
        code: string;
    };
    statusCode?: number;
} 