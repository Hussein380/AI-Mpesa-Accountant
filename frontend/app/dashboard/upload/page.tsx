"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Upload, FileText, Check, AlertCircle } from "lucide-react"

export default function UploadPage() {
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")

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
        if (!file) return

        setUploadStatus("uploading")

        // Simulate upload
        try {
            await new Promise(resolve => setTimeout(resolve, 2000))
            setUploadStatus("success")
        } catch (error) {
            setUploadStatus("error")
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <Link href="/dashboard" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto"
            >
                <h1 className="text-3xl font-bold mb-2 text-white">Upload M-Pesa Statement</h1>
                <p className="text-gray-400 mb-8">
                    Upload your M-Pesa statement in PDF or CSV format to analyze your transactions
                </p>

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

                {file && (
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

                <div className="bg-gray-800/50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-white">How it works</h2>
                    <ol className="list-decimal list-inside space-y-3 text-gray-300">
                        <li>Download your M-Pesa statement from the Safaricom website or app</li>
                        <li>Upload the statement in PDF or CSV format</li>
                        <li>Our AI will analyze your transactions and categorize them</li>
                        <li>View insights about your spending habits and financial patterns</li>
                        <li>Get personalized recommendations to improve your financial health</li>
                    </ol>
                </div>
            </motion.div>
        </div>
    )
} 