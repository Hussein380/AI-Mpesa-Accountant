import { Transaction } from './models';
import { MpesaTransaction } from '@/lib/mpesa-parser';

/**
 * Converts a Transaction model from the API to a MpesaTransaction model for the frontend
 */
export const convertToMpesaTransaction = (transaction: Transaction): MpesaTransaction => {
    // Map the transaction type
    let mpesaType: 'SENT' | 'RECEIVED' | 'UNKNOWN' = 'UNKNOWN';

    if (transaction.type === 'SENT') {
        mpesaType = 'SENT';
    } else if (transaction.type === 'RECEIVED') {
        mpesaType = 'RECEIVED';
    } else if (['PAYMENT', 'WITHDRAWAL'].includes(transaction.type)) {
        // Treat PAYMENT and WITHDRAWAL like SENT (outgoing money)
        mpesaType = 'SENT';
    } else if (transaction.type === 'DEPOSIT') {
        // Treat DEPOSIT like RECEIVED (incoming money)
        mpesaType = 'RECEIVED';
    }

    return {
        id: transaction._id,
        _id: transaction._id,
        transactionId: transaction.transactionId,
        type: mpesaType,
        amount: transaction.amount,
        recipient: transaction.recipient,
        sender: transaction.sender,
        date: transaction.date,
        balance: transaction.balance,
        description: transaction.description,
        mpesaReference: transaction.mpesaReference,
        source: transaction.source,
        category: transaction.category
    };
};

/**
 * Converts an array of Transaction models to MpesaTransaction models
 */
export const convertToMpesaTransactions = (transactions: Transaction[]): MpesaTransaction[] => {
    return transactions.map(convertToMpesaTransaction);
}; 