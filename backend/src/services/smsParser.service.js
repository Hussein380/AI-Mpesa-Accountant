/**
 * Enhanced SMS parser that supports multiple M-Pesa SMS formats
 */
class SmsParserService {
  /**
   * Parse M-Pesa SMS message and extract transaction details
   * @param {string} smsText - SMS message text
   * @returns {Object} Parsing result with transaction details
   */
  parseSms(smsText) {
    try {
      // Check if this is a combined statement
      if (this.isCombinedStatement(smsText)) {
        return this.parseCombinedStatement(smsText);
      }
      
      // Detect SMS format
      const format = this.detectSmsFormat(smsText);
      
      if (!format) {
        return {
          success: false,
          error: {
            message: 'Unsupported SMS format',
            code: 'UNSUPPORTED_FORMAT'
          }
        };
      }
      
      // Extract transaction based on format
      const extractionResult = this.extractTransaction(smsText, format);
      
      if (!extractionResult.success) {
        return extractionResult;
      }
      
      // Add confidence score and format
      const transaction = {
        ...extractionResult.transaction,
        confidence: this.calculateConfidence(extractionResult.transaction, smsText),
        format: format,
        parsingMethod: 'enhanced',
        source: 'SMS'
      };
      
      return {
        success: true,
        transaction
      };
    } catch (error) {
      console.error('SMS parsing error:', error);
      return {
        success: false,
        error: {
          message: 'Failed to parse SMS message',
          details: error.message,
          code: 'SMS_PARSE_ERROR'
        }
      };
    }
  }
  
  /**
   * Check if the text is a combined statement
   * @param {string} smsText - SMS message text
   * @returns {boolean} True if it's a combined statement
   */
  isCombinedStatement(smsText) {
    // Check for transaction reference at the beginning
    const hasTransactionRef = /^[A-Z0-9]{10,12}/.test(smsText);
    
    // Check for multiple "Completed" occurrences
    const completedCount = (smsText.match(/Completed/g) || []).length;
    
    // Check for the characteristic square bracket pattern
    const hasBracketPattern = smsText.includes('[') && smsText.includes(']');
    
    return hasTransactionRef && completedCount > 1 && hasBracketPattern;
  }
  
