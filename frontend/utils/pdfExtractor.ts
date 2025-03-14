/**
 * Utility functions for extracting data from M-Pesa PDF statements
 */

/**
 * Extract summary data from PDF text
 * @param text - Raw text extracted from PDF
 * @returns Array of summary items
 */
export const extractSummaryFromPdf = (text: string) => {
    try {
        console.log('Extracting summary from PDF text...');
        const lines = text.split('\n');
        const summaryData = [];

        // Find the summary section
        let summaryStartIndex = -1;

        // Look for the TRANSACTION TYPE header
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            console.log(`Checking line ${i}: ${line.substring(0, 50)}...`);

            if (
                (line.includes('TRANSACTION TYPE') && line.includes('PAID IN') && line.includes('PAID OUT')) ||
                (line.includes('TRANSACTION') && line.includes('TYPE') && line.includes('PAID') && line.includes('IN') && line.includes('OUT'))
            ) {
                console.log(`Found summary header at line ${i}: ${line}`);
                summaryStartIndex = i + 1;
                break;
            }
        }

        if (summaryStartIndex === -1) {
            // Try alternative approach - look for "SUMMARY" section
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim() === 'SUMMARY') {
                    console.log(`Found SUMMARY section at line ${i}`);
                    // Look for transaction type header in the next few lines
                    for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
                        const line = lines[j].trim();
                        if (line.includes('TRANSACTION') && line.includes('PAID IN') && line.includes('PAID OUT')) {
                            console.log(`Found summary header at line ${j}: ${line}`);
                            summaryStartIndex = j + 1;
                            break;
                        }
                    }
                    break;
                }
            }
        }

        if (summaryStartIndex === -1) {
            console.error('Summary section not found in PDF text');
            console.log('First 20 lines of PDF text:');
            lines.slice(0, 20).forEach((line, i) => console.log(`Line ${i}: ${line}`));
            throw new Error('Summary section not found in PDF text');
        }

        console.log(`Starting to parse summary data from line ${summaryStartIndex}`);

        // Parse each line of the summary
        for (let i = summaryStartIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            console.log(`Parsing summary line ${i}: ${line}`);

            // Stop when we reach the total or a blank line after parsing some data
            if (line.startsWith('TOTAL:') || (line === '' && summaryData.length > 0)) {
                console.log(`Reached end of summary section at line ${i}`);
                break;
            }

            // Skip empty lines
            if (!line) {
                continue;
            }

            try {
                // Parse the line
                // Format: Transaction Type | Paid In | Paid Out
                const parts = line.split(/\s+/);

                if (parts.length < 3) {
                    console.log(`Skipping line with insufficient parts: ${line}`);
                    continue;
                }

                // Extract the last two numbers (paid in and paid out)
                let paidOut = 0;
                let paidIn = 0;

                try {
                    paidOut = parseFloat(parts.pop()?.replace(/,/g, '') || '0');
                    paidIn = parseFloat(parts.pop()?.replace(/,/g, '') || '0');
                } catch (e) {
                    console.error(`Error parsing numbers from line: ${line}`, e);
                    continue;
                }

                // The rest is the transaction type
                const transactionType = parts.join(' ');

                console.log(`Extracted: Type=${transactionType}, PaidIn=${paidIn}, PaidOut=${paidOut}`);

                summaryData.push({
                    transactionType,
                    paidIn,
                    paidOut
                });
            } catch (e) {
                console.error(`Error parsing line ${i}: ${line}`, e);
            }
        }

        console.log(`Extracted ${summaryData.length} summary items`);
        return summaryData;
    } catch (error) {
        console.error('Error extracting summary from PDF:', error);
        return [];
    }
};

/**
 * Extract customer information from PDF text
 * @param text - Raw text extracted from PDF
 * @returns Customer information
 */
