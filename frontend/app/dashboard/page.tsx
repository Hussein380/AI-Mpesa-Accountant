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
import { convertToMpesaTransactions } from '@/src/types/transaction-mapper'
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
    const [checkingPdf, setCheckingPdf] = useState(false)
    const { user, logout } = useAuth()
    const searchParams = useSearchParams()
    const refreshParam = searchParams.get('refresh')
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 0 })
    const [spendingTrends, setSpendingTrends] = useState<{ month: string; income: number; expenses: number; }[]>([])
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    // Fetch transactions from the database only once when component mounts
    useEffect(() => {
        console.log('Dashboard: useEffect triggered for fetching transactions');

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
                    console.log('Dashboard: First transaction source:', data.transactions[0].source);
                    console.log('Dashboard: First transaction balance:', data.transactions[0].balance);
                    console.log('Dashboard: First transaction balance type:', typeof data.transactions[0].balance);
                }

                // Convert Transaction[] to MpesaTransaction[] using the mapper
                const mpesaTransactions = convertToMpesaTransactions(data.transactions);

                // Update state with the converted data
                setTransactions(mpesaTransactions)
                setPagination(data.pagination)

                // Calculate income with detailed logging
                const income = mpesaTransactions.reduce((sum, t) => {
                    if (t.type === 'RECEIVED') {
                        // Ensure amount is a number
                        const amount = parseFloat(t.amount || 0);
                        console.log(`Dashboard: Adding income: ${amount} from ${t.description || 'unknown'} (${t.source})`);
                        return sum + amount;
                    }
                    return sum;
                }, 0);
                console.log('Dashboard: Total income calculated:', income);

                // Calculate expenses with detailed logging
                const expenses = mpesaTransactions.reduce((sum, t) => {
                    if (['SENT', 'PAYMENT', 'WITHDRAWAL'].includes(t.type)) {
                        // Ensure amount is a number
                        const amount = parseFloat(t.amount || 0);
                        console.log(`Dashboard: Adding expense: ${amount} for ${t.description || 'unknown'} (${t.source})`);
                        return sum + amount;
                    }
                    return sum;
                }, 0);
                console.log('Dashboard: Total expenses calculated:', expenses);

                // Calculate balance as income - expenses
                // This is more reliable than using the balance field from transactions
                const balance = income - expenses;
                console.log('Dashboard: Calculated balance from income and expenses:', balance);

                const completeStats = {
                    income,
                    expenses,
                    balance,
                    count: mpesaTransactions.length
                }

                console.log('Dashboard: Stats calculated:', completeStats);
                setStats(completeStats)

                // Generate spending trends data
                generateSpendingTrends(mpesaTransactions);

                // Update lastUpdated timestamp
                setLastUpdated(new Date());

                // Add debug call here - use converted transactions
                debugPdfTransactions(mpesaTransactions);

                // Calculate income and expenses with detailed logging
                console.log('Dashboard: Starting financial calculations...');

                // Log transaction types for debugging
                const transactionTypes = [...new Set(mpesaTransactions.map(t => t.type))];
                console.log('Dashboard: Transaction types found:', transactionTypes);

                // Count transactions by source
                const sourceCount = mpesaTransactions.reduce((acc, t) => {
                    acc[t.source] = (acc[t.source] || 0) + 1;
                    return acc;
                }, {});
                console.log('Dashboard: Transactions by source:', sourceCount);

                // Enhanced PDF transaction detection - try multiple approaches
                // 1. First try direct source field
                let pdfTransactions = mpesaTransactions.filter(t => t.source === 'PDF');

                // 2. If that doesn't work, try looking for PDF in the description
                if (pdfTransactions.length === 0) {
                    pdfTransactions = mpesaTransactions.filter(t =>
                        t.description && t.description.toUpperCase().includes('PDF')
                    );
                }

                // 3. If still no luck, check for PDF in the transaction ID
                if (pdfTransactions.length === 0) {
                    pdfTransactions = mpesaTransactions.filter(t =>
                        t.transactionId && t.transactionId.toUpperCase().includes('PDF')
                    );
                }

                console.log(`Dashboard: Found ${pdfTransactions.length} PDF transactions using enhanced detection`);

                if (pdfTransactions.length > 0) {
                    console.log('Dashboard: PDF transaction examples:',
                        pdfTransactions.slice(0, 3).map(t => ({
                            type: t.type,
                            amount: t.amount,
                            description: t.description,
                            date: t.date,
                            source: t.source
                        }))
                    );

                    // Calculate PDF-specific totals with more detailed logging
                    const pdfIncomeTransactions = pdfTransactions.filter(t => t.type === 'RECEIVED');
                    const pdfExpenseTransactions = pdfTransactions.filter(t =>
                        ['SENT', 'PAYMENT', 'WITHDRAWAL'].includes(t.type)
                    );

                    const pdfIncome = pdfIncomeTransactions.reduce((sum, t) => sum + t.amount, 0);
                    const pdfExpenses = pdfExpenseTransactions.reduce((sum, t) => sum + t.amount, 0);
                    const pdfBalance = pdfIncome - pdfExpenses;

                    console.log(`Dashboard: PDF income transactions: ${pdfIncomeTransactions.length}`);
                    console.log(`Dashboard: PDF expense transactions: ${pdfExpenseTransactions.length}`);
                    console.log('Dashboard: PDF income total:', pdfIncome);
                    console.log('Dashboard: PDF expenses total:', pdfExpenses);
                    console.log('Dashboard: PDF net amount:', pdfIncome - pdfExpenses);
                }

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

        // No automatic refresh interval - only refresh when needed
        return () => {
            // Cleanup function (empty since we removed the interval)
        }
    }, []) // Only run once when component mounts

    // Generate spending trends data from transactions
    const generateSpendingTrends = (transactions: MpesaTransaction[]) => {
        if (!transactions || transactions.length === 0) {
            setSpendingTrends([]);
            console.log('Dashboard: No transactions for spending trends');
            return;
        }

        console.log('Dashboard: Generating spending trends from', transactions.length, 'transactions');

        // Log sources in spending trends data
        const trendsSources = [...new Set(transactions.map(t => t.source))];
        console.log('Dashboard: Sources in spending trends data:', trendsSources);

        // Count PDF transactions in the data
        const pdfCount = transactions.filter(t => t.source === 'PDF').length;
        console.log('Dashboard: PDF transactions in spending trends data:', pdfCount);

        // Enhanced PDF transaction detection for spending trends
        // 1. First try direct source field
        let pdfTransactions = transactions.filter(t => t.source === 'PDF');

        // 2. If that doesn't work, try looking for PDF in the description
        if (pdfTransactions.length === 0) {
            pdfTransactions = transactions.filter(t =>
                t.description && t.description.toUpperCase().includes('PDF')
            );
        }

        // 3. If still no luck, check for PDF in the transaction ID
        if (pdfTransactions.length === 0) {
            pdfTransactions = transactions.filter(t =>
                t.transactionId && t.transactionId.toUpperCase().includes('PDF')
            );
        }

        console.log(`Dashboard: Found ${pdfTransactions.length} PDF transactions for spending trends`);

        if (pdfTransactions.length > 0) {
            console.log('Dashboard: PDF transaction examples for trends:',
                pdfTransactions.slice(0, 3).map(t => ({
                    type: t.type,
                    amount: t.amount,
                    description: t.description,
                    date: t.date,
                    source: t.source
                }))
            );
        }

        // Group transactions by month
        const monthlyData: Record<string, { income: number; expenses: number; pdfIncome: number; pdfExpenses: number; month: string }> = {};

        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthDisplay = new Date(date.getFullYear(), date.getMonth(), 1)
                .toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    income: 0,
                    expenses: 0,
                    pdfIncome: 0,
                    pdfExpenses: 0,
                    month: monthDisplay
                };
            }

            // Enhanced PDF detection - check multiple fields
            const isPdf = transaction.source === 'PDF' ||
                (transaction.description && transaction.description.toUpperCase().includes('PDF')) ||
                (transaction.transactionId && transaction.transactionId.toUpperCase().includes('PDF'));

            if (transaction.type === 'RECEIVED') {
                monthlyData[monthKey].income += transaction.amount;
                if (isPdf) {
                    monthlyData[monthKey].pdfIncome += transaction.amount;
                    console.log(`Dashboard: Adding PDF income: ${transaction.amount} to ${monthDisplay}`);
                }
            } else if (['SENT', 'PAYMENT', 'WITHDRAWAL'].includes(transaction.type)) {
                monthlyData[monthKey].expenses += transaction.amount;
                if (isPdf) {
                    monthlyData[monthKey].pdfExpenses += transaction.amount;
                    console.log(`Dashboard: Adding PDF expense: ${transaction.amount} to ${monthDisplay}`);
                }
            }
        });

        // Log monthly data for debugging
        console.log('Dashboard: Monthly data for spending trends:', monthlyData);

        // Convert to array and sort by month
        const trendsArray = Object.entries(monthlyData).map(([key, data]) => ({
            month: data.month,
            income: data.income,
            expenses: data.expenses,
            pdfIncome: data.pdfIncome,
            pdfExpenses: data.pdfExpenses
        })).sort((a, b) => {
            const [aYear, aMonth] = a.month.split(' ');
            const [bYear, bMonth] = b.month.split(' ');
            const aDate = new Date(`${aMonth} 1, ${aYear}`);
            const bDate = new Date(`${bMonth} 1, ${bYear}`);
            return aDate.getTime() - bDate.getTime();
        });

        // Take the last 6 months of data
        const recentTrends = trendsArray.slice(-6);

        // Log the final trends data
        console.log('Dashboard: Final spending trends data:', recentTrends);

        // Check if PDF data is included in the trends
        const hasPdfData = recentTrends.some(t => t.pdfIncome > 0 || t.pdfExpenses > 0);
        console.log('Dashboard: PDF data included in trends:', hasPdfData);

        if (hasPdfData) {
            // Log PDF totals in trends
            const totalPdfIncome = recentTrends.reduce((sum, t) => sum + t.pdfIncome, 0);
            const totalPdfExpenses = recentTrends.reduce((sum, t) => sum + t.pdfExpenses, 0);
            console.log('Dashboard: Total PDF income in trends:', totalPdfIncome);
            console.log('Dashboard: Total PDF expenses in trends:', totalPdfExpenses);
        }

        setSpendingTrends(recentTrends);
    };

    // Update the debugPdfTransactions function
    const debugPdfTransactions = (transactions: MpesaTransaction[]) => {
        console.log('DEBUG PDF: Starting detailed PDF transaction debugging');

        // 1. Check for transactions with source === 'PDF'
        const directPdfTransactions = transactions.filter(t => t.source === 'PDF');
        console.log(`DEBUG PDF: Direct PDF transactions count: ${directPdfTransactions.length}`);

        if (directPdfTransactions.length > 0) {
            console.log('DEBUG PDF: Direct PDF transaction examples:',
                directPdfTransactions.slice(0, 3).map(t => ({
                    id: t._id,
                    type: t.type,
                    amount: t.amount,
                    source: t.source,
                    description: t.description
                }))
            );

            // Calculate totals
            const pdfIncome = directPdfTransactions
                .filter(t => t.type === 'RECEIVED')
                .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

            const pdfExpenses = directPdfTransactions
                .filter(t => ['SENT', 'PAYMENT', 'WITHDRAWAL'].includes(t.type))
                .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

            console.log(`DEBUG PDF: Direct PDF income total: ${pdfIncome}`);
            console.log(`DEBUG PDF: Direct PDF expenses total: ${pdfExpenses}`);
            console.log(`DEBUG PDF: Direct PDF net amount: ${pdfIncome - pdfExpenses}`);

            // Log transaction types
            const types = [...new Set(directPdfTransactions.map(t => t.type))];
            console.log('DEBUG PDF: PDF transaction types:', types);

            // Count by type
            const typeCount = types.reduce((acc, type) => {
                acc[type] = directPdfTransactions.filter(t => t.type === type).length;
                return acc;
            }, {});
            console.log('DEBUG PDF: PDF transactions by type:', typeCount);
        }

        // 2. Check for transactions with PDF in description
        const descPdfTransactions = transactions.filter(t =>
            t.description && t.description.toUpperCase().includes('PDF')
        );
        console.log(`DEBUG PDF: Description PDF transactions count: ${descPdfTransactions.length}`);

        // 3. Check for transactions with PDF in transactionId
        const idPdfTransactions = transactions.filter(t =>
            t.transactionId && t.transactionId.toUpperCase().includes('PDF')
        );
        console.log(`DEBUG PDF: ID PDF transactions count: ${idPdfTransactions.length}`);

        // 4. Combined approach
        const allPdfTransactions = transactions.filter(t =>
            t.source === 'PDF' ||
            (t.description && t.description.toUpperCase().includes('PDF')) ||
            (t.transactionId && t.transactionId.toUpperCase().includes('PDF'))
        );
        console.log(`DEBUG PDF: Combined PDF transactions count: ${allPdfTransactions.length}`);

        if (allPdfTransactions.length > 0) {
            // Log transaction types
            const types = [...new Set(allPdfTransactions.map(t => t.type))];
            console.log('DEBUG PDF: PDF transaction types:', types);

            // Count by type
            const typeCount = types.reduce((acc, type) => {
                acc[type] = allPdfTransactions.filter(t => t.type === type).length;
                return acc;
            }, {});
            console.log('DEBUG PDF: PDF transactions by type:', typeCount);

            // Calculate totals
            const pdfIncome = allPdfTransactions
                .filter(t => t.type === 'RECEIVED')
                .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

            const pdfExpenses = allPdfTransactions
                .filter(t => ['SENT', 'PAYMENT', 'WITHDRAWAL'].includes(t.type))
                .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

            console.log(`DEBUG PDF: Combined PDF income total: ${pdfIncome}`);
            console.log(`DEBUG PDF: Combined PDF expenses total: ${pdfExpenses}`);
            console.log(`DEBUG PDF: Combined PDF net amount: ${pdfIncome - pdfExpenses}`);
        }
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
                <div className="flex justify-between items-center mb-8">
                    <p className="text-gray-400">Your AI-powered financial assistant</p>
                </div>

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
                        <p className="text-xs text-gray-400 mt-1">
                            From {transactions.filter(t => t.type === 'RECEIVED').length} transactions
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
                        <p className="text-xs text-gray-400 mt-1">
                            From {transactions.filter(t => ['SENT', 'PAYMENT', 'WITHDRAWAL'].includes(t.type)).length} transactions
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
                        <p className="text-xs text-gray-400 mt-1">
                            Calculated from {stats.count} transactions
                        </p>
                    </motion.div>
                </div>

                {/* Source breakdown */}
                {transactions.length > 0 && (
                    <motion.div
                        className="bg-gray-800 rounded-lg p-3 sm:p-4 md:p-6 shadow-md mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                    >
                        <h3 className="text-base sm:text-lg font-medium mb-3">Data Sources</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {['SMS', 'PDF', 'MANUAL', 'TEST'].map(source => {
                                const count = transactions.filter(t => t.source === source).length;
                                if (count === 0) return null;

                                return (
                                    <div key={source} className="bg-gray-700/50 rounded p-2 text-center">
                                        <div className="text-sm font-medium">{source}</div>
                                        <div className="text-lg font-bold">{count}</div>
                                        <div className="text-xs text-gray-400">transactions</div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* PDF-specific statistics section */}
                {transactions.some(t =>
                    t.source === 'PDF' ||
                    (t.description && t.description.toUpperCase().includes('PDF')) ||
                    (t.transactionId && t.transactionId.toUpperCase().includes('PDF'))
                ) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-white">PDF Statement Summary</h2>
                                <div className="text-sm text-gray-400">
                                    Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'}
                                </div>
                            </div>

                            <div className="bg-gray-800 p-4 rounded-lg mb-4">
                                <p className="text-gray-300 text-sm">
                                    This section shows financial data extracted from your uploaded PDF statements.
                                    PDF transactions are identified by their source or description containing "PDF".
                                </p>
                            </div>

                            {/* Calculate PDF-specific statistics */}
                            {(() => {
                                // Get all PDF transactions using multiple detection methods
                                const pdfTransactions = transactions.filter(t =>
                                    t.source === 'PDF' ||
                                    (t.description && t.description.toUpperCase().includes('PDF')) ||
                                    (t.transactionId && t.transactionId.toUpperCase().includes('PDF'))
                                );

                                console.log(`Dashboard: Rendering PDF section with ${pdfTransactions.length} transactions`);

                                // Log transaction types for debugging
                                const types = [...new Set(pdfTransactions.map(t => t.type))];
                                console.log('Dashboard: PDF transaction types:', types);

                                // Count transactions by type
                                const typeCount = types.reduce((acc, type) => {
                                    acc[type] = pdfTransactions.filter(t => t.type === type).length;
                                    return acc;
                                }, {});
                                console.log('Dashboard: PDF transactions by type:', typeCount);

                                // Calculate PDF income
                                const pdfIncome = pdfTransactions
                                    .filter(t => t.type === 'RECEIVED')
                                    .reduce((sum, t) => {
                                        const amount = parseFloat(t.amount || 0);
                                        console.log(`Dashboard: Adding PDF income: ${amount} from ${t.description || 'unknown'}`);
                                        return sum + amount;
                                    }, 0);

                                // Calculate PDF expenses
                                const pdfExpenses = pdfTransactions
                                    .filter(t => ['SENT', 'PAYMENT', 'WITHDRAWAL'].includes(t.type))
                                    .reduce((sum, t) => {
                                        const amount = parseFloat(t.amount || 0);
                                        console.log(`Dashboard: Adding PDF expense: ${amount} for ${t.description || 'unknown'}`);
                                        return sum + amount;
                                    }, 0);

                                // Calculate PDF balance
                                const pdfBalance = pdfIncome - pdfExpenses;

                                // Count transactions by type
                                const pdfIncomeCount = pdfTransactions.filter(t => t.type === 'RECEIVED').length;
                                const pdfExpenseCount = pdfTransactions.filter(t => ['SENT', 'PAYMENT', 'WITHDRAWAL'].includes(t.type)).length;

                                console.log('Dashboard: PDF income:', pdfIncome, 'from', pdfIncomeCount, 'transactions');
                                console.log('Dashboard: PDF expenses:', pdfExpenses, 'from', pdfExpenseCount, 'transactions');
                                console.log('Dashboard: PDF balance:', pdfBalance, 'from', pdfTransactions.length, 'total transactions');

                                // Only render if we have PDF transactions
                                if (pdfTransactions.length === 0) {
                                    return null;
                                }

                                return (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-gray-700 rounded-lg p-4 shadow-md">
                                                <h3 className="text-lg font-medium text-gray-300 mb-1">PDF Income</h3>
                                                <p className="text-2xl font-bold text-green-400">{formatCurrency(pdfIncome)}</p>
                                                <p className="text-sm text-gray-400">{pdfIncomeCount} transactions</p>
                                            </div>

                                            <div className="bg-gray-700 rounded-lg p-4 shadow-md">
                                                <h3 className="text-lg font-medium text-gray-300 mb-1">PDF Expenses</h3>
                                                <p className="text-2xl font-bold text-red-400">{formatCurrency(pdfExpenses)}</p>
                                                <p className="text-sm text-gray-400">{pdfExpenseCount} transactions</p>
                                            </div>

                                            <div className="bg-gray-700 rounded-lg p-4 shadow-md">
                                                <h3 className="text-lg font-medium text-gray-300 mb-1">PDF Balance</h3>
                                                <p className={`text-2xl font-bold ${pdfBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {formatCurrency(pdfBalance)}
                                                </p>
                                                <p className="text-sm text-gray-400">{pdfTransactions.length} total transactions</p>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.div>
                    )}

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
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${transaction.type === 'RECEIVED' ? 'bg-green-900/30 text-green-400' :
                                                transaction.type === 'SENT' ? 'bg-red-900/30 text-red-400' :
                                                    'bg-gray-700 text-gray-300'
                                                }`}>
                                                {transaction.type}
                                            </span>
                                            <span className={`text-xs font-medium ${transaction.type === 'RECEIVED' ? 'text-green-400' : 'text-red-400'
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

                {/* Last Updated Timestamp */}
                {lastUpdated && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-400">
                            Data last updated: {formatDate(lastUpdated)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Dashboard will automatically refresh when new PDF or SMS data is processed.
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    )
} 