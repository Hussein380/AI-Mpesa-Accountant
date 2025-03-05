// M-Pesa SMS Parser Utility
// This utility parses M-Pesa SMS messages and extracts transaction details

export interface MpesaTransaction {
    transactionId: string;
    type: 'SENT' | 'RECEIVED' | 'UNKNOWN';
    amount: number;
    recipient?: string;
    sender?: string;
    phoneNumber?: string;
    date: Date;
    balance: number;
    description?: string;
}

/**
 * Parse M-Pesa SMS messages and extract transaction details
 * @param smsText The SMS text to parse
 * @returns Array of parsed M-Pesa transactions
 */
export function parseMpesaSms(smsText: string): MpesaTransaction[] {
    // Split the input text into individual messages
    const messages = smsText.split(/\n+/).filter(msg => msg.trim() !== '');

    const transactions: MpesaTransaction[] = [];

    for (const message of messages) {
        try {
            // Check if this is a valid M-Pesa message
            if (!message.includes('M-PESA') && !message.includes('Confirmed')) {
                continue;
            }

            // Extract transaction ID (usually starts with TC or similar)
            const transactionIdMatch = message.match(/([A-Z0-9]+)\s+Confirmed/);
            const transactionId = transactionIdMatch ? transactionIdMatch[1] : 'UNKNOWN';

            // Extract amount
            const amountMatch = message.match(/Ksh([0-9,.]+)/);
            const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

            // Extract balance
            const balanceMatch = message.match(/balance is Ksh([0-9,.]+)/);
            const balance = balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : 0;

            // Extract date
            const dateMatch = message.match(/on\s+(\d+\/\d+\/\d+)\s+at\s+(\d+:\d+\s+[APM]+)/);
            let date = new Date();
            if (dateMatch) {
                const [, dateStr, timeStr] = dateMatch;
                const [day, month, year] = dateStr.split('/').map(Number);
                const [hourMin, period] = timeStr.split(/\s+/);
                const [hour, minute] = hourMin.split(':').map(Number);

                // Adjust hour for PM
                const adjustedHour = period.includes('PM') && hour !== 12 ? hour + 12 : hour;

                date = new Date(2000 + year, month - 1, day, adjustedHour, minute);
            }

            // Determine transaction type and extract recipient/sender
            let type: 'SENT' | 'RECEIVED' | 'UNKNOWN' = 'UNKNOWN';
            let recipient = '';
            let sender = '';
            let phoneNumber = '';

            if (message.includes('sent to')) {
                type = 'SENT';
                const recipientMatch = message.match(/sent to\s+([^0-9]+)(\d+)/);
                if (recipientMatch) {
                    recipient = recipientMatch[1].trim();
                    phoneNumber = recipientMatch[2].trim();
                }
            } else if (message.includes('received') || message.includes('You have received')) {
                type = 'RECEIVED';
                const senderMatch = message.match(/from\s+([^0-9]+)(\d+)/);
                if (senderMatch) {
                    sender = senderMatch[1].trim();
                    phoneNumber = senderMatch[2].trim();
                }
            }

            transactions.push({
                transactionId,
                type,
                amount,
                recipient,
                sender,
                phoneNumber,
                date,
                balance,
                description: message.substring(0, 100) // Store part of the original message as description
            });
        } catch (error) {
            console.error('Error parsing M-Pesa message:', message, error);
            // Continue with the next message even if one fails
        }
    }

    return transactions;
}

/**
 * Format currency amount
 * @param amount The amount to format
 * @returns Formatted amount string
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 2
    }).format(amount);
}

/**
 * Format date to a readable string
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
} 