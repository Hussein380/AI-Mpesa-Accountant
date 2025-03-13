import { formatCurrency } from "@/lib/mpesa-parser"

interface StatsProps {
    stats: {
        income: number;
        expenses: number;
        balance: number;
        count: number;
    }
}

export default function DashboardStats({ stats }: StatsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                <h3 className="text-lg font-medium mb-2 text-gray-300">Total Income</h3>
                <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(stats.income)}
                </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                <h3 className="text-lg font-medium mb-2 text-gray-300">Total Expenses</h3>
                <p className="text-2xl font-bold text-red-400">
                    {formatCurrency(stats.expenses)}
                </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 shadow-md">
                <h3 className="text-lg font-medium mb-2 text-gray-300">Balance</h3>
                <p className="text-2xl font-bold text-blue-400">
                    {formatCurrency(stats.balance)}
                </p>
            </div>
        </div>
    )
} 