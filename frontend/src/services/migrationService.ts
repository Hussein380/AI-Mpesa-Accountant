import axios from 'axios';
import { getAuthToken } from '../utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface LocalTransaction {
    transactionId: string;
    date: string;
    type: string;
    amount: number;
    balance?: number;
    recipient?: string;
    sender?: string;
    description?: string;
    category?: string;
    source: string;
}

export const migrateLocalTransactions = async (): Promise<boolean> => {
    try {
        // Get transactions from localStorage
        const localTransactions = localStorage.getItem('transactions');
        if (!localTransactions) {
            return true; // No data to migrate
        }

        const transactions: LocalTransaction[] = JSON.parse(localTransactions);
        if (!transactions.length) {
            return true; // No data to migrate
        }

        // Format transactions for the API
        const formattedTransactions = transactions.map(transaction => ({
            ...transaction,
            category: transaction.category || 'OTHER',
            source: transaction.source || 'MANUAL'
        }));

        // Send transactions to the backend
        const token = getAuthToken();
        if (!token) {
            throw new Error('No auth token available');
        }

        await axios.post(
            `${API_URL}/transactions/bulk`,
            { transactions: formattedTransactions },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Clear localStorage after successful migration
        localStorage.removeItem('transactions');
        return true;
    } catch (error) {
        console.error('Error migrating transactions:', error);
        return false;
    }
};

export const checkAndMigrateData = async (): Promise<void> => {
    const hasMigrated = localStorage.getItem('dataMigrated');
    if (hasMigrated === 'true') {
        return;
    }

    const success = await migrateLocalTransactions();
    if (success) {
        localStorage.setItem('dataMigrated', 'true');
    }
}; 