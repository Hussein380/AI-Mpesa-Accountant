"use client"

import { useState } from 'react';
import { processSms, processPdf } from '@/lib/api/statements';
import { Transaction } from '@/types/models';
import UploadForm from '@/components/upload/UploadForm';
import PdfUploadForm from '@/components/upload/PdfUploadForm';
import TransactionList from '@/components/transactions/TransactionList';
import StatementSummary from '@/components/upload/StatementSummary';
import ConfidenceIndicator from '@/components/upload/ConfidenceIndicator';
import CombinedStatementView from '@/components/upload/CombinedStatementView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [statementInfo, setStatementInfo] = useState<any>(null);
    const [isCombinedStatement, setIsCombinedStatement] = useState(false);
    const [combinedReference, setCombinedReference] = useState('');
    const [activeTab, setActiveTab] = useState('sms');
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const router = useRouter();

    const handleSmsProcess = async (smsText: string) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        setIsCombinedStatement(false);
        setCombinedReference(null);

        try {
            const result = await processSms(smsText);

            if (result.success) {
                if (result.data.statement) {
                    // Combined statement
                    setIsCombinedStatement(true);
                    setCombinedReference(result.data.statement._id);
                    setTransactions(result.data.transactions);
                    setStatementInfo({
                        id: result.data.statement._id,
                        filename: 'SMS Transactions',
                        format: 'SMS',
                        confidence: 0.9,
                        transactionCount: result.data.transactions.length,
                        totalIncome: result.data.transactions.reduce(
                            (sum: number, t: Transaction) => t.type === 'RECEIVED' ? sum + t.amount : sum, 0
                        ),
                        totalExpenses: result.data.transactions.reduce(
                            (sum: number, t: Transaction) => t.type === 'SENT' ? sum + t.amount : sum, 0
                        ),
                        netAmount: result.data.transactions.reduce(
                            (sum: number, t: Transaction) => t.type === 'RECEIVED' ? sum + t.amount : t.type === 'SENT' ? sum - t.amount : sum, 0
                        ),
                        startDate: result.data.statement.startDate,
                        endDate: result.data.statement.endDate
                    });

                    // Set success message
                    setSuccess('SMS processed successfully! Redirecting to dashboard in 2 seconds...');

                    // Navigate to dashboard with refresh parameter after a short delay
                    setTimeout(() => {
                        router.push(`/dashboard?refresh=${Date.now()}`);
                    }, 2000);
                } else {
                    // Single transaction
                    setTransactions([result.data.transaction]);

                    // Set success message
                    setSuccess('SMS processed successfully! Redirecting to dashboard in 2 seconds...');

                    // Navigate to dashboard with refresh parameter after a short delay
                    setTimeout(() => {
                        router.push(`/dashboard?refresh=${Date.now()}`);
                    }, 2000);
                }
            } else {
                setError(result.error?.message || 'Failed to process SMS');
            }
        } catch (err) {
            console.error('Error in SMS processing:', err);
            setError('Failed to process SMS. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePdfProcess = async (pdfData: any, fileName: string) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        setIsCombinedStatement(false);
        setDebugInfo(pdfData); // Store the extracted data for debugging

        try {
            console.log('Upload Page: PDF data to be sent to API:', pdfData);
            console.log('Upload Page: PDF summary data count:', pdfData.summaryData?.length || 0);

            // Ensure all data has source set to PDF
            if (pdfData.summaryData) {
                pdfData.summaryData.forEach(item => {
                    item.source = 'PDF';
                });
                console.log('Upload Page: Added source=PDF to all summary data items');
            }

            // For testing without backend, use the extracted data directly
            if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_USE_BACKEND) {
                console.log('Upload Page: Using local PDF processing (no backend call)');

                // Create mock transactions from the summary data
                const mockTransactions = createMockTransactionsFromSummary(pdfData.summaryData);
                console.log('Upload Page: Created mock transactions:', mockTransactions.length);

                setIsCombinedStatement(true);
                setTransactions(mockTransactions);
                setStatementInfo({
                    id: `pdf-${Date.now()}`,
                    filename: fileName,
                    format: 'PDF',
                    confidence: pdfData.statement.confidence || 0.8,
                    transactionCount: mockTransactions.length,
                    totalIncome: pdfData.statement.totalIncome,
                    totalExpenses: pdfData.statement.totalExpenses,
                    netAmount: pdfData.statement.netAmount,
                    startDate: pdfData.statement.startDate,
                    endDate: pdfData.statement.endDate
                });

                setIsLoading(false);

                // Set success message
                setSuccess('PDF processed successfully! Redirecting to dashboard in 2 seconds...');

                // Navigate to dashboard with refresh parameter after a short delay
                setTimeout(() => {
                    router.push(`/dashboard?refresh=${Date.now()}`);
                }, 2000);

                return;
            }

            // Call the API to process the PDF data
            console.log('Upload Page: Calling API to process PDF data');
            const result = await processPdf(pdfData);
            console.log('Upload Page: PDF processing result:', result);

            if (result.success) {
                console.log('Upload Page: PDF processing successful');
                console.log('Upload Page: Transactions count:', result.data.transactions?.length || 0);

                // Log transaction sources
                const sources = [...new Set(result.data.transactions?.map(t => t.source) || [])];
                console.log('Upload Page: Transaction sources:', sources);

                // Count transactions by source
                const sourceCount = sources.reduce((acc, source) => {
                    acc[source] = result.data.transactions?.filter(t => t.source === source).length || 0;
                    return acc;
                }, {});
                console.log('Upload Page: Transactions by source:', sourceCount);

                // Log PDF transactions specifically
                const pdfTransactions = result.data.transactions?.filter(t => t.source === 'PDF') || [];
                console.log('Upload Page: PDF transactions count:', pdfTransactions.length);

                if (pdfTransactions.length > 0) {
                    console.log('Upload Page: PDF transaction example:', pdfTransactions[0]);
                }

                setIsCombinedStatement(true);
                setTransactions(result.data.transactions);
                setStatementInfo({
                    id: result.data.statement?._id || `pdf-${Date.now()}`,
                    filename: fileName,
                    format: 'PDF',
                    confidence: result.data.statement?.confidence || 0.8,
                    transactionCount: result.data.transactions?.length || 0,
                    totalIncome: result.data.stats?.income || pdfData.statement.totalIncome,
                    totalExpenses: result.data.stats?.expenses || pdfData.statement.totalExpenses,
                    netAmount: (result.data.stats?.income || 0) - (result.data.stats?.expenses || 0),
                    startDate: pdfData.statement.startDate,
                    endDate: pdfData.statement.endDate
                });

                // Set success message
                setSuccess('PDF processed successfully! Redirecting to dashboard in 2 seconds...');

                // Navigate to dashboard with refresh and pdf parameters after a short delay
                setTimeout(() => {
                    const timestamp = Date.now();
                    router.push(`/dashboard?refresh=${timestamp}&pdf=true`);
                }, 2000);
            } else {
                console.error('Upload Page: PDF processing failed:', result.error);
                setError(result.error?.message || 'Failed to process PDF');
            }
        } catch (err) {
            console.error('Upload Page: Error processing PDF:', err);
            setError(`Failed to process PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to create mock transactions from summary data
    const createMockTransactionsFromSummary = (summaryData: any[]) => {
        console.log('Upload Page: Creating mock transactions from summary data');
        console.log('Upload Page: Summary data count:', summaryData?.length || 0);

        const transactions: Transaction[] = [];
        const now = new Date();

        summaryData.forEach((item, index) => {
            // Create a transaction for paid in amount
            if (item.paidIn > 0) {
                transactions.push({
                    _id: `pdf-in-${index}`,
                    user: 'current-user',
                    transactionId: `PDF-IN-${Date.now()}-${index}`,
                    date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - Math.floor(Math.random() * 28)).toISOString(),
                    type: 'RECEIVED',
                    amount: item.paidIn,
                    description: `${item.transactionType} (Received)`,
                    category: mapCategoryFromType(item.transactionType),
                    source: 'PDF', // Explicitly set source as PDF
                    createdAt: new Date().toISOString()
                });
                console.log(`Upload Page: Created mock income transaction: ${item.paidIn} from ${item.transactionType}`);
            }

            // Create a transaction for paid out amount
            if (item.paidOut > 0) {
                // Determine the appropriate type based on transaction type
                let transactionType = 'SENT';
                if (item.transactionType.includes('Payment') || item.transactionType.includes('Pay')) {
                    transactionType = 'PAYMENT';
                } else if (item.transactionType.includes('Withdraw')) {
                    transactionType = 'WITHDRAWAL';
                }

                transactions.push({
                    _id: `pdf-out-${index}`,
                    user: 'current-user',
                    transactionId: `PDF-OUT-${Date.now()}-${index}`,
                    date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - Math.floor(Math.random() * 28)).toISOString(),
                    type: transactionType, // Use the determined type
                    amount: item.paidOut,
                    description: `${item.transactionType} (Sent)`,
                    category: mapCategoryFromType(item.transactionType),
                    source: 'PDF', // Explicitly set source as PDF
                    createdAt: new Date().toISOString()
                });
                console.log(`Upload Page: Created mock expense transaction: ${item.paidOut} for ${item.transactionType} as ${transactionType}`);
            }
        });

        console.log(`Upload Page: Created ${transactions.length} mock transactions`);

        // Verify all transactions have source set to PDF
        transactions.forEach(t => {
            if (!t.source) {
                t.source = 'PDF';
                console.log(`Upload Page: Fixed missing source field for transaction: ${t.transactionId}`);
            }
        });

        return transactions;
    };

    // Helper function to map transaction type to category
    const mapCategoryFromType = (type: string): 'FOOD' | 'TRANSPORT' | 'UTILITIES' | 'ENTERTAINMENT' | 'SHOPPING' | 'HEALTH' | 'EDUCATION' | 'OTHER' => {
        const categoryMap: Record<string, any> = {
            'Cash Out': 'OTHER',
            'Send Money': 'OTHER',
            'B2C Payment': 'OTHER',
            'Pay Bill': 'UTILITIES',
            'FSI Withdraw': 'OTHER',
            'Cash In': 'OTHER',
            'FSI Deposit': 'OTHER',
            'ODRepayment': 'OTHER',
            'Customer Merchant Payment': 'SHOPPING',
            'Customer Airtime Purchase': 'UTILITIES',
            'Customer Bundle Purchase': 'UTILITIES'
        };

        return categoryMap[type] || 'OTHER';
    };

    return (
        <div className="container mx-auto p-4 bg-gray-900 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-100">Process M-Pesa Statement</h1>

            <Tabs defaultValue="sms" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="sms" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        SMS Message
                    </TabsTrigger>
                    <TabsTrigger value="pdf" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        PDF Statement
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="sms">
                    <UploadForm
                        onSmsProcess={handleSmsProcess}
                        isLoading={isLoading}
                    />
                </TabsContent>

                <TabsContent value="pdf">
                    <PdfUploadForm
                        onPdfProcess={handlePdfProcess}
                        isLoading={isLoading}
                    />
                </TabsContent>
            </Tabs>

            {error && (
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mt-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded mt-4 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-400 mr-2"></div>
                    {success}
                </div>
            )}

            {statementInfo && (
                <div className="mt-6">
                    <StatementSummary
                        filename={statementInfo.filename}
                        transactionCount={statementInfo.transactionCount}
                        format={statementInfo.format}
                        totalIncome={statementInfo.totalIncome}
                        totalExpenses={statementInfo.totalExpenses}
                        netAmount={statementInfo.netAmount}
                        startDate={statementInfo.startDate}
                        endDate={statementInfo.endDate}
                    />
                    <ConfidenceIndicator
                        confidence={statementInfo.confidence}
                        className="mt-2"
                    />

                    {/* View on Dashboard button */}
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => {
                                // Add both refresh and pdf parameters to ensure PDF transactions are checked
                                const timestamp = Date.now();
                                router.push(`/dashboard?refresh=${timestamp}&pdf=true`);
                            }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            View on Dashboard
                        </button>
                    </div>
                </div>
            )}

            {isCombinedStatement && transactions.length > 0 && (
                <div className="mt-6">
                    <CombinedStatementView
                        transactions={transactions}
                        reference={combinedReference}
                    />
                </div>
            )}

            {!isCombinedStatement && transactions.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-200">Extracted Transactions</h2>
                    <TransactionList transactions={transactions} />
                </div>
            )}

            {process.env.NODE_ENV === 'development' && debugInfo && (
                <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-gray-200">Debug Information</h3>
                    <pre className="text-xs text-gray-400 overflow-auto max-h-96">
                        {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
} 