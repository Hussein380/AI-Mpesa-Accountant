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
                    className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-md mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-blue-600 p-3 rounded-full mr-4">
                                <User className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">{user.name}</h2>
                                <p className="text-gray-400">{user.email}</p>
                                {user.phoneNumber && (
                                    <p className="text-gray-400">{user.phoneNumber}</p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center"
                        >
                            <LogOut className="h-4 w-4 mr-2" /> Logout
                        </button>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <motion.div
                    className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <h3 className="text-lg font-medium mb-2">Total Income</h3>
                    <p className="text-3xl md:text-3xl sm:text-2xl xs:text-xl font-bold text-green-400 break-words">
                        {formatCurrency(stats.income)}
                    </p>
                </motion.div>
                <motion.div
                    className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h3 className="text-lg font-medium mb-2">Total Expenses</h3>
                    <p className="text-3xl md:text-3xl sm:text-2xl xs:text-xl font-bold text-red-400 break-words">
                        {formatCurrency(stats.expenses)}
                    </p>
                </motion.div>
                <motion.div
                    className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <h3 className="text-lg font-medium mb-2">Balance</h3>
                    <p className="text-3xl md:text-3xl sm:text-2xl xs:text-xl font-bold text-blue-400 break-words">
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
                className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-md mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>

                {transactions.length > 0 ? (
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider">Type</th>
                                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider">Details</th>
                                    <th className="px-4 py-3 text-right text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {transactions.slice(0, 5).map((transaction) => (
                                    <tr key={transaction.transactionId} className="hover:bg-gray-700/50">
                                        <td className="px-4 py-3 text-xs sm:text-sm whitespace-nowrap">
                                            {formatDate(new Date(transaction.date))}
                                        </td>
                                        <td className="px-4 py-3 text-xs sm:text-sm">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${transaction.type === 'RECEIVED'
                                                ? 'bg-green-900/30 text-green-400'
                                                : transaction.type === 'SENT'
                                                    ? 'bg-red-900/30 text-red-400'
                                                    : 'bg-gray-700 text-gray-300'
                                                }`}>
                                                {transaction.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px]">
                                            {transaction.recipient || transaction.sender || transaction.description || 'Unknown'}
                                        </td>
                                        <td className="px-4 py-3 text-xs sm:text-sm text-right whitespace-nowrap font-medium">
                                            <span className={transaction.type === 'RECEIVED' ? 'text-green-400' : transaction.type === 'SENT' ? 'text-red-400' : ''}>
                                                {formatCurrency(transaction.amount)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {transactions.length > 10 && (
                            <div className="mt-4 text-center">
                                <Link href="/dashboard/transactions" className="text-blue-400 hover:text-blue-300">
                                    View all {transactions.length} transactions
                                </Link>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <p>No transactions found</p>
                        <p className="text-sm mt-2">Upload your M-Pesa statement or paste SMS messages to see your transactions</p>
                    </div>
                )}
            </motion.div>
        </div>
    )
} 