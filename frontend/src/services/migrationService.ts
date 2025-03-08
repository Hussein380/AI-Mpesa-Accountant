import axios from 'axios';
import { getAuthToken } from '../../utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface LocalTransaction {
    id: string;
    date: string | Date;
    type: string;
    amount: number;
    balance?: number;
    recipient?: string;
    sender?: string;
    description?: string;
    category?: string;
    source?: string;
}

export const migrateLocalTransactions = async (): Promise<boolean> => {
    try {
        // Get transactions from localStorage - check both old and new keys
        const oldLocalTransactions = localStorage.getItem('transactions');
        const mpesaLocalTransactions = localStorage.getItem('mpesaTransactions');

        if (!oldLocalTransactions && !mpesaLocalTransactions) {
            return true; // No data to migrate
        }

        let transactions: LocalTransaction[] = [];

        // Parse old transactions if they exist
        if (oldLocalTransactions) {
            const oldTransactions: LocalTransaction[] = JSON.parse(oldLocalTransactions);
            if (oldTransactions.length) {
                transactions = [...transactions, ...oldTransactions];
            }
        }

        // Parse mpesa transactions if they exist
        if (mpesaLocalTransactions) {
            const mpesaTransactions: LocalTransaction[] = JSON.parse(mpesaLocalTransactions);
            if (mpesaTransactions.length) {
                transactions = [...transactions, ...mpesaTransactions];
            }
        }

        if (!transactions.length) {
            return true; // No data to migrate
        }

        // Format transactions for the API
        const formattedTransactions = transactions.map(transaction => ({
            transactionId: transaction.id || transaction.transactionId || `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            date: new Date(transaction.date),
            type: transaction.type,
            amount: transaction.amount,
            balance: transaction.balance,
            recipient: transaction.recipient,
            sender: transaction.sender,
            description: transaction.description,
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
        localStorage.removeItem('mpesaTransactions');
        localStorage.removeItem('mpesaStats');
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