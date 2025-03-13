import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchTransactions, fetchBalance } from '@/lib/services/transactionService';
import { formatCurrency } from '@/lib/utils/formatters';
import { Transaction } from '@/types/models';

const FinancialSummary = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // Fetch transactions for income and expenses
                const response = await fetchTransactions({ limit: 100 });
                setTransactions(response.transactions || []);

                // Fetch balance directly from backend
                const balanceData = await fetchBalance();
                setBalance(balanceData.balance);

                setLoading(false);
            } catch (err) {
                console.error('Error loading financial data:', err);
                setError('Failed to load financial data');
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Calculate income and expenses from transactions
    const income = transactions
        .filter(t => t.type === 'RECEIVED')
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
        .filter(t => ['SENT', 'PAYMENT', 'WITHDRAWAL'].includes(t.type))
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Income</CardTitle>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-green-600"
                    >
                        <path d="M12 2v20M2 12h20" />
                    </svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(income)}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-red-600"
                    >
                        <path d="M12 2v20M2 12h20" />
                    </svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(expenses)}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Balance</CardTitle>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-blue-600"
                    >
                        <path d="M12 2v20M2 12h20" />
                    </svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
                    {loading && <p className="text-sm text-gray-500">Loading...</p>}
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </CardContent>
            </Card>
        </div>
    );
};

export default FinancialSummary; 