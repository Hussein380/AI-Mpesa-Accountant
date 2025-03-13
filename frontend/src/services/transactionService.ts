import axios from 'axios';
import { API_URL, createAuthenticatedRequest, processApiResponse } from '../../utils/api';
import { Transaction, TransactionResponse } from '../types/models';

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

        const response = await fetch(url, createAuthenticatedRequest('GET'));
        return processApiResponse<TransactionResponse>(response);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }
};

export const getTransactionById = async (id: string): Promise<Transaction> => {
    try {
        const response = await fetch(
            `${API_URL}/transactions/${id}`,
            createAuthenticatedRequest('GET')
        );

        return processApiResponse<Transaction>(response);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        throw error;
    }
};

export const createTransaction = async (transaction: Omit<Transaction, '_id' | 'createdAt' | 'user'>): Promise<Transaction> => {
    try {
        const response = await fetch(
            `${API_URL}/transactions`,
            createAuthenticatedRequest('POST', transaction)
        );

        return processApiResponse<Transaction>(response);
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }
};

export const updateTransaction = async (id: string, transaction: Partial<Transaction>): Promise<Transaction> => {
    try {
        const response = await fetch(
            `${API_URL}/transactions/${id}`,
            createAuthenticatedRequest('PUT', transaction)
        );

        return processApiResponse<Transaction>(response);
    } catch (error) {
        console.error('Error updating transaction:', error);
        throw error;
    }
};

export const deleteTransaction = async (id: string): Promise<void> => {
    try {
        const response = await fetch(
            `${API_URL}/transactions/${id}`,
            createAuthenticatedRequest('DELETE')
        );

        await processApiResponse<{ id: string }>(response);
    } catch (error) {
        console.error('Error deleting transaction:', error);
        throw error;
    }
};

export const bulkCreateTransactions = async (transactions: Omit<Transaction, '_id' | 'createdAt' | 'user'>[]): Promise<Transaction[]> => {
    try {
        const response = await fetch(
            `${API_URL}/transactions/bulk`,
            createAuthenticatedRequest('POST', { transactions })
        );

        return processApiResponse<Transaction[]>(response);
    } catch (error) {
        console.error('Error bulk creating transactions:', error);
        throw error;
    }
}; 