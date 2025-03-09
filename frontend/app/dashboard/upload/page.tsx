"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Upload, FileText, Check, AlertCircle, MessageSquare, FileUp } from "lucide-react"
import { parseMpesaSms, MpesaTransaction } from "@/lib/mpesa-parser"
import { toast } from "@/components/ui/use-toast"
import { getToken } from '../../../utils/auth'
import { getEndpoint, createAuthenticatedRequest } from '../../../utils/api'

export default function UploadPage() {
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
    const [activeTab, setActiveTab] = useState<"file" | "sms">("file")
    const [smsText, setSmsText] = useState("")
    const [smsSubmitted, setSmsSubmitted] = useState(false)
    const [parsedTransactions, setParsedTransactions] = useState<MpesaTransaction[]>([])
    const [transactionStats, setTransactionStats] = useState({
        income: 0,
        expenses: 0,
        count: 0
    })

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const files = e.dataTransfer.files
        if (files.length > 0) {
            handleFile(files[0])
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0])
        }
    }

    const handleFile = (file: File) => {
        // Check if file is PDF or CSV
        if (file.type === "application/pdf" || file.type === "text/csv" || file.name.endsWith('.csv')) {
            setFile(file)
        } else {
            alert("Please upload a PDF or CSV file")
        }
    }

    const handleUpload = async () => {
        if (!file && activeTab === "file") return
        if (!smsText.trim() && activeTab === "sms") return

        setUploadStatus("uploading")

        try {
            // Simulate upload for file
            if (activeTab === "file") {
                await new Promise(resolve => setTimeout(resolve, 2000))
                setUploadStatus("success")
            }
            // Process SMS messages
            else if (activeTab === "sms") {
                // Parse the SMS messages
                console.log('Upload: Starting to parse SMS messages...');
                console.log('Upload: SMS text length:', smsText.length);

                const transactions = parseMpesaSms(smsText);
                console.log('Upload: Parsed transactions count:', transactions.length);

                if (transactions.length === 0) {
                    console.log('Upload: No transactions found in SMS text');
                    setUploadStatus("error");
                    return;
                }

                // Log a sample transaction
                console.log('Upload: Sample parsed transaction:', JSON.stringify(transactions[0]));

                // Calculate stats
                const stats = transactions.reduce((acc, transaction) => {
                    console.log(`Upload: Processing transaction: ${transaction.transactionId}, type: ${transaction.type}, amount: ${transaction.amount}`);

                    if (transaction.type === 'RECEIVED') {
                        acc.income += transaction.amount;
                        console.log(`Upload: Added ${transaction.amount} to income, new total: ${acc.income}`);
                    } else if (transaction.type === 'SENT') {
                        acc.expenses += transaction.amount;
                        console.log(`Upload: Added ${transaction.amount} to expenses, new total: ${acc.expenses}`);
                    }
                    return acc;
                }, { income: 0, expenses: 0, count: transactions.length });

                console.log('Upload: Calculated stats:', JSON.stringify(stats));

                // Save transactions to database
                try {
                    console.log('Upload: Starting to save transactions to database...');

                    // Format transactions for the API with proper balance handling
                    const transactionsForApi = transactions.map(transaction => {
                        // Create a base transaction object
                        const formattedTransaction = {
                            date: new Date(transaction.date),
                            type: transaction.type,
                            amount: transaction.amount,
                            recipient: transaction.recipient || '',
                            sender: transaction.sender || '',
                            description: transaction.description || '',
                            category: 'OTHER', // Default category, will be updated by AI later    
                            source: 'SMS', // Or 'PDF' depending on the source
                            transactionId: `${Date.now()}-${Math.random().toString(36).substring(2, 10)}` // Generate a unique ID
                        };

                        // Only include balance if it's a valid number
                        if (transaction.balance !== undefined && transaction.balance !== null && !isNaN(transaction.balance)) {
                            console.log('Upload: Including balance in transaction:', transaction.balance);
                            formattedTransaction.balance = transaction.balance;
                        } else {
                            console.log('Upload: Transaction has no valid balance');
                        }

                        return formattedTransaction;
                    });

                    console.log('Upload: Formatted transactions for API, count:', transactionsForApi.length);
                    console.log('Upload: Sample API transaction:', JSON.stringify(transactionsForApi[0]));

                    // Send transactions to the backend
                    const apiUrl = getEndpoint('transactions/bulk');
                    console.log('Upload: Sending transactions to URL:', apiUrl);
                    console.log('Upload: Request body:', JSON.stringify({ transactions: transactionsForApi }));

                    let response;
                    try {
                        // Create request with authentication in one atomic operation
                        const requestConfig = createAuthenticatedRequest('POST', { transactions: transactionsForApi });

                        // If we get here, we have a valid token (createAuthenticatedRequest would throw if not)
                        console.log('Upload: Proceeding with save');

                        response = await fetch(apiUrl, requestConfig);

                        console.log('Upload: Response status:', response.status);
                        console.log('Upload: Response status text:', response.statusText);
                    } catch (fetchError) {
                        console.error('Upload: Fetch error:', fetchError);
                        throw new Error(`Error connecting to API: ${fetchError.message}`);
                    }

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Upload: API error response:', errorText);
                        console.error('Upload: Request that caused error:', {
                            url: apiUrl,
                            method: 'POST',
                            headers: getAuthHeaders(token),
                            body: JSON.stringify({ transactions: transactionsForApi })
                        });
                        throw new Error(`Error saving transactions: ${response.statusText}`);
                    }

                    // Get response text first for debugging
                    const responseText = await response.text();
                    console.log('Upload: Response text preview:', responseText.substring(0, 150));

                    // Try to parse as JSON
                    let result;
                    try {
                        result = JSON.parse(responseText);
                    } catch (parseError) {
                        console.error("Upload: Failed to parse response as JSON:", parseError);
                        throw new Error("Server returned an invalid response");
                    }

                    console.log('Upload: Transactions saved to database, count:', result.count || 0);

                    // Show success message
                    toast({
                        title: "Success",
                        description: `${transactions.length} transactions saved to database`,
                        variant: "default"
                    });

                    // Redirect to dashboard after a short delay
                    console.log('Upload: Redirecting to dashboard in 1.5 seconds...');
                    setTimeout(() => {
                        // Force a hard refresh to ensure data is reloaded
                        const redirectUrl = `/dashboard?refresh=${new Date().getTime()}`;
                        console.log('Upload: Redirecting to:', redirectUrl);
                        window.location.href = redirectUrl;
                    }, 1500);
                } catch (error) {
                    console.error('Error saving transactions to database:', error);
                    toast({
                        title: 'Error',
                        description: 'Failed to save transactions to database. Please try again.',
                        variant: 'destructive'
                    });
                }

                // Update state
                setParsedTransactions(transactions);
                setTransactionStats(stats);

                // Simulate processing time
                await new Promise(resolve => setTimeout(resolve, 1500));
                setUploadStatus("success");
                setSmsSubmitted(true);
            }
        } catch (error) {
            console.error("Error processing data:", error);
            setUploadStatus("error");
        }
    }

    const handleSmsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSmsText(e.target.value)
    }

    const switchTab = (tab: "file" | "sms") => {
        setActiveTab(tab)
        setUploadStatus("idle")
        setSmsSubmitted(false)
    }

    return (
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto"
            >
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-white">Upload M-Pesa Statement</h1>
                <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-8">
                    Upload your M-Pesa statement or paste M-Pesa SMS messages to analyze your transactions
                </p>

                {/* Tab navigation */}
                <div className="flex mb-4 sm:mb-6 bg-gray-800/50 rounded-lg p-1">
                    <button
                        onClick={() => switchTab("file")}
                        className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 rounded-md flex items-center justify-center transition-colors text-xs sm:text-sm ${activeTab === "file"
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                            }`}
                    >
                        <FileUp className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                        Upload File
                    </button>
                    <button
                        onClick={() => switchTab("sms")}
                        className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 rounded-md flex items-center justify-center transition-colors text-xs sm:text-sm ${activeTab === "sms"
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                            }`}
                    >
                        <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                        Paste SMS
                    </button>
                </div>

                {/* File upload section */}
                {activeTab === "file" && (
                    <div
                        className={`border-2 border-dashed rounded-lg p-4 sm:p-8 md:p-12 text-center mb-4 sm:mb-8 transition-colors ${isDragging
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-gray-600 hover:border-blue-400 hover:bg-blue-400/5"
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="mb-3 sm:mb-4">
                            <Upload className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto text-blue-400" />
                        </div>
                        <p className="text-base sm:text-lg mb-1 sm:mb-2 text-white">
                            Drag and drop your M-Pesa statement here
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">
                            Supports PDF and CSV formats
                        </p>
                        <label className="inline-block">
                            <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.csv"
                                onChange={handleFileInput}
                            />
                            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer transition-colors text-xs sm:text-sm">
                                Browse Files
                            </span>
                        </label>
                    </div>
                )}

                {/* SMS paste section */}
                {activeTab === "sms" && (
                    <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-8">
                        <div className="mb-3 sm:mb-4">
                            <h3 className="text-base sm:text-lg font-medium text-white mb-1 sm:mb-2">Paste M-Pesa SMS Messages</h3>
                            <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                                Copy and paste your M-Pesa SMS messages below. Include as many transactions as possible for better analysis.
                            </p>
                            <textarea
                                className="w-full h-48 sm:h-64 bg-gray-900 text-white border border-gray-700 rounded-md p-3 sm:p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Example: 
FGH32YUIDK Confirmed. Ksh1,000 sent to JOHN DOE 254712345678 on 3/3/24 at 2:15 PM. New M-PESA balance is Ksh5,200. Transaction cost, Ksh12."
                                value={smsText}
                                onChange={handleSmsChange}
                                disabled={smsSubmitted}
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-2">
                                * Your data is processed securely and never shared with third parties.
                            </p>
                        </div>
                    </div>
                )}

                {/* File details */}
                {file && activeTab === "file" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-gray-800 rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-8"
                    >
                        <div className="flex items-center mb-3 sm:mb-4">
                            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mr-2 sm:mr-3" />
                            <div>
                                <h3 className="text-base sm:text-lg font-medium text-white">{file.name}</h3>
                                <p className="text-xs sm:text-sm text-gray-400">
                                    {(file.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={uploadStatus === "uploading" || uploadStatus === "success"}
                            className={`w-full py-2 sm:py-3 rounded-md font-medium transition-colors text-sm sm:text-base ${uploadStatus === "uploading"
                                ? "bg-blue-700 text-blue-200 cursor-not-allowed"
                                : uploadStatus === "success"
                                    ? "bg-green-600 text-white cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                        >
                            {uploadStatus === "idle" && "Upload Statement"}
                            {uploadStatus === "uploading" && "Uploading..."}
                            {uploadStatus === "success" && (
                                <span className="flex items-center justify-center">
                                    <Check className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                                    Upload Complete
                                </span>
                            )}
                        </button>
                    </motion.div>
                )}

                {/* SMS submit button */}
                {activeTab === "sms" && !smsSubmitted && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-4 sm:mb-8"
                    >
                        <button
                            onClick={handleUpload}
                            disabled={!smsText.trim() || uploadStatus === "uploading"}
                            className={`w-full py-2 sm:py-3 rounded-md font-medium transition-colors text-sm sm:text-base ${!smsText.trim()
                                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                : uploadStatus === "uploading"
                                    ? "bg-blue-700 text-blue-200 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                        >
                            {uploadStatus === "uploading" ? "Processing..." : "Process SMS Messages"}
                        </button>
                    </motion.div>
                )}

                {/* Results section for SMS */}
                {activeTab === "sms" && smsSubmitted && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800 rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-8"
                    >
                        <div className="flex items-center mb-3 sm:mb-4">
                            <div className="bg-green-600/20 p-2 rounded-full mr-3">
                                <Check className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-medium text-white">SMS Processing Complete</h3>
                                <p className="text-xs sm:text-sm text-gray-400">
                                    {parsedTransactions.length} transactions extracted
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                            <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4">
                                <p className="text-xs sm:text-sm text-gray-400 mb-1">Total Income</p>
                                <p className="text-lg sm:text-xl font-bold text-green-400">
                                    {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(transactionStats.income)}
                                </p>
                            </div>
                            <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4">
                                <p className="text-xs sm:text-sm text-gray-400 mb-1">Total Expenses</p>
                                <p className="text-lg sm:text-xl font-bold text-red-400">
                                    {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(transactionStats.expenses)}
                                </p>
                            </div>
                            <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4">
                                <p className="text-xs sm:text-sm text-gray-400 mb-1">Transactions</p>
                                <p className="text-lg sm:text-xl font-bold text-blue-400">
                                    {transactionStats.count}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                            <Link href="/dashboard" className="flex-1">
                                <button className="w-full py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm sm:text-base">
                                    View Dashboard
                                </button>
                            </Link>
                            <button
                                onClick={() => {
                                    setSmsText("")
                                    setSmsSubmitted(false)
                                    setUploadStatus("idle")
                                }}
                                className="flex-1 py-2 sm:py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors text-sm sm:text-base"
                            >
                                Process More SMS
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Error state */}
                {uploadStatus === "error" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-8"
                    >
                        <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-base sm:text-lg font-medium text-white mb-1 sm:mb-2">Processing Error</h3>
                                <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4">
                                    There was an error processing your {activeTab === "file" ? "file" : "SMS messages"}. Please try again or use a different {activeTab === "file" ? "file" : "set of messages"}.
                                </p>
                                <button
                                    onClick={() => setUploadStatus("idle")}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-xs sm:text-sm"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    )
} 