  /**
   * Parse a combined statement
   * @param {string} smsText - Combined statement text
   * @returns {Object} Parsing result with multiple transactions
   */
  parseCombinedStatement(smsText) {
    try {
      // Extract the transaction reference
      const transactionRefMatch = smsText.match(/^([A-Z0-9]{10,12})/);
      const transactionRef = transactionRefMatch ? transactionRefMatch[1] : '';
      
      // Split the text into individual transactions
      const transactionBlocks = smsText.match(/\[\d{8};[^\]]+\]Completed/g);
      
      if (!transactionBlocks || transactionBlocks.length === 0) {
        return {
          success: false,
          error: {
            message: 'No transactions found in combined statement',
            code: 'NO_TRANSACTIONS'
          }
        };
      }
      
      // Parse each transaction block
      const transactions = [];
      
      for (let i = 0; i < transactionBlocks.length; i++) {
        const block = transactionBlocks[i];
        
        // Extract data from the block
        // Format: [YYYYMMDD; ;Description; Recipient;KshAmount]Completed
        const blockMatch = block.match(/\[(\d{8});\s*;([^;]+);\s*([^;]+);Ksh([0-9.]+)\]Completed/);
        
        if (blockMatch) {
          const dateStr = blockMatch[1];
          const description = blockMatch[2].trim();
          const recipient = blockMatch[3].trim();
          const amount = parseFloat(blockMatch[4]);
          
          // Format date (YYYYMMDD to Date object)
          const year = parseInt(dateStr.substring(0, 4));
          const month = parseInt(dateStr.substring(4, 6)) - 1; // JS months are 0-indexed
          const day = parseInt(dateStr.substring(6, 8));
          const date = new Date(year, month, day);
          
          // Determine transaction type based on description
          let type = 'PAYMENT';
          if (description.includes('Transfer')) {
            type = 'SENT';
          } else if (description.includes('Bundle Purchase')) {
            type = 'PAYMENT';
          }
          
          // Create transaction object
          const transaction = {
            transactionId: `${transactionRef}-${i + 1}`,
            date,
            type,
            amount,
            balance: null, // Balance not provided in this format
            recipient,
            sender: '',
            description,
            category: this.categorizeByDescription(description),
            confidence: 0.8,
            format: 'MPESA_COMBINED',
            parsingMethod: 'enhanced',
            source: 'SMS',
            mpesaReference: transactionRef
          };
          
          transactions.push(transaction);
        }
      }
      
      if (transactions.length === 0) {
        return {
          success: false,
          error: {
            message: 'Failed to parse transactions from combined statement',
            code: 'PARSE_ERROR'
          }
        };
      }
      
      return {
        success: true,
        transactions,
        isBulk: true
      };
    } catch (error) {
      console.error('Error parsing combined statement:', error);
      return {
        success: false,
        error: {
          message: 'Failed to parse combined statement',
          details: error.message,
          code: 'COMBINED_PARSE_ERROR'
        }
      };
    }
  }
  
  /**
   * Categorize transaction based on description
   * @param {string} description - Transaction description
   * @returns {string} Category
   */
  categorizeByDescription(description) {
    const desc = description.toLowerCase();
    
    if (desc.includes('bundle') || desc.includes('airtime') || desc.includes('safaricom')) {
      return 'UTILITIES';
    }
    
    if (desc.includes('transfer')) {
      return 'TRANSFER';
    }
    
    if (desc.includes('pay bill') || desc.includes('paybill')) {
      return 'BILLS';
    }
    
    if (desc.includes('buy goods')) {
      return 'SHOPPING';
    }
    
    return 'OTHER';
  }
  
  /**
   * Detect the format of the M-Pesa SMS
   * @param {string} smsText - SMS message text
   * @returns {string|null} Format identifier or null if not recognized
   */
  detectSmsFormat(smsText) {
    // Normalize text for easier matching
    const text = smsText.toUpperCase();
    
    // Check for payment received format
    if (text.includes('MPESA') && text.includes('RECEIVED') && text.includes('FROM')) {
      return 'MPESA_RECEIVED';
    }
    
    // Check for payment sent format
    if (text.includes('MPESA') && text.includes('SENT TO')) {
      return 'MPESA_SENT';
    }
    
    // Check for payment to business format
    if (text.includes('MPESA') && (text.includes('PAID TO') || text.includes('BUY GOODS'))) {
      return 'MPESA_BUSINESS_PAYMENT';
    }
    
    // Check for withdrawal format
    if (text.includes('MPESA') && text.includes('WITHDRAW')) {
      return 'MPESA_WITHDRAWAL';
    }
    
    // Check for airtime purchase format
    if (text.includes('MPESA') && text.includes('AIRTIME')) {
      return 'MPESA_AIRTIME';
    }
    
    // Unknown format
    return null;
  }
  
  /**
   * Extract transaction based on the detected format
   * @param {string} smsText - SMS message text
   * @param {string} format - Detected format
   * @returns {Object} Extraction result with transaction
   */
  extractTransaction(smsText, format) {
    switch (format) {
      case 'MPESA_RECEIVED':
        return this.extractReceivedTransaction(smsText);
      case 'MPESA_SENT':
        return this.extractSentTransaction(smsText);
      case 'MPESA_BUSINESS_PAYMENT':
        return this.extractBusinessPaymentTransaction(smsText);
      case 'MPESA_WITHDRAWAL':
        return this.extractWithdrawalTransaction(smsText);
      case 'MPESA_AIRTIME':
        return this.extractAirtimeTransaction(smsText);
      default:
        return {
          success: false,
          error: {
            message: 'Unsupported SMS format',
            code: 'UNSUPPORTED_FORMAT'
          }
        };
    }
  }
  
  /**
   * Extract transaction from received payment SMS
   * @param {string} smsText - SMS message text
   * @returns {Object} Extraction result with transaction
   */
  extractReceivedTransaction(smsText) {
    try {
      // Example format: "MPESA XXXX Confirmed. On DD/MM/YYYY at HH:MM AM/PM you received Ksh.AMOUNT from SENDER PHONE. New M-PESA balance is Ksh.BALANCE. Transaction cost, Ksh.COST."
      
      // Extract transaction ID
      const transactionIdMatch = smsText.match(/MPESA\s+([A-Z0-9]+)/i);
      const transactionId = transactionIdMatch ? transactionIdMatch[1] : `MPESA${Date.now()}`;
      
      // Extract date and time
      const dateMatch = smsText.match(/On\s+(\d{1,2}\/\d{1,2}\/\d{4})\s+at\s+(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
      const dateStr = dateMatch ? dateMatch[1] : '';
      const timeStr = dateMatch ? dateMatch[2] : '';
      
      // Extract amount
      const amountMatch = smsText.match(/received\s+Ksh[.\s]+([0-9,.]+)/i);
      const amount = amountMatch ? this.parseAmount(amountMatch[1]) : 0;
      
      // Extract sender
      const senderMatch = smsText.match(/from\s+([^.]+)/i);
      const sender = senderMatch ? senderMatch[1].trim() : '';
      
      // Extract balance
      const balanceMatch = smsText.match(/balance\s+is\s+Ksh[.\s]+([0-9,.]+)/i);
      const balance = balanceMatch ? this.parseAmount(balanceMatch[1]) : null;
      
      // Create transaction object
      const transaction = {
        transactionId,
        date: this.parseDateTime(dateStr, timeStr),
        type: 'RECEIVED',
        amount,
        balance,
        recipient: '',
        sender,
        description: `Received from ${sender}`,
        category: 'OTHER', // Will be categorized by AI later
        mpesaReference: transactionId
      };
      
      return {
        success: true,
        transaction
      };
    } catch (error) {
      console.error('Error extracting received transaction:', error);
      return {
        success: false,
        error: {
          message: 'Failed to extract received transaction',
          details: error.message,
          code: 'EXTRACTION_ERROR'
        }
      };
    }
  }
  
  /**
   * Extract transaction from sent payment SMS
   * @param {string} smsText - SMS message text
   * @returns {Object} Extraction result with transaction
   */
  extractSentTransaction(smsText) {
    try {
      // Example format: "MPESA XXXX Confirmed. Ksh.AMOUNT sent to RECIPIENT PHONE on DD/MM/YYYY at HH:MM AM/PM. New M-PESA balance is Ksh.BALANCE. Transaction cost, Ksh.COST."
      
      // Extract transaction ID
      const transactionIdMatch = smsText.match(/MPESA\s+([A-Z0-9]+)/i);
      const transactionId = transactionIdMatch ? transactionIdMatch[1] : `MPESA${Date.now()}`;
      
      // Extract date and time
      const dateMatch = smsText.match(/on\s+(\d{1,2}\/\d{1,2}\/\d{4})\s+at\s+(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
      const dateStr = dateMatch ? dateMatch[1] : '';
      const timeStr = dateMatch ? dateMatch[2] : '';
      
      // Extract amount
      const amountMatch = smsText.match(/Ksh[.\s]+([0-9,.]+)\s+sent/i);
      const amount = amountMatch ? this.parseAmount(amountMatch[1]) : 0;
      
      // Extract recipient
      const recipientMatch = smsText.match(/sent\s+to\s+([^.]+)/i);
      const recipient = recipientMatch ? recipientMatch[1].trim() : '';
      
      // Extract balance
      const balanceMatch = smsText.match(/balance\s+is\s+Ksh[.\s]+([0-9,.]+)/i);
      const balance = balanceMatch ? this.parseAmount(balanceMatch[1]) : null;
      
      // Create transaction object
      const transaction = {
        transactionId,
        date: this.parseDateTime(dateStr, timeStr),
        type: 'SENT',
        amount,
        balance,
        recipient,
        sender: '',
        description: `Sent to ${recipient}`,
        category: 'OTHER', // Will be categorized by AI later
        mpesaReference: transactionId
      };
      
      return {
        success: true,
        transaction
      };
    } catch (error) {
      console.error('Error extracting sent transaction:', error);
      return {
        success: false,
        error: {
          message: 'Failed to extract sent transaction',
          details: error.message,
          code: 'EXTRACTION_ERROR'
        }
      };
    }
  }
  
  /**
   * Extract transaction from business payment SMS
   * @param {string} smsText - SMS message text
   * @returns {Object} Extraction result with transaction
   */
  extractBusinessPaymentTransaction(smsText) {
    try {
      // Example format: "MPESA XXXX Confirmed. Ksh.AMOUNT paid to BUSINESS NAME on DD/MM/YYYY at HH:MM AM/PM. New M-PESA balance is Ksh.BALANCE. Transaction cost, Ksh.COST."
      
      // Extract transaction ID
      const transactionIdMatch = smsText.match(/MPESA\s+([A-Z0-9]+)/i);
      const transactionId = transactionIdMatch ? transactionIdMatch[1] : `MPESA${Date.now()}`;
      
      // Extract date and time
      const dateMatch = smsText.match(/on\s+(\d{1,2}\/\d{1,2}\/\d{4})\s+at\s+(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
      const dateStr = dateMatch ? dateMatch[1] : '';
      const timeStr = dateMatch ? dateMatch[2] : '';
      
      // Extract amount
      const amountMatch = smsText.match(/Ksh[.\s]+([0-9,.]+)\s+paid/i);
      const amount = amountMatch ? this.parseAmount(amountMatch[1]) : 0;
      
      // Extract business name
      const businessMatch = smsText.match(/paid\s+to\s+([^.]+)/i);
      const business = businessMatch ? businessMatch[1].trim() : '';
      
      // Extract balance
      const balanceMatch = smsText.match(/balance\s+is\s+Ksh[.\s]+([0-9,.]+)/i);
      const balance = balanceMatch ? this.parseAmount(balanceMatch[1]) : null;
      
      // Create transaction object
      const transaction = {
        transactionId,
        date: this.parseDateTime(dateStr, timeStr),
        type: 'PAYMENT',
        amount,
        balance,
        recipient: business,
        sender: '',
        description: `Paid to ${business}`,
        category: 'OTHER', // Will be categorized by AI later
        mpesaReference: transactionId
      };
      
      return {
        success: true,
        transaction
      };
    } catch (error) {
      console.error('Error extracting business payment transaction:', error);
      return {
        success: false,
        error: {
          message: 'Failed to extract business payment transaction',
          details: error.message,
          code: 'EXTRACTION_ERROR'
        }
      };
    }
  }
  
  /**
   * Extract transaction from withdrawal SMS
   * @param {string} smsText - SMS message text
   * @returns {Object} Extraction result with transaction
   */
  extractWithdrawalTransaction(smsText) {
    // Implementation for withdrawal SMS format
    // Similar to other extraction methods
    try {
      // Example format: "MPESA XXXX Confirmed. You have withdrawn Ksh.AMOUNT from AGENT NAME on DD/MM/YYYY at HH:MM AM/PM. New M-PESA balance is Ksh.BALANCE. Transaction cost, Ksh.COST."
      
      // Extract transaction ID
      const transactionIdMatch = smsText.match(/MPESA\s+([A-Z0-9]+)/i);
      const transactionId = transactionIdMatch ? transactionIdMatch[1] : `MPESA${Date.now()}`;
      
      // Extract date and time
      const dateMatch = smsText.match(/on\s+(\d{1,2}\/\d{1,2}\/\d{4})\s+at\s+(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
      const dateStr = dateMatch ? dateMatch[1] : '';
      const timeStr = dateMatch ? dateMatch[2] : '';
      
      // Extract amount
      const amountMatch = smsText.match(/withdrawn\s+Ksh[.\s]+([0-9,.]+)/i);
      const amount = amountMatch ? this.parseAmount(amountMatch[1]) : 0;
      
      // Extract agent
      const agentMatch = smsText.match(/from\s+([^.]+)/i);
      const agent = agentMatch ? agentMatch[1].trim() : '';
      
      // Extract balance
      const balanceMatch = smsText.match(/balance\s+is\s+Ksh[.\s]+([0-9,.]+)/i);
      const balance = balanceMatch ? this.parseAmount(balanceMatch[1]) : null;
      
      // Create transaction object
      const transaction = {
        transactionId,
        date: this.parseDateTime(dateStr, timeStr),
        type: 'WITHDRAWAL',
        amount,
        balance,
        recipient: agent,
        sender: '',
        description: `Withdrawal from ${agent}`,
        category: 'OTHER', // Will be categorized by AI later
        mpesaReference: transactionId
      };
      
      return {
        success: true,
        transaction
      };
    } catch (error) {
      console.error('Error extracting withdrawal transaction:', error);
      return {
        success: false,
        error: {
          message: 'Failed to extract withdrawal transaction',
          details: error.message,
          code: 'EXTRACTION_ERROR'
        }
      };
    }
  }
  
  /**
   * Extract transaction from airtime purchase SMS
   * @param {string} smsText - SMS message text
   * @returns {Object} Extraction result with transaction
   */
  extractAirtimeTransaction(smsText) {
    // Implementation for airtime purchase SMS format
    // Similar to other extraction methods
    try {
      // Example format: "MPESA XXXX Confirmed. You bought Ksh.AMOUNT of airtime on DD/MM/YYYY at HH:MM AM/PM. New M-PESA balance is Ksh.BALANCE. Transaction cost, Ksh.0.00."
      
      // Extract transaction ID
      const transactionIdMatch = smsText.match(/MPESA\s+([A-Z0-9]+)/i);
      const transactionId = transactionIdMatch ? transactionIdMatch[1] : `MPESA${Date.now()}`;
      
      // Extract date and time
      const dateMatch = smsText.match(/on\s+(\d{1,2}\/\d{1,2}\/\d{4})\s+at\s+(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
      const dateStr = dateMatch ? dateMatch[1] : '';
      const timeStr = dateMatch ? dateMatch[2] : '';
      
      // Extract amount
      const amountMatch = smsText.match(/bought\s+Ksh[.\s]+([0-9,.]+)/i);
      const amount = amountMatch ? this.parseAmount(amountMatch[1]) : 0;
      
      // Extract balance
      const balanceMatch = smsText.match(/balance\s+is\s+Ksh[.\s]+([0-9,.]+)/i);
      const balance = balanceMatch ? this.parseAmount(balanceMatch[1]) : null;
      
      // Create transaction object
      const transaction = {
        transactionId,
        date: this.parseDateTime(dateStr, timeStr),
        type: 'PAYMENT',
        amount,
        balance,
        recipient: 'Airtime Purchase',
        sender: '',
        description: 'Airtime Purchase',
        category: 'UTILITIES', // Pre-categorize as utilities
        mpesaReference: transactionId
      };
      
      return {
        success: true,
        transaction
      };
    } catch (error) {
      console.error('Error extracting airtime transaction:', error);
      return {
        success: false,
        error: {
          message: 'Failed to extract airtime transaction',
          details: error.message,
          code: 'EXTRACTION_ERROR'
        }
      };
    }
  }
  
  /**
   * Parse amount string into number
   * @param {string} amountStr - Amount string from SMS
   * @returns {number} Parsed amount
   */
  parseAmount(amountStr) {
    try {
      // Remove commas and any non-numeric characters except decimal point
      const cleanedStr = amountStr.replace(/,/g, '').replace(/[^\d.]/g, '');
      return parseFloat(cleanedStr);
    } catch (error) {
      console.error('Error parsing amount:', error);
      return 0;
    }
  }
  
  /**
   * Parse date and time strings into Date object
   * @param {string} dateStr - Date string from SMS
   * @param {string} timeStr - Time string from SMS
   * @returns {Date} Parsed date and time
   */
  parseDateTime(dateStr, timeStr) {
    try {
      if (!dateStr) return new Date();
      
      // Parse date
      const dateParts = dateStr.split('/');
      if (dateParts.length !== 3) return new Date();
      
      const day = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // JS months are 0-indexed
      const year = parseInt(dateParts[2]);
      
      // Parse time
      let hours = 0;
      let minutes = 0;
      
      if (timeStr) {
        const isPM = timeStr.toLowerCase().includes('pm');
        const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
        
        if (timeMatch) {
          hours = parseInt(timeMatch[1]);
          minutes = parseInt(timeMatch[2]);
          
          // Convert to 24-hour format if PM
          if (isPM && hours < 12) {
            hours += 12;
          }
          
          // Handle 12 AM as 0 hours
          if (!isPM && hours === 12) {
            hours = 0;
          }
        }
      }
      
      return new Date(year, month, day, hours, minutes);
    } catch (error) {
      console.error('Error parsing date and time:', error);
      return new Date();
    }
  }
  
  /**
   * Calculate confidence score for a transaction
   * @param {Object} transaction - Transaction object
   * @param {string} smsText - Original SMS text
   * @returns {number} Confidence score between 0 and 1
   */
  calculateConfidence(transaction, smsText) {
    let score = 0.5; // Base score
    
    // Increase score based on available fields
    if (transaction.transactionId && transaction.transactionId.match(/[A-Z0-9]+/)) {
      score += 0.1; // Valid transaction ID
    }
    
    if (transaction.date instanceof Date && !isNaN(transaction.date)) {
      score += 0.1; // Valid date
    }
    
    if (typeof transaction.amount === 'number' && transaction.amount > 0) {
      score += 0.1; // Valid amount
    }
    
    if (typeof transaction.balance === 'number' && transaction.balance >= 0) {
      score += 0.1; // Valid balance
    }
    
    // Check if SMS contains key M-Pesa identifiers
    if (smsText.match(/MPESA|M-PESA/i)) {
      score += 0.1; // Contains M-Pesa identifier
    }
    
    // Cap score at 1.0
    return Math.min(score, 1.0);
  }
}

module.exports = new SmsParserService(); 