"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowUp, ArrowDown, User, LogOut } from "lucide-react"
import { MpesaTransaction, formatCurrency, formatDate } from "@/lib/mpesa-parser"
import { useAuth } from "@/lib/context/AuthContext"
import { useSearchParams } from "next/navigation"
import { getToken } from '../../utils/auth'
import { getEndpoint, createAuthenticatedRequest, processApiResponse } from '../../utils/api'
import { Transaction, TransactionResponse } from '@/src/types/models'
import SpendingTrendsChart from '@/components/SpendingTrendsChart'

export default function Dashboard() {
    const [transactions, setTransactions] = useState<MpesaTransaction[]>([])
    const [stats, setStats] = useState({
        income: 0,
        expenses: 0,
        balance: 0,
        count: 0
    })
    const [loading, setLoading] = useState(true)
    const { user, logout } = useAuth()
    const searchParams = useSearchParams()
    const refreshParam = searchParams.get('refresh')
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 0 })
    const [spendingTrends, setSpendingTrends] = useState<{ month: string; income: number; expenses: number; }[]>([])

    // Fetch transactions from the database
    useEffect(() => {
        const fetchTransactions = async () => {
            console.log('Dashboard: Starting to fetch transactions...')
            setLoading(true)
            setError(null) // Clear any previous errors

            try {
                // Use our improved API utilities to create an authenticated request
                const apiUrl = getEndpoint('transactions?limit=100')
                console.log('Dashboard: Fetching from URL:', apiUrl)

                // Create request with authentication in one atomic operation
                const requestConfig = createAuthenticatedRequest('GET')

                // Add timeout to prevent hanging requests
                requestConfig.signal = AbortSignal.timeout(15000) // 15 second timeout

                const response = await fetch(apiUrl, requestConfig)

                // Process the response using our standardized handler
                const data = await processApiResponse<TransactionResponse>(response, (responseData) => {
                    return responseData;
                });

                console.log('Dashboard: Fetched transactions count:', data.transactions.length)

                // Debug: Log the first few transactions to check their structure
                if (data.transactions.length > 0) {
                    console.log('Dashboard: First transaction:', JSON.stringify(data.transactions[0]));
                    console.log('Dashboard: First transaction balance:', data.transactions[0].balance);
                    console.log('Dashboard: First transaction balance type:', typeof data.transactions[0].balance);
                }

                // Update state with the fetched data
                setTransactions(data.transactions)
                setPagination(data.pagination)

                // Calculate income and expenses
                const income = data.transactions.reduce(
                    (sum, t) => t.type === 'RECEIVED' ? sum + t.amount : sum,
                    0
                );

                const expenses = data.transactions.reduce(
                    (sum, t) => ['SENT', 'PAYMENT', 'WITHDRAWAL'].includes(t.type) ? sum + t.amount : sum,
                    0
                );

                // Calculate balance as income - expenses
                // This is more reliable than using the balance field from transactions
                const balance = income - expenses;
                console.log('Dashboard: Calculated balance from income and expenses:', balance);

                const completeStats = {
                    income,
                    expenses,
                    balance,
                    count: data.transactions.length
                }

                console.log('Dashboard: Stats calculated:', completeStats);
                setStats(completeStats)

                // Generate spending trends data
                generateSpendingTrends(data.transactions);

            } catch (error) {
                console.error('Dashboard: Error fetching transactions:', error)
                setError(error instanceof Error ? error.message : 'Failed to fetch transactions')
                setTransactions([])
                setStats({ income: 0, expenses: 0, balance: 0, count: 0 })
                setSpendingTrends([])
            } finally {
                setLoading(false)
                console.log('Dashboard: Fetch completed, loading set to false')
            }
        }

        console.log('Dashboard: useEffect triggered, calling fetchTransactions')
        fetchTransactions()

        // Set up refresh interval - reduced from 30 seconds to 60 seconds to reduce server load
        const interval = setInterval(() => {
            console.log('Dashboard: Refresh interval triggered')
            fetchTransactions()
        }, 60000) // Refresh every 60 seconds instead of 30

        // Clean up the interval on component unmount
        return () => {
            console.log('Dashboard: Cleaning up refresh interval')
            clearInterval(interval)
        }
    }, [refreshParam])

    // Generate spending trends data from transactions
    const generateSpendingTrends = (transactions: MpesaTransaction[]) => {
        if (!transactions || transactions.length === 0) {
            setSpendingTrends([]);
            return;
        }

        // Group transactions by month
        const monthlyData: Record<string, { income: number; expenses: number }> = {};

        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthDisplay = new Date(date.getFullYear(), date.getMonth(), 1)
                .toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    income: 0,
                    expenses: 0,
                    month: monthDisplay
                };
            }

            if (transaction.type === 'RECEIVED') {
                monthlyData[monthKey].income += transaction.amount;
            } else if (['SENT', 'PAYMENT', 'WITHDRAWAL'].includes(transaction.type)) {
                monthlyData[monthKey].expenses += transaction.amount;
            }
        });

        // Convert to array and sort by month
        const trendsArray = Object.entries(monthlyData).map(([key, data]) => ({
            month: data.month,
            income: data.income,
            expenses: data.expenses
        })).sort((a, b) => {
            const [aYear, aMonth] = a.month.split(' ');
            const [bYear, bMonth] = b.month.split(' ');
            const aDate = new Date(`${aMonth} 1, ${aYear}`);
            const bDate = new Date(`${bMonth} 1, ${bYear}`);
            return aDate.getTime() - bDate.getTime();
        });

        // Take the last 6 months of data
        const recentTrends = trendsArray.slice(-6);

        setSpendingTrends(recentTrends);
    };

    // Add a retry function
    const handleRetry = () => {
        // Force a refresh by updating the URL with a timestamp
        const url = new URL(window.location.href);
        url.searchParams.set('refresh', Date.now().toString());
        window.history.replaceState({}, '', url.toString());

        // The useEffect will be triggered by the refreshParam change
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold mb-2">
                    Welcome{user ? `, ${user.name}` : ' to AI-Pesa'}
                </h1>
                <p className="text-gray-400 mb-8">Your AI-powered financial assistant</p>
            </motion.div>

            {/* User Profile Card */}
            {user && (
                <motion.div
                    className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-md mb-6 sm:mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center">
                            <div className="bg-blue-600 p-3 rounded-full mr-4">
                                <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-semibold">{user.name}</h2>
                                <p className="text-sm text-gray-400">{user.email}</p>
                                {user.phoneNumber && (
                                    <p className="text-sm text-gray-400">{user.phoneNumber}</p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center text-sm sm:text-base"
                        >
                            <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /> Logout
                        </button>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                <motion.div
                    className="bg-gray-800 rounded-lg p-3 sm:p-4 md:p-6 shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Total Income</h3>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-400 break-words">
                        {formatCurrency(stats.income)}
                    </p>
                </motion.div>
                <motion.div
                    className="bg-gray-800 rounded-lg p-3 sm:p-4 md:p-6 shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Total Expenses</h3>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-400 break-words">
                        {formatCurrency(stats.expenses)}
                    </p>
                </motion.div>
                <motion.div
                    className="bg-gray-800 rounded-lg p-3 sm:p-4 md:p-6 shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Balance</h3>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-400 break-words">
                        {stats.balance !== undefined && stats.balance !== null
                            ? formatCurrency(stats.balance)
                            : formatCurrency(stats.income - stats.expenses)}
                    </p>
                </motion.div>
            </div>

            {transactions.length === 0 && !loading ? (
                <motion.div
                    className="bg-gray-800 rounded-lg p-6 shadow-md mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <h2 className="text-xl font-semibold mb-4">Get Started</h2>
                    <p className="text-gray-300 mb-4">
                        Upload your M-Pesa statement or paste your M-Pesa SMS messages to get started with AI-powered financial analysis.
                    </p>
                    <Link href="/dashboard/upload" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                        Upload Now
                    </Link>
                </motion.div>
            ) : null}

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="mt-4 p-4 bg-red-900/30 text-red-400 rounded-lg">
                    <p>{error}</p>
                    <button
                        onClick={handleRetry}
                        className="mt-2 px-4 py-2 bg-red-800 text-white rounded hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            ) : transactions.length > 0 ? (
                <>
                    {/* Spending Trends Chart */}
                    {spendingTrends.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="mb-6 sm:mb-8"
                        >
                            <SpendingTrendsChart data={spendingTrends} />
                        </motion.div>
                    )}

                    {/* Recent Transactions */}
                    <motion.div
                        className="bg-gray-800 rounded-lg p-3 sm:p-4 md:p-6 shadow-md mb-6 sm:mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Recent Transactions</h2>

                        {/* Desktop view */}
                        <div className="hidden sm:block overflow-x-auto -mx-3 sm:-mx-4 md:mx-0">
                            <div className="inline-block min-w-full align-middle">
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Details</th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {transactions.slice(0, 5).map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-gray-700/50">
                                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs whitespace-nowrap">
                                                    {formatDate(new Date(transaction.date))}
                                                </td>
                                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs">
                                                    <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium ${transaction.type === 'RECEIVED'
                                                        ? 'bg-green-900/30 text-green-400'
                                                        : transaction.type === 'SENT'
                                                            ? 'bg-red-900/30 text-red-400'
                                                            : 'bg-gray-700 text-gray-300'
                                                        }`}>
                                                        {transaction.type}
                                                    </span>
                                                </td>
                                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs truncate max-w-[80px] sm:max-w-[120px] md:max-w-[200px]">
                                                    {transaction.recipient || transaction.sender || transaction.description || 'Unknown'}
                                                </td>
                                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-right whitespace-nowrap font-medium">
                                                    <span className={transaction.type === 'RECEIVED' ? 'text-green-400' : transaction.type === 'SENT' ? 'text-red-400' : ''}>
                                                        {formatCurrency(transaction.amount)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile view - Cards */}
                        <div className="sm:hidden space-y-3">
                            {transactions.slice(0, 5).map((transaction) => (
                                <div key={transaction.id} className="bg-gray-700/50 rounded-lg p-3 shadow-sm break-words">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                            transaction.type === 'RECEIVED' ? 'bg-green-900/30 text-green-400' :
                                            transaction.type === 'SENT' ? 'bg-red-900/30 text-red-400' :
                                            'bg-gray-700 text-gray-300'
                                        }`}>
                                            {transaction.type}
                                        </span>
                                        <span className={`text-xs font-medium ${
                                            transaction.type === 'RECEIVED' ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                            {formatCurrency(transaction.amount)}
                                        </span>
                                    </div>
                                    
                                    <div className="text-xs text-gray-300 mb-1 break-words line-clamp-2">
                                        {transaction.recipient || transaction.sender || transaction.description || 'Unknown'}
                                    </div>
                                    
                                    <div className="text-xs text-gray-400 mt-1">
                                        {formatDate(new Date(transaction.date))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {transactions.length > 5 && (
                            <div className="mt-4 text-center">
                                <Link href="/dashboard/transactions" className="text-blue-400 hover:text-blue-300 text-sm">
                                    View all {transactions.length} transactions
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </>
            ) : null}
        </div>
    )
} 