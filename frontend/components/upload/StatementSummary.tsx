import React from 'react';
import { formatCurrency } from '@/lib/utils/formatters';

interface StatementSummaryProps {
    filename: string;
    transactionCount: number;
    format: string;
    totalIncome?: number;
    totalExpenses?: number;
    netAmount?: number;
    startDate?: Date;
    endDate?: Date;
}

/**
 * Component to display statement metadata
 */
const StatementSummary: React.FC<StatementSummaryProps> = ({
    filename,
    transactionCount,
    format,
    totalIncome = 0,
    totalExpenses = 0,
    netAmount = 0,
    startDate,
    endDate
}) => {
    // Format dates
    const formatDate = (date?: Date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString();
    };

    // Format statement format for display
    const formatStatementType = (format: string) => {
        switch (format) {
            case 'MPESA_STANDARD':
                return 'Standard M-Pesa Statement';
            case 'MPESA_BUSINESS':
                return 'Business M-Pesa Statement';
            case 'MPESA_LEGACY':
                return 'Legacy M-Pesa Statement';
            case 'MPESA_COMBINED':
                return 'Combined M-Pesa Statement';
            default:
                return format.replace('_', ' ').toLowerCase();
        }
    };

    return (
        <div className="bg-gray-800 shadow-lg rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Statement Summary</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-300">
                        <span className="font-medium text-gray-200">Filename:</span> {filename}
                    </p>
                    <p className="text-sm text-gray-300">
                        <span className="font-medium text-gray-200">Format:</span> {formatStatementType(format)}
                    </p>
                    <p className="text-sm text-gray-300">
                        <span className="font-medium text-gray-200">Transactions:</span> {transactionCount}
                    </p>
                    {startDate && endDate && (
                        <p className="text-sm text-gray-300">
                            <span className="font-medium text-gray-200">Period:</span> {formatDate(startDate)} - {formatDate(endDate)}
                        </p>
                    )}
                </div>

                {(totalIncome > 0 || totalExpenses > 0) && (
                    <div className="border-t md:border-t-0 md:border-l border-gray-700 pt-4 md:pt-0 md:pl-4 mt-4 md:mt-0">
                        <p className="text-sm text-gray-300">
                            <span className="font-medium text-gray-200">Total Income:</span> <span className="text-green-400">{formatCurrency(totalIncome)}</span>
                        </p>
                        <p className="text-sm text-gray-300">
                            <span className="font-medium text-gray-200">Total Expenses:</span> <span className="text-red-400">{formatCurrency(totalExpenses)}</span>
                        </p>
                        <p className="text-sm font-medium text-gray-200">
                            <span className="font-medium">Net Amount:</span> <span className={netAmount >= 0 ? "text-green-400" : "text-red-400"}>{formatCurrency(netAmount)}</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatementSummary; 