"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowUp, ArrowDown } from "lucide-react"
import { MpesaTransaction, formatCurrency, formatDate } from "@/lib/mpesa-parser"

export default function Dashboard() {
    const [transactions, setTransactions] = useState<MpesaTransaction[]>([])
    const [stats, setStats] = useState({
        income: 0,
        expenses: 0,
        balance: 0,
        count: 0
    })

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
                <h1 className="text-3xl font-bold mb-2">Welcome to AI-Pesa</h1>
                <p className="text-gray-400 mb-8">Your AI-powered financial assistant</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div
                    className="bg-gray-800 rounded-lg p-6 shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <h3 className="text-lg font-medium mb-2">Total Income</h3>
                    <p className="text-3xl font-bold text-green-400">
                        {formatCurrency(stats.income)}
                    </p>
                </motion.div>
                <motion.div
                    className="bg-gray-800 rounded-lg p-6 shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h3 className="text-lg font-medium mb-2">Total Expenses</h3>
                    <p className="text-3xl font-bold text-red-400">
                        {formatCurrency(stats.expenses)}
                    </p>
                </motion.div>
                <motion.div
                    className="bg-gray-800 rounded-lg p-6 shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <h3 className="text-lg font-medium mb-2">Balance</h3>
                    <p className="text-3xl font-bold text-blue-400">
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
                className="bg-gray-800 rounded-lg p-6 shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>

                {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <p>No transactions found</p>
                        <p className="text-sm mt-2">Upload your M-Pesa statement or paste SMS messages to see your transactions</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="text-left text-gray-400 border-b border-gray-700">
                                <tr>
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3">Type</th>
                                    <th className="pb-3">Details</th>
                                    <th className="pb-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {transactions.slice(0, 10).map((transaction, index) => (
                                    <tr key={index} className="hover:bg-gray-700/30">
                                        <td className="py-3 text-sm">
                                            {formatDate(new Date(transaction.date))}
                                        </td>
                                        <td className="py-3">
                                            {transaction.type === 'RECEIVED' ? (
                                                <span className="inline-flex items-center text-green-400">
                                                    <ArrowDown className="h-4 w-4 mr-1" />
                                                    Received
                                                </span>
                                            ) : transaction.type === 'SENT' ? (
                                                <span className="inline-flex items-center text-red-400">
                                                    <ArrowUp className="h-4 w-4 mr-1" />
                                                    Sent
                                                </span>
                                            ) : (
                                                <span>Unknown</span>
                                            )}
                                        </td>
                                        <td className="py-3">
                                            {transaction.type === 'RECEIVED' ? (
                                                <span>From: {transaction.sender || 'Unknown'}</span>
                                            ) : transaction.type === 'SENT' ? (
                                                <span>To: {transaction.recipient || 'Unknown'}</span>
                                            ) : (
                                                <span>{transaction.description || 'Transaction'}</span>
                                            )}
                                            <div className="text-xs text-gray-500">
                                                {transaction.phoneNumber ? `Phone: ${transaction.phoneNumber}` : ''}
                                            </div>
                                        </td>
                                        <td className="py-3 text-right">
                                            <span className={transaction.type === 'RECEIVED' ? 'text-green-400' : 'text-red-400'}>
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
                )}
            </motion.div>
        </div>
    )
} 