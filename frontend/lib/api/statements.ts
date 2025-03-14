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
 * Process a PDF statement
 * @param pdfData Extracted data from PDF
 * @param statementId Optional statement ID
 * @param statementDate Optional statement date
 * @returns API response
 */
export const processPdf = async (pdfData: any, statementId?: string, statementDate?: string) => {
    try {
        console.log('API Client: Processing PDF data');
        console.log('API Client: PDF data type:', typeof pdfData);

        if (pdfData.summaryData) {
            console.log('API Client: PDF summary data count:', pdfData.summaryData.length);

            // Ensure all summary data has source set to PDF
            pdfData.summaryData.forEach(item => {
                item.source = 'PDF';
            });
            console.log('API Client: Added source=PDF to all summary data items');
        }

        // Ensure statement has source set to PDF
        if (pdfData.statement) {
            pdfData.statement.source = 'PDF';
        }

        // Ensure customer info has source set to PDF
        if (pdfData.customerInfo) {
            pdfData.customerInfo.source = 'PDF';
        }

        console.log('API Client: Sending PDF data to backend');
        const response = await apiClient.post('/statements/process-pdf', {
            pdfData,
            statementId: statementId || `pdf-${Date.now()}`,
            statementDate: statementDate || new Date().toISOString(),
        });

        console.log('API Client: PDF processing response received');
        return response.data;
    } catch (error: any) {
        console.error('API Client: Error processing PDF:', error);
        return {
            success: false,
            error: {
                message: error.response?.data?.error?.message || 'Failed to process PDF statement',
                code: error.response?.data?.error?.code || 'PDF_PROCESSING_ERROR',
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