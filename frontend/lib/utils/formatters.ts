/**
 * Format a currency amount
 * @param amount Amount to format
 * @param currency Currency code (default: KES)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | undefined | null, currency = 'KES'): string => {
    if (amount === undefined || amount === null) {
        return 'N/A';
    }

    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Format a date
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string | undefined | null): string => {
    if (!date) {
        return 'N/A';
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(dateObj);
};

/**
 * Format a date and time
 * @param date Date to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string | undefined | null): string => {
    if (!date) {
        return 'N/A';
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(dateObj);
};

/**
 * Format a transaction type
 * @param type Transaction type
 * @returns Formatted transaction type
 */
export const formatTransactionType = (type: string): string => {
    const typeMap: Record<string, string> = {
        'SENT': 'Sent',
        'RECEIVED': 'Received',
        'PAYMENT': 'Payment',
        'WITHDRAWAL': 'Withdrawal',
        'DEPOSIT': 'Deposit',
        'OTHER': 'Other',
    };

    return typeMap[type] || type;
};

/**
 * Format a transaction category
 * @param category Transaction category
 * @returns Formatted transaction category
 */
export const formatTransactionCategory = (category: string): string => {
    const categoryMap: Record<string, string> = {
        'FOOD': 'Food',
        'TRANSPORT': 'Transport',
        'UTILITIES': 'Utilities',
        'ENTERTAINMENT': 'Entertainment',
        'SHOPPING': 'Shopping',
        'HEALTH': 'Health',
        'EDUCATION': 'Education',
        'TRANSFER': 'Transfer',
        'BILLS': 'Bills',
        'OTHER': 'Other',
    };

    return categoryMap[category] || category;
}; 