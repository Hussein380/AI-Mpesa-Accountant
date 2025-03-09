"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowUp, ArrowDown, User, LogOut } from "lucide-react"
import { MpesaTransaction, formatCurrency, formatDate } from "@/lib/mpesa-parser"
import { useAuth } from "@/lib/context/AuthContext"
import { useSearchParams } from "next/navigation"
import { getToken, checkApiAvailability } from '../../utils/auth'

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

    // Fetch transactions from the database
    useEffect(() => {
        const fetchTransactions = async () => {
            console.log('Dashboard: Starting to fetch transactions...')
            setLoading(true)
            setError(null) // Clear any previous errors

            try {
                // First check if API is available
                const apiAvailable = await checkApiAvailability();
                if (!apiAvailable) {
                    console.error('Dashboard: API is not available');
                    setError('The server is currently unavailable. Please try again later.');
                    setLoading(false);
                    return;
                }

                // Get token from auth utility
                const token = getToken()
                if (!token) {
                    console.log('Dashboard: No token found, skipping fetch')
                    setLoading(false)
                    setError('You need to log in to view transactions')
                    return
                }

                console.log('Dashboard: Token found, proceeding with fetch')

                // Fetch transactions from the API
                const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/transactions?limit=100`
                console.log('Dashboard: Fetching from URL:', apiUrl)

                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    cache: 'no-store', // Ensure we don't use cached data
                    // Add timeout to prevent hanging requests
                    signal: AbortSignal.timeout(15000) // 15 second timeout
                })

                console.log('Dashboard: Response status:', response.status)

                if (!response.ok) {
                    let errorMessage = `Error connecting to API: ${response.status} ${response.statusText}`;
                    try {
                        const errorText = await response.text();
                        console.error('Dashboard: API error response:', errorText);

                        // Try to parse as JSON to get more detailed error
                        try {
                            const errorJson = JSON.parse(errorText);
                            if (errorJson.message) {
                                errorMessage = errorJson.message;
                            }
                        } catch (parseError) {
                            // If not JSON, use the text as is
                            if (errorText && errorText.length < 100) {
                                errorMessage = errorText;
                            }
                        }
                    } catch (textError) {
                        console.error('Dashboard: Failed to get error text:', textError);
                    }

                    throw new Error(errorMessage);
                }

                // Get response text first for debugging
                const responseText = await response.text()
                console.log('Dashboard: Response text preview:', responseText.substring(0, 150))

                // Try to parse as JSON
                let data
                try {
                    data = JSON.parse(responseText)
                } catch (parseError) {
                    console.error("Dashboard: Failed to parse response as JSON:", parseError)
                    throw new Error("Server returned an invalid response")
                }

                // Check if transactions array exists
                if (!data.transactions) {
                    console.log('Dashboard: No transactions array in response')
                    setTransactions([])
                    setStats({ income: 0, expenses: 0, balance: 0, count: 0 })
                    setLoading(false)
                    return
                }

                console.log('Dashboard: Fetched transactions count:', data.transactions.length)

                if (data.transactions.length === 0) {
                    console.log('Dashboard: No transactions found in response')
                    setTransactions([])
                    setStats({ income: 0, expenses: 0, balance: 0, count: 0 })
                } else {
                    console.log('Dashboard: Processing transactions from response')
                    setTransactions(data.transactions)

                    // Ensure stats has all required fields with defaults
                    const receivedStats = data.stats || { income: 0, expenses: 0 }
                    const completeStats = {
                        income: receivedStats.income || 0,
                        expenses: receivedStats.expenses || 0,
                        balance: receivedStats.balance || 0,
                        count: data.transactions.length
                    }
                    setStats(completeStats)
                }

                // Update pagination
                setPagination(data.pagination || { total: 0, page: 1, pages: 0 })

            } catch (error) {
                console.error('Dashboard: Error fetching transactions:', error)
                // Check if it's a network error
                if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                    setError('Unable to connect to the server. Please check your internet connection or try again later.')
                } else {
                    setError(`Error fetching transactions: ${error.message}`)
                }
            } finally {
                console.log('Dashboard: Fetch completed, loading set to false')
                setLoading(false)
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
                <motion.div
                    className="bg-gray-800 rounded-lg p-3 sm:p-4 md:p-6 shadow-md mb-6 sm:mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Recent Transactions</h2>

                    <div className="overflow-x-auto -mx-3 sm:-mx-4 md:mx-0">
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

                        {transactions.length > 5 && (
                            <div className="mt-4 text-center">
                                <Link href="/dashboard/transactions" className="text-blue-400 hover:text-blue-300 text-sm">
                                    View all {transactions.length} transactions
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            ) : null}
        </div>
    )
} 