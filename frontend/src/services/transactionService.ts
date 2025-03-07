import axios from 'axios';
import { getAuthToken } from '../utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Transaction {
    _id: string;
    transactionId: string;
    date: string;
    type: 'SENT' | 'RECEIVED' | 'PAYMENT' | 'WITHDRAWAL' | 'DEPOSIT' | 'OTHER';
    amount: number;
    balance?: number;
    recipient?: string;
    sender?: string;
    description?: string;
    category: 'FOOD' | 'TRANSPORT' | 'UTILITIES' | 'ENTERTAINMENT' | 'SHOPPING' | 'HEALTH' | 'EDUCATION' | 'OTHER';
    source: 'PDF' | 'SMS' | 'MANUAL';
    createdAt: string;
}

export interface TransactionResponse {
    transactions: Transaction[];
    pagination: {
        total: number;
        page: number;
        pages: number;
    };
}

const getAuthHeaders = () => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('No auth token available');
    }
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const getTransactions = async (
    page: number = 1,
    limit: number = 10,
    startDate?: Date,
    endDate?: Date
): Promise<TransactionResponse> => {
    try {
        let url = `${API_URL}/transactions?page=${page}&limit=${limit}`;
        if (startDate && endDate) {
            url += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
        }

        const response = await axios.get(url, {
            headers: getAuthHeaders()
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }
};

export const getTransactionById = async (id: string): Promise<Transaction> => {
    try {
        const response = await axios.get(`${API_URL}/transactions/${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching transaction:', error);
        throw error;
    }
};

export const createTransaction = async (transaction: Omit<Transaction, '_id' | 'createdAt'>): Promise<Transaction> => {
    try {
        const response = await axios.post(
            `${API_URL}/transactions`,
            transaction,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }
};

export const updateTransaction = async (id: string, transaction: Partial<Transaction>): Promise<Transaction> => {
    try {
        const response = await axios.put(
            `${API_URL}/transactions/${id}`,
            transaction,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating transaction:', error);
        throw error;
    }
};

export const deleteTransaction = async (id: string): Promise<void> => {
    try {
        await axios.delete(
            `${API_URL}/transactions/${id}`,
            { headers: getAuthHeaders() }
        );
    } catch (error) {
        console.error('Error deleting transaction:', error);
        throw error;
    }
};

export const bulkCreateTransactions = async (transactions: Omit<Transaction, '_id' | 'createdAt'>[]): Promise<Transaction[]> => {
    try {
        const response = await axios.post(
            `${API_URL}/transactions/bulk`,
            { transactions },
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error bulk creating transactions:', error);
        throw error;
    }
}; 