import React from 'react';
import { Transaction } from '@/types/models';
import { formatCurrency, formatDateTime, formatTransactionType } from '@/lib/utils/formatters';

interface TransactionListProps {
    transactions: Transaction[];
}

/**
 * Component to display a list of transactions
 */
const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="bg-gray-800 shadow-lg rounded-lg p-6 text-center">
                <p className="text-gray-400">No transactions to display</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Description
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Amount
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Balance
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {transactions.map((transaction) => (
                            <tr key={transaction._id || transaction.transactionId} className="hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                    {formatDateTime(transaction.date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.type === 'RECEIVED'
                                        ? 'bg-green-900 text-green-300'
                                        : transaction.type === 'SENT' || transaction.type === 'PAYMENT' || transaction.type === 'WITHDRAWAL'
                                            ? 'bg-red-900 text-red-300'
                                            : 'bg-gray-700 text-gray-300'
                                        }`}>
                                        {formatTransactionType(transaction.type)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-300">
                                    <div>{transaction.description}</div>
                                    {transaction.recipient && (
                                        <div className="text-xs text-gray-400">
                                            To: {transaction.recipient}
                                        </div>
                                    )}
                                    {transaction.sender && (
                                        <div className="text-xs text-gray-400">
                                            From: {transaction.sender}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <span className={transaction.type === 'RECEIVED' ? 'text-green-400' : 'text-red-400'}>
                                        {transaction.type === 'RECEIVED' ? '+' : '-'} {formatCurrency(transaction.amount)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                    {formatCurrency(transaction.balance)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionList; 