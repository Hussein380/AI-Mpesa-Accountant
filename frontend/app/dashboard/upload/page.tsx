"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Upload, FileText, Check, AlertCircle, MessageSquare, FileUp } from "lucide-react"
import { parseMpesaSms, MpesaTransaction } from "@/lib/mpesa-parser"

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
                const transactions = parseMpesaSms(smsText);

                // Calculate stats
                const stats = transactions.reduce((acc, transaction) => {
                    if (transaction.type === 'RECEIVED') {
                        acc.income += transaction.amount;
                    } else if (transaction.type === 'SENT') {
                        acc.expenses += transaction.amount;
                    }
                    return acc;
                }, { income: 0, expenses: 0, count: transactions.length });

                // Store transactions in localStorage
                const existingTransactions = JSON.parse(localStorage.getItem('mpesaTransactions') || '[]');
                const updatedTransactions = [...existingTransactions, ...transactions];
                localStorage.setItem('mpesaTransactions', JSON.stringify(updatedTransactions));

                // Store stats in localStorage
                const existingStats = JSON.parse(localStorage.getItem('mpesaStats') || '{"income": 0, "expenses": 0, "count": 0}');
                const updatedStats = {
                    income: existingStats.income + stats.income,
                    expenses: existingStats.expenses + stats.expenses,
                    count: existingStats.count + stats.count
                };
                localStorage.setItem('mpesaStats', JSON.stringify(updatedStats));

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
        <div className="container mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto"
            >
                <h1 className="text-3xl font-bold mb-2 text-white">Upload M-Pesa Statement</h1>
                <p className="text-gray-400 mb-8">
                    Upload your M-Pesa statement or paste M-Pesa SMS messages to analyze your transactions
                </p>

                {/* Tab navigation */}
                <div className="flex mb-6 bg-gray-800/50 rounded-lg p-1">
                    <button
                        onClick={() => switchTab("file")}
                        className={`flex-1 py-3 px-4 rounded-md flex items-center justify-center transition-colors ${activeTab === "file"
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                            }`}
                    >
                        <FileUp className="h-5 w-5 mr-2" />
                        Upload File
                    </button>
                    <button
                        onClick={() => switchTab("sms")}
                        className={`flex-1 py-3 px-4 rounded-md flex items-center justify-center transition-colors ${activeTab === "sms"
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                            }`}
                    >
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Paste SMS
                    </button>
                </div>

                {/* File upload section */}
                {activeTab === "file" && (
                    <div
                        className={`border-2 border-dashed rounded-lg p-12 text-center mb-8 transition-colors ${isDragging
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-gray-600 hover:border-blue-400 hover:bg-blue-400/5"
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="mb-4">
                            <Upload className="h-12 w-12 mx-auto text-blue-400" />
                        </div>
                        <p className="text-lg mb-2 text-white">
                            Drag and drop your M-Pesa statement here
                        </p>
                        <p className="text-sm text-gray-400 mb-6">
                            Supports PDF and CSV formats
                        </p>
                        <label className="inline-block">
                            <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.csv"
                                onChange={handleFileInput}
                            />
                            <span className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer transition-colors">
                                Browse Files
                            </span>
                        </label>
                    </div>
                )}

                {/* SMS paste section */}
                {activeTab === "sms" && (
                    <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-white mb-2">Paste M-Pesa SMS Messages</h3>
                            <p className="text-sm text-gray-400 mb-4">
                                Copy and paste your M-Pesa SMS messages below. Include as many transactions as possible for better analysis.
                            </p>
                            <textarea
                                className="w-full h-64 bg-gray-900 text-white border border-gray-700 rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="bg-gray-800 rounded-lg p-6 mb-8"
                    >
                        <div className="flex items-center mb-4">
                            <FileText className="h-8 w-8 text-blue-400 mr-3" />
                            <div>
                                <h3 className="text-lg font-medium text-white">{file.name}</h3>
                                <p className="text-sm text-gray-400">
                                    {(file.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={uploadStatus === "uploading" || uploadStatus === "success"}
                            className={`w-full py-3 rounded-md font-medium transition-colors ${uploadStatus === "uploading"
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
                                    <Check className="h-5 w-5 mr-2" />
                                    Upload Complete
                                </span>
                            )}
                            {uploadStatus === "error" && (
                                <span className="flex items-center justify-center">
                                    <AlertCircle className="h-5 w-5 mr-2" />
                                    Upload Failed - Try Again
                                </span>
                            )}
                        </button>
                    </motion.div>
                )}

                {/* SMS submit button */}
                {activeTab === "sms" && smsText.trim() && !smsSubmitted && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mb-8"
                    >
                        <button
                            onClick={handleUpload}
                            disabled={uploadStatus === "uploading" || uploadStatus === "success"}
                            className={`w-full py-3 rounded-md font-medium transition-colors ${uploadStatus === "uploading"
                                ? "bg-blue-700 text-blue-200 cursor-not-allowed"
                                : uploadStatus === "success"
                                    ? "bg-green-600 text-white cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                        >
                            {uploadStatus === "idle" && "Process SMS Messages"}
                            {uploadStatus === "uploading" && "Processing..."}
                            {uploadStatus === "success" && (
                                <span className="flex items-center justify-center">
                                    <Check className="h-5 w-5 mr-2" />
                                    Processing Complete
                                </span>
                            )}
                            {uploadStatus === "error" && (
                                <span className="flex items-center justify-center">
                                    <AlertCircle className="h-5 w-5 mr-2" />
                                    Processing Failed - Try Again
                                </span>
                            )}
                        </button>
                    </motion.div>
                )}

                {/* Success message for SMS */}
                {activeTab === "sms" && smsSubmitted && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-green-600/20 border border-green-500 rounded-lg p-6 mb-8"
                    >
                        <div className="flex items-center mb-2">
                            <Check className="h-6 w-6 text-green-500 mr-2" />
                            <h3 className="text-lg font-medium text-white">SMS Messages Processed Successfully</h3>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Your M-Pesa SMS messages have been processed. We found:
                        </p>
                        <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-800/50 p-4 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-400">Transactions</p>
                                <p className="text-xl font-bold text-white">{transactionStats.count}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Income</p>
                                <p className="text-xl font-bold text-green-400">KSh {transactionStats.income.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Expenses</p>
                                <p className="text-xl font-bold text-red-400">KSh {transactionStats.expenses.toLocaleString()}</p>
                            </div>
                        </div>
                        <Link href="/dashboard" className="mt-2 inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
                            View Dashboard
                        </Link>
                    </motion.div>
                )}

                <div className="bg-gray-800/50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-white">How it works</h2>
                    <ol className="list-decimal list-inside space-y-3 text-gray-300">
                        <li>Upload your M-Pesa statement or paste your M-Pesa SMS messages</li>
                        <li>Our AI will analyze your transactions and categorize them</li>
                        <li>View insights about your spending habits and financial patterns</li>
                        <li>Get personalized recommendations to improve your financial health</li>
                        <li>Chat with our AI assistant to ask questions about your finances</li>
                    </ol>
                </div>
            </motion.div>
        </div>
    )
} 