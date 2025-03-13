import { MpesaTransaction } from "@/lib/mpesa-parser"
import { formatCurrency } from "@/lib/mpesa-parser"

interface TransactionListProps {
    transactions: MpesaTransaction[]
}

export default function TransactionList({ transactions }: TransactionListProps) {
    // Format date to a readable string
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date)
    }

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Details
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {transactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {formatDate(new Date(transaction.date))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transaction.type === 'RECEIVED'
                                            ? 'bg-green-900/30 text-green-400'
                                            : transaction.type === 'SENT' || transaction.type === 'PAYMENT' || transaction.type === 'WITHDRAWAL'
                                                ? 'bg-red-900/30 text-red-400'
                                                : 'bg-gray-700 text-gray-300'
                                        }`}>
                                        {transaction.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                                    {transaction.recipient || transaction.sender || transaction.description || 'Unknown'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                                    <span className={
                                        transaction.type === 'RECEIVED'
                                            ? 'text-green-400'
                                            : transaction.type === 'SENT' || transaction.type === 'PAYMENT' || transaction.type === 'WITHDRAWAL'
                                                ? 'text-red-400'
                                                : 'text-gray-300'
                                    }>
                                        {formatCurrency(transaction.amount)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
} 