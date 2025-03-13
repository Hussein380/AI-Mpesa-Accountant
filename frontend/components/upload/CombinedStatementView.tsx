import React from 'react';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Transaction } from '@/types/models';

interface CombinedStatementViewProps {
    transactions: Transaction[];
    reference: string;
}

/**
 * Component to display combined statement transactions
 */
const CombinedStatementView: React.FC<CombinedStatementViewProps> = ({
    transactions,
    reference
}) => {
    // Group transactions by date
    const groupedTransactions = transactions.reduce((groups, transaction) => {
        const date = formatDate(transaction.date);
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
    }, {} as Record<string, Transaction[]>);

    // Calculate totals
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="bg-gray-800 shadow-lg rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-200">Combined Statement</h3>
                <div className="text-sm text-gray-400">
                    Reference: <span className="font-medium text-gray-300">{reference}</span>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">Total Transactions:</span>
                    <span className="text-sm text-gray-300">{transactions.length}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-300">Total Amount:</span>
                    <span className="text-sm text-gray-300">{formatCurrency(totalAmount)}</span>
                </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
                {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
                    <div key={date} className="mb-4">
                        <h4 className="text-sm font-semibold mb-2 text-gray-300">{date}</h4>
                        <div className="space-y-2">
                            {dateTransactions.map((transaction) => (
                                <div
                                    key={transaction.transactionId}
                                    className="flex justify-between items-center p-2 bg-gray-700 rounded"
                                >
                                    <div>
                                        <div className="text-sm font-medium text-gray-200">{transaction.description}</div>
                                        <div className="text-xs text-gray-400">{transaction.recipient}</div>
                                    </div>
                                    <div className="text-sm font-medium text-gray-200">
                                        {formatCurrency(transaction.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CombinedStatementView; 