'use client';

import { TransactionList } from '@/components/TransactionList';
import { Transaction } from '@/services/transactionService';
import { useState } from 'react';

export default function DashboardPage() {
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const handleTransactionClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        // You can add modal or details view here
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Your Transactions</h1>
            <TransactionList onTransactionClick={handleTransactionClick} />
        </div>
    );
} 