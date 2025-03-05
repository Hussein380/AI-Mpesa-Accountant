"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Upload, MessageSquare, PieChart, LogOut, Menu, X } from "lucide-react"

export default function DashboardPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-bg to-cyber-grid text-white">
            {/* Mobile sidebar toggle */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-full bg-black/30 backdrop-blur-lg border border-neon-blue/20"
                >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-black/50 backdrop-blur-lg border-r border-neon-blue/20 transition-transform duration-300 z-40 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-8 text-center">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple">
                            AI-Pesa
                        </span>
                    </h1>

                    <nav className="space-y-1">
                        <Link
                            href="/dashboard"
                            className="flex items-center space-x-3 p-3 rounded-lg bg-neon-blue/10 text-neon-blue"
                        >
                            <PieChart size={20} />
                            <span>Dashboard</span>
                        </Link>
                        <Link
                            href="/dashboard/upload"
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <Upload size={20} />
                            <span>Upload Statements</span>
                        </Link>
                        <Link
                            href="/dashboard/ai-chat"
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <MessageSquare size={20} />
                            <span>AI Chat</span>
                        </Link>
                    </nav>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-neon-blue/20">
                    <Link
                        href="/"
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-red-400"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </Link>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:ml-64 p-6">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-text-secondary">Welcome to your AI-Pesa dashboard</p>
                    </header>

                    {/* Dashboard content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Summary card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-neon-blue/20"
                        >
                            <h2 className="text-xl font-semibold mb-4">Account Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Total Income</span>
                                    <span className="font-medium text-green-400">KSh 0.00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Total Expenses</span>
                                    <span className="font-medium text-red-400">KSh 0.00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Balance</span>
                                    <span className="font-medium">KSh 0.00</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Upload prompt card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-neon-blue/20 md:col-span-2 lg:col-span-2"
                        >
                            <div className="flex flex-col items-center justify-center text-center h-full py-8">
                                <Upload size={48} className="text-neon-blue mb-4" />
                                <h2 className="text-xl font-semibold mb-2">Upload Your M-Pesa Statement</h2>
                                <p className="text-text-secondary mb-6 max-w-md">
                                    Upload your M-Pesa statement or paste your M-Pesa messages to get started with AI-powered financial analysis
                                </p>
                                <Link
                                    href="/dashboard/upload"
                                    className="py-2 px-4 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-medium hover:opacity-90 transition-opacity"
                                >
                                    Upload Statement
                                </Link>
                            </div>
                        </motion.div>

                        {/* Recent transactions placeholder */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-neon-blue/20 col-span-1 md:col-span-2 lg:col-span-3"
                        >
                            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
                            <div className="text-center py-12 text-text-secondary">
                                <p>No transactions found</p>
                                <p className="text-sm mt-2">Upload your M-Pesa statement to see your transactions here</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
} 