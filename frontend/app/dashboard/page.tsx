"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowUp, ArrowDown, User, LogOut } from "lucide-react"
import { MpesaTransaction, formatCurrency, formatDate } from "@/lib/mpesa-parser"
import { useAuth } from "@/lib/context/AuthContext"

export default function Dashboard() {
    const [transactions, setTransactions] = useState<MpesaTransaction[]>([])
    const [stats, setStats] = useState({
        income: 0,
        expenses: 0,
        balance: 0,
        count: 0
    })
    const { user, logout } = useAuth()

    // Load transactions from localStorage on component mount
    useEffect(() => {
        try {
            // Load transactions
            const storedTransactions = localStorage.getItem('mpesaTransactions')
            if (storedTransactions) {
                const parsedTransactions = JSON.parse(storedTransactions)
                // Sort transactions by date (newest first)
                parsedTransactions.sort((a: MpesaTransaction, b: MpesaTransaction) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                setTransactions(parsedTransactions)
            }

            // Load stats
            const storedStats = localStorage.getItem('mpesaStats')
            if (storedStats) {
                const parsedStats = JSON.parse(storedStats)
                setStats({
                    ...parsedStats,
                    balance: parsedStats.income - parsedStats.expenses
                })
            }
        } catch (error) {
            console.error("Error loading transactions from localStorage:", error)
        }
    }, [])

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
                        {formatCurrency(stats.balance)}
                    </p>
                </motion.div>
            </div>

            {transactions.length === 0 ? (
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

            <motion.div
                className="bg-gray-800 rounded-lg p-3 sm:p-4 md:p-6 shadow-md mb-6 sm:mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Recent Transactions</h2>

                {transactions.length > 0 ? (
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
                                        <tr key={transaction.transactionId} className="hover:bg-gray-700/50">
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

                        {transactions.length > 10 && (
                            <div className="mt-4 text-center">
                                <Link href="/dashboard/transactions" className="text-blue-400 hover:text-blue-300 text-sm">
                                    View all {transactions.length} transactions
                                </Link>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-6 sm:py-8 text-gray-400">
                        <p>No transactions found</p>
                        <p className="text-xs sm:text-sm mt-2">Upload your M-Pesa statement or paste SMS messages to see your transactions</p>
                    </div>
                )}
            </motion.div>
        </div>
    )
} 