export const extractCustomerInfoFromPdf = (text: string) => {
    try {
        console.log('Extracting customer info from PDF text...');
        const lines = text.split('\n');
        const customerInfo: Record<string, string> = {};

        // Look for customer information
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            console.log(`Checking customer info line ${i}: ${line.substring(0, 50)}...`);

            // Check for various formats of customer information
            if (line.includes('Customer Name:') || line.includes('Customer Name')) {
                customerInfo.name = line.replace(/Customer Name:?/i, '').trim();
                console.log(`Found customer name: ${customerInfo.name}`);
            } else if (line.includes('Mobile Number:') || line.includes('Mobile Number')) {
                customerInfo.phoneNumber = line.replace(/Mobile Number:?/i, '').trim();
                console.log(`Found phone number: ${customerInfo.phoneNumber}`);
            } else if (line.includes('Date of Statement:') || line.includes('Date of Statement')) {
                customerInfo.statementDate = line.replace(/Date of Statement:?/i, '').trim();
                console.log(`Found statement date: ${customerInfo.statementDate}`);
            } else if (line.includes('Statement Period:') || line.includes('Statement Period')) {
                customerInfo.statementPeriod = line.replace(/Statement Period:?/i, '').trim();
                console.log(`Found statement period: ${customerInfo.statementPeriod}`);
            }

            // Try to extract from lines with format "Label: Value"
            const labelMatch = line.match(/^([^:]+):\s*(.+)$/);
            if (labelMatch) {
                const [, label, value] = labelMatch;
                if (label.includes('Customer') && label.includes('Name')) {
                    customerInfo.name = value.trim();
                    console.log(`Found customer name (alt): ${customerInfo.name}`);
                } else if (label.includes('Mobile') || label.includes('Phone')) {
                    customerInfo.phoneNumber = value.trim();
                    console.log(`Found phone number (alt): ${customerInfo.phoneNumber}`);
                } else if (label.includes('Date') && label.includes('Statement')) {
                    customerInfo.statementDate = value.trim();
                    console.log(`Found statement date (alt): ${customerInfo.statementDate}`);
                } else if (label.includes('Statement') && label.includes('Period')) {
                    customerInfo.statementPeriod = value.trim();
                    console.log(`Found statement period (alt): ${customerInfo.statementPeriod}`);
                }
            }

            // Stop once we've found all the information or processed enough lines
            if (
                (customerInfo.name && customerInfo.phoneNumber &&
                    customerInfo.statementDate && customerInfo.statementPeriod) ||
                i > 30 // Only check the first 30 lines
            ) {
                break;
            }
        }

        // If we couldn't find the information in the standard format,
        // try to extract it from the raw text using regex patterns
        if (!customerInfo.name || !customerInfo.phoneNumber) {
            console.log('Trying alternative extraction methods...');

            // Look for patterns like "Customer Name: John Doe"
            const nameMatch = text.match(/Customer\s+Name:?\s+([^\n]+)/i);
            if (nameMatch && !customerInfo.name) {
                customerInfo.name = nameMatch[1].trim();
                console.log(`Found customer name (regex): ${customerInfo.name}`);
            }

            // Look for patterns like "Mobile Number: 254XXXXXXXXX"
            const phoneMatch = text.match(/Mobile\s+Number:?\s+([^\n]+)/i);
            if (phoneMatch && !customerInfo.phoneNumber) {
                customerInfo.phoneNumber = phoneMatch[1].trim();
                console.log(`Found phone number (regex): ${customerInfo.phoneNumber}`);
            }

            // Look for patterns like "Date of Statement: 11th 3 2025"
            const dateMatch = text.match(/Date\s+of\s+Statement:?\s+([^\n]+)/i);
            if (dateMatch && !customerInfo.statementDate) {
                customerInfo.statementDate = dateMatch[1].trim();
                console.log(`Found statement date (regex): ${customerInfo.statementDate}`);
            }

            // Look for patterns like "Statement Period: 01st 2 2025 - 28th 2 2025"
            const periodMatch = text.match(/Statement\s+Period:?\s+([^\n]+)/i);
            if (periodMatch && !customerInfo.statementPeriod) {
                customerInfo.statementPeriod = periodMatch[1].trim();
                console.log(`Found statement period (regex): ${customerInfo.statementPeriod}`);
            }
        }

        console.log('Extracted customer info:', customerInfo);
        return customerInfo;
    } catch (error) {
        console.error('Error extracting customer info from PDF:', error);
        return {};
    }
};

/**
 * Process PDF text to extract all relevant information
 * @param text - Raw text extracted from PDF
 * @returns Processed PDF data
 */
export const processPdfText = (text: string) => {
    console.log('PDF Extractor: Processing PDF text...');
    console.log('PDF Extractor: Text length:', text.length);
    console.log('PDF Extractor: Sample of text:', text.substring(0, 200));

    const customerInfo = extractCustomerInfoFromPdf(text);
    const summaryData = extractSummaryFromPdf(text);

    console.log('PDF Extractor: Extracted summary data count:', summaryData.length);

    // Ensure all summary data has source set to PDF
    summaryData.forEach(item => {
        item.source = 'PDF';
    });

    // Calculate totals
    const totalIncome = summaryData.reduce((sum, item) => sum + item.paidIn, 0);
    const totalExpenses = summaryData.reduce((sum, item) => sum + item.paidOut, 0);
    const netAmount = totalIncome - totalExpenses;

    console.log('PDF Extractor: Total income:', totalIncome);
    console.log('PDF Extractor: Total expenses:', totalExpenses);
    console.log('PDF Extractor: Net amount:', netAmount);

    // Parse dates from statement period
    let startDate = null;
    let endDate = null;

    if (customerInfo.statementPeriod) {
        const dateMatch = customerInfo.statementPeriod.match(/(\d+)(?:st|nd|rd|th)?\s+(\d+)\s+(\d+)\s*-\s*(\d+)(?:st|nd|rd|th)?\s+(\d+)\s+(\d+)/);
        if (dateMatch) {
            const [, startDay, startMonth, startYear, endDay, endMonth, endYear] = dateMatch;
            startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
            endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));

            console.log(`PDF Extractor: Parsed date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
        }
    }

    return {
        customerInfo,
        summaryData,
        statement: {
            totalIncome,
            totalExpenses,
            netAmount,
            startDate: startDate ? startDate.toISOString() : null,
            endDate: endDate ? endDate.toISOString() : null,
            confidence: summaryData.length > 0 ? 0.9 : 0.5,
            source: 'PDF' // Explicitly set source as PDF
        }
    };
}; 