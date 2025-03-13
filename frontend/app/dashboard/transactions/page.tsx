"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Filter, Download } from "lucide-react"
import { MpesaTransaction, formatCurrency, formatDate } from "@/lib/mpesa-parser"
import { getEndpoint, createAuthenticatedRequest, processApiResponse } from '../../../utils/api'
import { TransactionResponse } from '@/src/types/models'

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<MpesaTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 0, limit: 20 })
    const [filters, setFilters] = useState({
        type: '',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: ''
    })
    const [showFilters, setShowFilters] = useState(false)

    // Fetch transactions from the database
    const fetchTransactions = async (page = 1) => {
        setLoading(true)
        setError(null)

        try {
            // Build query parameters
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString()
            })

            // Add filters if they exist
            if (filters.type) queryParams.append('type', filters.type)
            if (filters.startDate) queryParams.append('startDate', filters.startDate)
            if (filters.endDate) queryParams.append('endDate', filters.endDate)
            if (filters.minAmount) queryParams.append('minAmount', filters.minAmount)
            if (filters.maxAmount) queryParams.append('maxAmount', filters.maxAmount)

            const apiUrl = getEndpoint(`transactions?${queryParams.toString()}`)
            const requestConfig = createAuthenticatedRequest('GET')
            requestConfig.signal = AbortSignal.timeout(15000) // 15 second timeout

            const response = await fetch(apiUrl, requestConfig)
            const data = await processApiResponse<TransactionResponse>(response, (responseData) => {
                return responseData
            })

            setTransactions(data.transactions)
            setPagination({
                ...pagination,
                total: data.pagination.total,
                page: data.pagination.page,
                pages: data.pagination.pages
            })
        } catch (error) {
            console.error('Error fetching transactions:', error)
            setError(error instanceof Error ? error.message : 'Failed to fetch transactions')
            setTransactions([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTransactions(pagination.page)
    }, [])

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPagination({ ...pagination, page: newPage })
            fetchTransactions(newPage)
        }
    }

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFilters({ ...filters, [name]: value })
    }

    const applyFilters = (e: React.FormEvent) => {
        e.preventDefault()
        fetchTransactions(1) // Reset to first page when applying filters
    }

    const resetFilters = () => {
        setFilters({
            type: '',
            startDate: '',
            endDate: '',
            minAmount: '',
            maxAmount: ''
        })
        // Fetch transactions without filters
        fetchTransactions(1)
    }

    const exportTransactions = () => {
        // Convert transactions to CSV
        const headers = ['Date', 'Type', 'Description', 'Amount', 'Balance', 'Reference']
        const csvContent = [
            headers.join(','),
            ...transactions.map(t => [
                formatDate(t.date),
                t.type,
                `"${t.description.replace(/"/g, '""')}"`, // Escape quotes in CSV
                t.amount,
                t.balance,
                t.mpesaReference || ''
            ].join(','))
        ].join('\n')

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
            >
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">All Transactions</h1>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors flex items-center"
                        >
                            <Filter className="h-4 w-4 mr-2" /> Filters
                        </button>
                        <button
                            onClick={exportTransactions}
                            className="px-3 py-2 bg-green-700 hover:bg-green-600 text-white rounded-md transition-colors flex items-center"
                        >
                            <Download className="h-4 w-4 mr-2" /> Export
                        </button>
                    </div>
                </div>

                {/* Filter panel */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-800 rounded-lg p-4 mb-4"
                    >
                        <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Transaction Type</label>
                                <select
                                    name="type"
                                    value={filters.type}
                                    onChange={handleFilterChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Types</option>
                                    <option value="RECEIVED">Received</option>
                                    <option value="SENT">Sent</option>
                                    <option value="PAYMENT">Payment</option>
                                    <option value="WITHDRAWAL">Withdrawal</option>
                                    <option value="DEPOSIT">Deposit</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleFilterChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleFilterChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Min Amount</label>
                                <input
                                    type="number"
                                    name="minAmount"
                                    value={filters.minAmount}
                                    onChange={handleFilterChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Max Amount</label>
                                <input
                                    type="number"
                                    name="maxAmount"
                                    value={filters.maxAmount}
                                    onChange={handleFilterChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="100000"
                                />
                            </div>
                            <div className="flex items-end space-x-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                >
                                    Apply Filters
                                </button>
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Error message */}
                {error && (
                    <div className="bg-red-900/30 border border-red-800 text-red-300 p-4 rounded-md mb-4">
                        <p>{error}</p>
                        <button
                            onClick={() => fetchTransactions(pagination.page)}
                            className="mt-2 px-3 py-1 bg-red-800 hover:bg-red-700 rounded-md text-sm"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading state */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Transactions table */}
                        {transactions.length > 0 ? (
                            <>
                                {/* Desktop view - Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                    Description
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                    Balance
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                    Reference
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700">
                                            {transactions.map((transaction, index) => (
                                                <tr key={index} className="hover:bg-gray-700/50">
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                        {formatDate(transaction.date)}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.type === 'RECEIVED' ? 'bg-green-900/30 text-green-400' :
                                                            transaction.type === 'SENT' ? 'bg-red-900/30 text-red-400' :
                                                                transaction.type === 'PAYMENT' ? 'bg-orange-900/30 text-orange-400' :
                                                                    transaction.type === 'WITHDRAWAL' ? 'bg-purple-900/30 text-purple-400' :
                                                                        'bg-blue-900/30 text-blue-400'
                                                            }`}>
                                                            {transaction.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-300 max-w-xs truncate">
                                                        {transaction.description}
                                                    </td>
                                                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${transaction.type === 'RECEIVED' ? 'text-green-400' : 'text-red-400'
                                                        }`}>
                                                        {formatCurrency(transaction.amount)}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-300">
                                                        {formatCurrency(transaction.balance)}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                                                        {transaction.mpesaReference || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile view - Cards */}
                                <div className="md:hidden space-y-3">
                                    {transactions.map((transaction, index) => (
                                        <div key={index} className="bg-gray-800 rounded-lg p-4 shadow-sm break-words">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.type === 'RECEIVED' ? 'bg-green-900/30 text-green-400' :
                                                        transaction.type === 'SENT' ? 'bg-red-900/30 text-red-400' :
                                                            transaction.type === 'PAYMENT' ? 'bg-orange-900/30 text-orange-400' :
                                                                transaction.type === 'WITHDRAWAL' ? 'bg-purple-900/30 text-purple-400' :
                                                                    'bg-blue-900/30 text-blue-400'
                                                    }`}>
                                                    {transaction.type}
                                                </span>
                                                <span className={`text-sm font-medium ${transaction.type === 'RECEIVED' ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                    {formatCurrency(transaction.amount)}
                                                </span>
                                            </div>

                                            <div className="text-sm text-gray-300 mb-1 break-words line-clamp-2">
                                                {transaction.description}
                                            </div>

                                            <div className="flex flex-col xs:flex-row justify-between text-xs text-gray-400 mt-2">
                                                <div className="mb-1 xs:mb-0">{formatDate(transaction.date)}</div>
                                                <div>Balance: {formatCurrency(transaction.balance)}</div>
                                            </div>

                                            {transaction.mpesaReference && (
                                                <div className="text-xs text-gray-500 mt-1 break-words">
                                                    Ref: {transaction.mpesaReference}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="bg-gray-800 rounded-lg p-8 text-center">
                                <p className="text-gray-400">No transactions found</p>
                                {Object.values(filters).some(v => v !== '') && (
                                    <button
                                        onClick={resetFilters}
                                        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-between items-center mt-4">
                                <div className="text-sm text-gray-400">
                                    Showing page {pagination.page} of {pagination.pages} ({pagination.total} total transactions)
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className={`px-3 py-1 rounded-md flex items-center ${pagination.page === 1
                                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                                            }`}
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-1" /> Previous
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.pages}
                                        className={`px-3 py-1 rounded-md flex items-center ${pagination.page === pagination.pages
                                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                                            }`}
                                    >
                                        Next <ArrowRight className="h-4 w-4 ml-1" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    )
} 