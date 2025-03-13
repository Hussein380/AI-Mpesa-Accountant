import { apiClient } from './apiClient';

/**
 * Process an SMS message
 * @param smsText SMS message text
 * @returns API response
 */
export const processSms = async (smsText: string) => {
    try {
        const response = await apiClient.post('/statements/process-sms', { smsText });
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                message: error.response?.data?.error?.message || 'Failed to process SMS',
                code: error.response?.data?.error?.code || 'SMS_PROCESSING_ERROR',
            },
        };
    }
};

/**
 * Get all statements
 * @returns API response with statements
 */
export const getStatements = async () => {
    try {
        const response = await apiClient.get('/statements');
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                message: error.response?.data?.error?.message || 'Failed to fetch statements',
                code: error.response?.data?.error?.code || 'FETCH_ERROR',
            },
        };
    }
};

/**
 * Get statement by ID
 * @param id Statement ID
 * @returns API response with statement
 */
export const getStatementById = async (id: string) => {
    try {
        const response = await apiClient.get(`/statements/${id}`);
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                message: error.response?.data?.error?.message || 'Failed to fetch statement',
                code: error.response?.data?.error?.code || 'FETCH_ERROR',
            },
        };
    }
};

/**
 * Delete a statement
 * @param id Statement ID
 * @returns API response
 */
export const deleteStatement = async (id: string) => {
    try {
        const response = await apiClient.delete(`/statements/${id}`);
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                message: error.response?.data?.error?.message || 'Failed to delete statement',
                code: error.response?.data?.error?.code || 'DELETE_ERROR',
            },
        };
    }
};

/**
 * Get statement statistics
 * @returns API response with statistics
 */
export const getStatementStatistics = async () => {
    try {
        const response = await apiClient.get('/statements/statistics');
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                message: error.response?.data?.error?.message || 'Failed to fetch statistics',
                code: error.response?.data?.error?.code || 'STATISTICS_ERROR',
            },
        };
    }
}; 