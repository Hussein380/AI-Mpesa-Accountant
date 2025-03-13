"use client"

import { useState } from 'react';
import { processSms } from '@/lib/api/statements';
import { Transaction } from '@/types/models';
import UploadForm from '@/components/upload/UploadForm';
import TransactionList from '@/components/transactions/TransactionList';
import StatementSummary from '@/components/upload/StatementSummary';
import ConfidenceIndicator from '@/components/upload/ConfidenceIndicator';
import CombinedStatementView from '@/components/upload/CombinedStatementView';

export default function UploadPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statementInfo, setStatementInfo] = useState<any>(null);
    const [isCombinedStatement, setIsCombinedStatement] = useState(false);
    const [combinedReference, setCombinedReference] = useState('');

    const handleSmsProcess = async (smsText: string) => {
        setIsLoading(true);
        setError(null);
        setIsCombinedStatement(false);

        try {
            const result = await processSms(smsText);

            if (result.success) {
                // Check if this is a combined statement
                if (result.data.transactions && Array.isArray(result.data.transactions)) {
                    setIsCombinedStatement(true);
                    setTransactions(result.data.transactions);
                    setCombinedReference(result.data.transactions[0]?.mpesaReference || '');
                    setStatementInfo({
                        id: result.data.statement._id,
                        filename: result.data.statement.filename,
                        format: result.data.statement.format,
                        confidence: result.data.statement.confidence,
                        transactionCount: result.data.transactionCount,
                        totalIncome: result.data.statement.totalIncome,
                        totalExpenses: result.data.statement.totalExpenses,
                        netAmount: result.data.statement.netAmount,
                        startDate: result.data.statement.startDate,
                        endDate: result.data.statement.endDate
                    });
                } else {
                    // Single transaction
                    setTransactions([result.data.transaction]);
                }
            } else {
                setError(result.error?.message || 'Failed to process SMS');
            }
        } catch (err) {
            setError('Failed to process SMS. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 bg-gray-900 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-100">Process M-Pesa SMS</h1>

            <UploadForm
                onSmsProcess={handleSmsProcess}
                isLoading={isLoading}
            />

            {error && (
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mt-4">
                    {error}
                </div>
            )}

            {statementInfo && (
                <div className="mt-6">
                    <StatementSummary
                        filename={statementInfo.filename}
                        transactionCount={statementInfo.transactionCount}
                        format={statementInfo.format}
                        totalIncome={statementInfo.totalIncome}
                        totalExpenses={statementInfo.totalExpenses}
                        netAmount={statementInfo.netAmount}
                        startDate={statementInfo.startDate}
                        endDate={statementInfo.endDate}
                    />
                    <ConfidenceIndicator
                        confidence={statementInfo.confidence}
                        className="mt-2"
                    />
                    </div>
                )}

            {isCombinedStatement && transactions.length > 0 && (
                <div className="mt-6">
                    <CombinedStatementView
                        transactions={transactions}
                        reference={combinedReference}
                    />
                    </div>
                )}

            {!isCombinedStatement && transactions.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-200">Extracted Transactions</h2>
                    <TransactionList transactions={transactions} />
                        </div>
                )}
        </div>
    );
} 