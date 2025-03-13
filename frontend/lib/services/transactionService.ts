/**
 * Fetch the user's current balance
 * @returns Promise with the user's balance
 */
export const fetchBalance = async (): Promise<{ balance: number }> => {
    try {
        const response = await api.get('/api/transactions/balance');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching balance:', error);
        throw error;
    }
}; 