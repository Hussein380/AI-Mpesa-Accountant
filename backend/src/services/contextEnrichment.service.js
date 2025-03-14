const Transaction = require('../models/transaction.model');
const mongoose = require('mongoose');
const moment = require('moment');

/**
 * Context Enrichment Service
 * This service enriches the chat context with financial data for the Gemini AI
 */
class ContextEnrichmentService {
  /**
   * Get financial summary for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Financial summary
   */
  async getFinancialSummary(userId) {
    try {
      // Get current balance
      const balance = await this.getBalance(userId);
      
      // Get income/expense totals for current month
      const { totalIncome, totalExpenses } = await this.getMonthlyTotals(userId);
      
      // Get top spending categories
      const topCategories = await this.getTopCategories(userId);
      
      // Get spending trends
      const spendingTrends = await this.getSpendingTrends(userId);
      
      return { 
        balance, 
        totalIncome, 
        totalExpenses, 
        topCategories,
        spendingTrends
      };
    } catch (error) {
      console.error('Error getting financial summary:', error);
      return {
        balance: 0,
        totalIncome: 0,
        totalExpenses: 0,
        topCategories: [],
        spendingTrends: []
      };
    }
  }

  /**
   * Get user's current balance
   * @param {string} userId - User ID
   * @returns {Promise<number>} User's balance
   */
  async getBalance(userId) {
    try {
      // Find the most recent transaction with a balance
      const latestTransaction = await Transaction.findOne(
        { user: userId, balance: { $ne: null } }
      ).sort({ date: -1 });

      if (latestTransaction && latestTransaction.balance !== null) {
        return latestTransaction.balance;
      }

      // If no transaction with balance found, calculate from transactions
      const transactions = await Transaction.find({ user: userId }).sort({ date: 1 });
      
      // Calculate balance
      let balance = 0;
      transactions.forEach(transaction => {
        if (transaction.type === 'RECEIVED') {
          balance += transaction.amount;
        } else if (['SENT', 'PAYMENT', 'WITHDRAWAL'].includes(transaction.type)) {
          balance -= transaction.amount;
        }
      });
      
      return balance;
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  /**
   * Get monthly income and expense totals
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Monthly totals
   */
  async getMonthlyTotals(userId) {
    try {
      // Get current month's start and end dates
      const startOfMonth = moment().startOf('month').toDate();
      const endOfMonth = moment().endOf('month').toDate();
      
      // Get transactions for the current month
      const transactions = await Transaction.find({
        user: userId,
        date: { $gte: startOfMonth, $lte: endOfMonth }
      });
      
      // Calculate totals
      let totalIncome = 0;
      let totalExpenses = 0;
      
      transactions.forEach(transaction => {
        if (transaction.type === 'RECEIVED') {
          totalIncome += transaction.amount;
        } else if (['SENT', 'PAYMENT', 'WITHDRAWAL'].includes(transaction.type)) {
          totalExpenses += transaction.amount;
        }
      });
      
      return { totalIncome, totalExpenses };
    } catch (error) {
      console.error('Error getting monthly totals:', error);
      return { totalIncome: 0, totalExpenses: 0 };
    }
  }

  /**
   * Get top spending categories
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Top categories
   */
  async getTopCategories(userId) {
    try {
      // Get last 30 days
      const thirtyDaysAgo = moment().subtract(30, 'days').toDate();
      
      // Aggregate transactions by category
      const categoryAggregation = await Transaction.aggregate([
        { 
          $match: { 
            user: new mongoose.Types.ObjectId(userId),
            date: { $gte: thirtyDaysAgo },
            type: { $in: ['SENT', 'PAYMENT', 'WITHDRAWAL'] }
          } 
        },
        {
          $group: {
            _id: '$category',
            amount: { $sum: '$amount' }
          }
        },
        { $sort: { amount: -1 } },
        { $limit: 5 }
      ]);
      
      // Format results
      return categoryAggregation.map(cat => ({
        name: cat._id || 'OTHER',
        amount: cat.amount
      }));
    } catch (error) {
      console.error('Error getting top categories:', error);
      return [];
    }
  }

  /**
   * Get spending trends for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Spending trends
   */
  async getSpendingTrends(userId) {
    try {
      const startDate = moment().subtract(3, 'months').startOf('month').toDate();
      const endDate = moment().endOf('month').toDate();
      
      // Get expense transactions
      const expenseTransactions = await Transaction.find({
        user: userId,
        date: { $gte: startDate, $lte: endDate },
        type: { $in: ['SENT', 'PAYMENT', 'WITHDRAWAL'] }
      });
      
      // Group by month
      const monthlyTotals = {};
      expenseTransactions.forEach(t => {
        const monthKey = moment(t.date).format('YYYY-MM');
        monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + t.amount;
      });
      
      // Convert to array and sort
      const trends = Object.entries(monthlyTotals)
        .map(([month, amount]) => ({ 
          month: moment(month, 'YYYY-MM').format('MMM YYYY'),
          amount 
        }))
        .sort((a, b) => moment(a.month, 'MMM YYYY').diff(moment(b.month, 'MMM YYYY')));
      
      return trends;
    } catch (error) {
      console.error('Error getting spending trends:', error);
      return [];
    }
  }

  /**
   * Get transactions relevant to the user's query
   * @param {string} userId - User ID
   * @param {string} query - User's query
   * @returns {Promise<Array>} Relevant transactions
   */
  async getRelevantTransactions(userId, query) {
    try {
      // Extract time periods from query
      const timeframe = this.extractTimeframe(query);
      
      // Extract categories from query
      const categories = this.extractCategories(query);
      
      // Extract amount thresholds from query
      const amountThresholds = this.extractAmountThresholds(query);
      
      // Build MongoDB query
      const dbQuery = this.buildTransactionQuery(userId, { timeframe, categories, amountThresholds });
      
      // Get transactions
      const transactions = await Transaction.find(dbQuery)
        .sort({ date: -1 })
        .limit(10);
      
      return transactions;
    } catch (error) {
      console.error('Error getting relevant transactions:', error);
      return [];
    }
  }

  /**
   * Extract timeframe from a query
   * @param {string} query - User's query
   * @returns {Object} Date range
   */
  extractTimeframe(query) {
    const timeframePatterns = [
      { regex: /last\s+month/i, period: { months: -1 } },
      { regex: /this\s+month/i, period: { months: 0 } },
      { regex: /last\s+week/i, period: { weeks: -1 } },
      { regex: /this\s+week/i, period: { weeks: 0 } },
      { regex: /yesterday/i, period: { days: -1 } },
      { regex: /today/i, period: { days: 0 } },
      { regex: /last\s+(\d+)\s+days/i, period: (matches) => ({ days: -parseInt(matches[1]) }) },
      { regex: /last\s+(\d+)\s+months/i, period: (matches) => ({ months: -parseInt(matches[1]) }) },
      
      { regex: /since\s+(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)(?:\s+(\d{4}))?/i, period: this.extractCustomDate },
      { regex: /from\s+(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)(?:\s+(\d{4}))?/i, period: this.extractCustomDate },
      { regex: /in\s+([a-z]+)(?:\s+(\d{4}))?/i, period: this.extractMonthYear },
      { regex: /(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)(?:\s+(\d{4}))?/i, period: this.extractCustomDate },
      { regex: /q([1-4])(?:\s+(\d{4}))?/i, period: this.extractQuarter },
      { regex: /first\s+quarter(?:\s+(\d{4}))?/i, period: (matches) => this.extractQuarter(['', '1', matches[1]]) },
      { regex: /second\s+quarter(?:\s+(\d{4}))?/i, period: (matches) => this.extractQuarter(['', '2', matches[1]]) },
      { regex: /third\s+quarter(?:\s+(\d{4}))?/i, period: (matches) => this.extractQuarter(['', '3', matches[1]]) },
      { regex: /fourth\s+quarter(?:\s+(\d{4}))?/i, period: (matches) => this.extractQuarter(['', '4', matches[1]]) },
      { regex: /year\s+to\s+date/i, period: { yearToDate: true } },
      { regex: /ytd/i, period: { yearToDate: true } },
    ];
    
    for (const pattern of timeframePatterns) {
      const matches = query.match(pattern.regex);
      if (matches) {
        const period = typeof pattern.period === 'function' ? pattern.period(matches) : pattern.period;
        return this.calculateDateRange(period);
      }
    }
    
    // Default to last 30 days if no timeframe specified
    return this.calculateDateRange({ days: -30 });
  }

  /**
   * Extract custom date from matches
   * @param {Array} matches - Regex matches
   * @returns {Object} Period object
   */
  extractCustomDate(matches) {
    const day = parseInt(matches[1]);
    const monthName = matches[2].toLowerCase();
    const year = matches[3] ? parseInt(matches[3]) : moment().year();
    
    const monthMap = {
      'january': 0, 'jan': 0,
      'february': 1, 'feb': 1,
      'march': 2, 'mar': 2,
      'april': 3, 'apr': 3,
      'may': 4,
      'june': 5, 'jun': 5,
      'july': 6, 'jul': 6,
      'august': 7, 'aug': 7,
      'september': 8, 'sep': 8, 'sept': 8,
      'october': 9, 'oct': 9,
      'november': 10, 'nov': 10,
      'december': 11, 'dec': 11
    };
    
    const month = monthMap[monthName] || 0;
    
    return { 
      customDate: true,
      date: moment([year, month, day])
    };
  }

  /**
   * Extract month and year from matches
   * @param {Array} matches - Regex matches
   * @returns {Object} Period object
   */
  extractMonthYear(matches) {
    const monthName = matches[1].toLowerCase();
    const year = matches[2] ? parseInt(matches[2]) : moment().year();
    
    const monthMap = {
      'january': 0, 'jan': 0,
      'february': 1, 'feb': 1,
      'march': 2, 'mar': 2,
      'april': 3, 'apr': 3,
      'may': 4,
      'june': 5, 'jun': 5,
      'july': 6, 'jul': 6,
      'august': 7, 'aug': 7,
      'september': 8, 'sep': 8, 'sept': 8,
      'october': 9, 'oct': 9,
      'november': 10, 'nov': 10,
      'december': 11, 'dec': 11
    };
    
    const month = monthMap[monthName] || 0;
    
    return { 
      monthYear: true,
      month,
      year
    };
  }

  /**
   * Extract quarter from matches
   * @param {Array} matches - Regex matches
   * @returns {Object} Period object
   */
  extractQuarter(matches) {
    const quarter = parseInt(matches[1]);
    const year = matches[2] ? parseInt(matches[2]) : moment().year();
    
    return { 
      quarter,
      year
    };
  }

  /**
   * Calculate date range from period
   * @param {Object} period - Period object
   * @returns {Object} Date range
   */
  calculateDateRange(period) {
    let startDate = moment();
    let endDate = moment();
    
    if (period.days !== undefined) {
      startDate = startDate.add(period.days, 'days');
    } else if (period.weeks !== undefined) {
      startDate = startDate.add(period.weeks, 'weeks');
    } else if (period.months !== undefined) {
      startDate = startDate.add(period.months, 'months');
    } else if (period.customDate) {
      // For custom dates, set the start date to the specified date
      startDate = period.date;
      endDate = moment();
    } else if (period.monthYear) {
      // For month and year, set the start date to the first day of the month
      // and the end date to the last day of the month
      startDate = moment([period.year, period.month, 1]);
      endDate = moment(startDate).endOf('month');
    } else if (period.quarter) {
      // For quarters, set the start date to the first day of the quarter
      // and the end date to the last day of the quarter
      const quarterStartMonth = (period.quarter - 1) * 3;
      startDate = moment([period.year, quarterStartMonth, 1]);
      endDate = moment(startDate).add(3, 'months').subtract(1, 'day');
    } else if (period.yearToDate) {
      // For year to date, set the start date to the first day of the year
      startDate = moment().startOf('year');
      endDate = moment();
    }
    
    if (period.days === 0 || period.weeks === 0 || period.months === 0) {
      // For "this" periods, set to start of period
      if (period.days === 0) {
        startDate = startDate.startOf('day');
      } else if (period.weeks === 0) {
        startDate = startDate.startOf('week');
      } else if (period.months === 0) {
        startDate = startDate.startOf('month');
      }
      
      return {
        startDate: startDate.toDate(),
        endDate: moment().endOf('day').toDate()
      };
    } else {
      // For "last" periods, return range from start to now
      return {
        startDate: startDate.startOf('day').toDate(),
        endDate: endDate.endOf('day').toDate()
      };
    }
  }

  /**
   * Extract categories from a query
   * @param {string} query - User's query
   * @returns {Array} Categories
   */
  extractCategories(query) {
    const categoryMap = {
      'FOOD': [
        'food', 'restaurant', 'eating', 'lunch', 'dinner', 'breakfast', 
        'meal', 'cafe', 'coffee', 'snack', 'grocery', 'groceries', 'supermarket',
        'restaurant', 'takeout', 'take-out', 'take out', 'fast food'
      ],
      'TRANSPORT': [
        'transport', 'transportation', 'travel', 'uber', 'taxi', 'fare', 
        'bus', 'train', 'subway', 'metro', 'car', 'gas', 'petrol', 'fuel',
        'commute', 'ride', 'trip', 'journey', 'matatu', 'boda', 'boda boda'
      ],
      'UTILITIES': [
        'utilities', 'electricity', 'water', 'gas', 'internet', 'wifi', 
        'bill', 'bills', 'utility', 'phone', 'mobile', 'broadband', 'service',
        'subscription', 'power', 'energy', 'safaricom', 'airtel', 'telkom'
      ],
      'ENTERTAINMENT': [
        'entertainment', 'movies', 'cinema', 'concert', 'subscription', 
        'netflix', 'spotify', 'music', 'game', 'games', 'streaming', 'show',
        'theater', 'theatre', 'event', 'ticket', 'tickets', 'showmax', 'dstv'
      ],
      'SHOPPING': [
        'shopping', 'clothes', 'shoes', 'mall', 
        'purchase', 'buy', 'bought', 'store', 'shop', 'retail', 'clothing',
        'fashion', 'accessory', 'accessories', 'electronics', 'gadget', 'gadgets'
      ],
      'HEALTH': [
        'health', 'medical', 'hospital', 'doctor', 'medicine', 
        'pharmacy', 'clinic', 'healthcare', 'dental', 'dentist', 'prescription',
        'drug', 'drugs', 'treatment', 'therapy', 'checkup', 'check-up'
      ],
      'EDUCATION': [
        'education', 'school', 'college', 'university', 'tuition', 'books', 
        'course', 'class', 'training', 'workshop', 'seminar', 'tutorial',
        'lesson', 'learning', 'study', 'studies', 'fee', 'fees'
      ],
      'HOUSING': [
        'housing', 'rent', 'mortgage', 'apartment', 'house', 
        'accommodation', 'property', 'real estate', 'landlord', 'tenant',
        'lease', 'deposit', 'home', 'residence', 'flat'
      ],
      'PERSONAL': [
        'personal', 'grooming', 'haircut', 'salon', 'spa', 
        'beauty', 'cosmetics', 'makeup', 'skincare', 'self-care', 'self care',
        'hygiene', 'toiletries', 'barber'
      ],
      'SAVINGS': [
        'savings', 'investment', 'invest', 'stock', 'stocks', 
        'bond', 'bonds', 'fund', 'funds', 'retirement', 'pension',
        'portfolio', 'asset', 'assets', 'wealth', 'financial'
      ],
      'INCOME': [
        'income', 'salary', 'wage', 'wages', 'earnings', 
        'revenue', 'profit', 'gain', 'return', 'dividend', 'dividends',
        'interest', 'payment', 'payments', 'deposit', 'deposits'
      ],
      'DEBT': [
        'debt', 'loan', 'loans', 'credit', 'borrow', 'borrowed', 
        'financing', 'interest', 'repayment', 'installment', 'emi',
        'liability', 'liabilities', 'mortgage', 'overdraft'
      ],
    };
    
    const categories = [];
    const lowerQuery = query.toLowerCase();
    
    // First, check for direct category mentions
    for (const [category, keywords] of Object.entries(categoryMap)) {
      // Check if the category name itself is mentioned
      if (lowerQuery.includes(category.toLowerCase())) {
        categories.push(category);
        continue;
      }
      
      // Check for keywords
      for (const keyword of keywords) {
        // Use word boundary check to avoid partial matches
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (regex.test(lowerQuery)) {
          categories.push(category);
          break;
        }
      }
    }
    
    // Check for semantic relationships
    if (lowerQuery.includes('eat') || lowerQuery.includes('ate') || lowerQuery.includes('dining')) {
      if (!categories.includes('FOOD')) {
        categories.push('FOOD');
      }
    }
    
    if (lowerQuery.includes('drove') || lowerQuery.includes('driving') || lowerQuery.includes('ride')) {
      if (!categories.includes('TRANSPORT')) {
        categories.push('TRANSPORT');
      }
    }
    
    return categories;
  }

  /**
   * Extract amount thresholds from a query
   * @param {string} query - User's query
   * @returns {Object} Amount thresholds
   */
  extractAmountThresholds(query) {
    const thresholdPatterns = [
      { regex: /more than (?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)/i, type: 'min' },
      { regex: /less than (?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)/i, type: 'max' },
      { regex: /at least (?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)/i, type: 'min' },
      { regex: /at most (?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)/i, type: 'max' },
      { regex: /between (?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*) and (?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)/i, type: 'range' },
      
      { regex: /(?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)\s*(?:or|to)\s*(?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)/i, type: 'range' },
      { regex: /over (?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)/i, type: 'min' },
      { regex: /under (?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)/i, type: 'max' },
      { regex: /exceeding (?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)/i, type: 'min' },
      { regex: /above (?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)/i, type: 'min' },
      { regex: /below (?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)/i, type: 'max' },
      { regex: /greater than (?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)/i, type: 'min' },
      { regex: /smaller than (?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)/i, type: 'max' },
      { regex: /(?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)\s*\+/i, type: 'min' },
      { regex: /(?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)\s*and above/i, type: 'min' },
      { regex: /(?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)\s*and below/i, type: 'max' },
      { regex: /(?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)\s*or more/i, type: 'min' },
      { regex: /(?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)\s*or less/i, type: 'max' },
    ];
    
    for (const pattern of thresholdPatterns) {
      const matches = query.match(pattern.regex);
      if (matches) {
        if (pattern.type === 'range') {
          return {
            min: parseFloat(matches[1].replace(/,/g, '')),
            max: parseFloat(matches[2].replace(/,/g, ''))
          };
        } else if (pattern.type === 'min') {
          return { min: parseFloat(matches[1].replace(/,/g, '')) };
        } else if (pattern.type === 'max') {
          return { max: parseFloat(matches[1].replace(/,/g, '')) };
        }
      }
    }
    
    return {};
  }

  /**
   * Build transaction query
   * @param {string} userId - User ID
   * @param {Object} filters - Query filters
   * @returns {Object} MongoDB query
   */
  buildTransactionQuery(userId, filters = {}) {
    const query = { user: new mongoose.Types.ObjectId(userId) };
    
    // Add date range
    if (filters.timeframe && filters.timeframe.startDate && filters.timeframe.endDate) {
      query.date = {
        $gte: filters.timeframe.startDate,
        $lte: filters.timeframe.endDate
      };
    }
    
    // Add categories
    if (filters.categories && filters.categories.length > 0) {
      query.category = { $in: filters.categories };
    }
    
    // Add amount thresholds
    if (filters.amountThresholds) {
      // Only create the amount object if we have min or max values
      if (filters.amountThresholds.min !== undefined || filters.amountThresholds.max !== undefined) {
        query.amount = {};
        
        if (filters.amountThresholds.min !== undefined) {
          query.amount.$gte = filters.amountThresholds.min;
        }
        
        if (filters.amountThresholds.max !== undefined) {
          query.amount.$lte = filters.amountThresholds.max;
        }
      }
    }
    
    return query;
  }

  /**
   * Create a context string with financial data
   * @param {Object} summary - Financial summary
   * @param {Array} transactions - Relevant transactions
   * @param {string} query - User's query
   * @returns {string} Context string
   */
  createFinancialContext(summary, transactions, query) {
    let context = `
Financial Summary:
- Current Balance: KSh ${summary.balance}
- This Month's Income: KSh ${summary.totalIncome}
- This Month's Expenses: KSh ${summary.totalExpenses}
- Top Spending Categories: ${summary.topCategories.map(c => `${c.name} (KSh ${c.amount})`).join(', ')}

`;

    // Add visualization references if relevant
    const visualizationReferences = this.getVisualizationReferences(query, summary);
    if (visualizationReferences) {
      context += `${visualizationReferences}\n\n`;
    }

    // Add proactive insights if available
    const proactiveInsights = this.getProactiveInsights(summary, transactions);
    if (proactiveInsights) {
      context += `Proactive Insights:\n${proactiveInsights}\n\n`;
    }

    if (transactions.length > 0) {
      context += `Relevant Transactions:\n`;
      transactions.forEach(t => {
        context += `- ${this.formatDate(t.date)}: ${t.description} - KSh ${t.amount} (${t.category})\n`;
      });
    }
    
    return context;
  }

  /**
   * Format date for display
   * @param {Date} date - Date to format
   * @returns {string} Formatted date
   */
  formatDate(date) {
    return moment(date).format('DD MMM YYYY');
  }

  /**
   * Get visualization references based on the query
   * @param {string} query - User's query
   * @param {Object} summary - Financial summary
   * @returns {string} Visualization references
   */
  getVisualizationReferences(query, summary) {
    const lowerQuery = query.toLowerCase();
    
    // Check if query is about spending patterns or categories
    if (lowerQuery.includes('spend') || lowerQuery.includes('spending') || 
        lowerQuery.includes('expense') || lowerQuery.includes('expenses') ||
        lowerQuery.includes('category') || lowerQuery.includes('categories')) {
      
      return `Visualization Reference: The dashboard shows your spending patterns in the line chart. You can see how your expenses compare to your income over time.`;
    }
    
    // Check if query is about income or earnings
    if (lowerQuery.includes('income') || lowerQuery.includes('earn') || 
        lowerQuery.includes('salary') || lowerQuery.includes('revenue')) {
      
      return `Visualization Reference: The dashboard shows your income trend in the line chart. Your total income this month is KSh ${summary.totalIncome}.`;
    }
    
    // Check if query is about balance or savings
    if (lowerQuery.includes('balance') || lowerQuery.includes('saving') || 
        lowerQuery.includes('savings') || lowerQuery.includes('net worth')) {
      
      return `Visualization Reference: The dashboard shows your current balance of KSh ${summary.balance} in the summary card at the top.`;
    }
    
    // Check if query is about trends or history
    if (lowerQuery.includes('trend') || lowerQuery.includes('history') || 
        lowerQuery.includes('over time') || lowerQuery.includes('pattern')) {
      
      return `Visualization Reference: The dashboard shows your financial trends in the line chart, with income and expenses displayed over the past months.`;
    }
    
    return null;
  }

  /**
   * Get proactive insights based on financial data
   * @param {Object} summary - Financial summary
   * @param {Array} transactions - Relevant transactions
   * @returns {string} Proactive insights
   */
  getProactiveInsights(summary, transactions) {
    const insights = [];
    
    // Check for high spending in a category
    if (summary.topCategories && summary.topCategories.length > 0) {
      const topCategory = summary.topCategories[0];
      const topCategoryPercentage = (topCategory.amount / summary.totalExpenses) * 100;
      
      if (topCategoryPercentage > 40) {
        insights.push(`- High spending detected in ${topCategory.name} category (${topCategoryPercentage.toFixed(1)}% of total expenses)`);
      }
    }
    
    // Check for unusual transactions
    if (transactions && transactions.length > 0) {
      const averageAmount = transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;
      const unusualTransactions = transactions.filter(t => t.amount > averageAmount * 2);
      
      if (unusualTransactions.length > 0) {
        insights.push(`- ${unusualTransactions.length} unusually large transaction(s) detected in the selected period`);
      }
    }
    
    // Check for spending vs income ratio
    if (summary.totalIncome > 0) {
      const spendingRatio = (summary.totalExpenses / summary.totalIncome) * 100;
      
      if (spendingRatio > 90) {
        insights.push(`- Your spending is ${spendingRatio.toFixed(1)}% of your income this month, which is higher than recommended`);
      } else if (spendingRatio < 50) {
        insights.push(`- Your spending is only ${spendingRatio.toFixed(1)}% of your income this month, which is excellent for savings`);
      }
    }
    
    // Check for recurring transactions
    if (transactions && transactions.length > 0) {
      const descriptionCounts = {};
      transactions.forEach(t => {
        const key = t.description.toLowerCase();
        descriptionCounts[key] = (descriptionCounts[key] || 0) + 1;
      });
      
      const recurringTransactions = Object.entries(descriptionCounts)
        .filter(([_, count]) => count > 2)
        .map(([desc, _]) => desc);
      
      if (recurringTransactions.length > 0) {
        insights.push(`- ${recurringTransactions.length} recurring payment pattern(s) detected in your transactions`);
      }
    }
    
    return insights.length > 0 ? insights.join('\n') : null;
  }

  /**
   * Extract query intent from a query
   * @param {string} query - User's query
   * @returns {Promise<Object>} Query intent
   */
  async extractQueryIntent(query) {
    try {
      const lowerQuery = query.toLowerCase();
      
      // Check if query is about finances
      const financialKeywords = [
        'money', 'finance', 'financial', 'spend', 'spent', 'spending',
        'expense', 'expenses', 'income', 'balance', 'transaction', 'transactions',
        'payment', 'payments', 'mpesa', 'm-pesa', 'account', 'bank', 'banking',
        'budget', 'budgeting', 'save', 'saving', 'savings', 'cost', 'costs',
        'bill', 'bills', 'debt', 'loan', 'loans', 'credit', 'salary', 'wage',
        'wages', 'earnings', 'ksh', 'shilling', 'shillings', 'cash', 'paid',
        'pay', 'paying', 'purchase', 'bought', 'buy', 'buying', 'price',
        'category', 'categories', 'statement', 'statements', 'receipt', 'receipts'
      ];
      
      const isFinancialQuery = financialKeywords.some(keyword => 
        new RegExp(`\\b${keyword}\\b`, 'i').test(lowerQuery)
      );
      
      // Check query type
      const isBalanceQuery = /balance|how much (do|have) I (have|got)|what('s| is) my balance/i.test(lowerQuery);
      const isSpendingQuery = /spend|spent|spending|expense|expenses|cost|costs|paid|pay|paying|bought|buy|buying/i.test(lowerQuery);
      const isIncomeQuery = /income|earn|earning|earnings|salary|wage|wages|received|receive|receiving|deposit|deposits/i.test(lowerQuery);
      const isCategoryQuery = /category|categories|breakdown|distribution|allocation/i.test(lowerQuery);
      const isTrendQuery = /trend|history|pattern|over time|compare|comparison|month|monthly|week|weekly|year|yearly/i.test(lowerQuery);
      const isAdviceQuery = /advice|suggest|suggestion|recommend|recommendation|help|improve|improving|better|optimize|optimizing|save|saving|savings/i.test(lowerQuery);
      
      // Determine primary intent
      let primaryIntent = 'GENERAL';
      
      if (isBalanceQuery) {
        primaryIntent = 'BALANCE';
      } else if (isSpendingQuery) {
        primaryIntent = 'SPENDING';
      } else if (isIncomeQuery) {
        primaryIntent = 'INCOME';
      } else if (isCategoryQuery) {
        primaryIntent = 'CATEGORY';
      } else if (isTrendQuery) {
        primaryIntent = 'TREND';
      } else if (isAdviceQuery) {
        primaryIntent = 'ADVICE';
      }
      
      // Extract entities
      const timeframe = this.extractTimeframe(query);
      const categories = this.extractCategories(query);
      const amountThresholds = this.extractAmountThresholds(query);
      
      return {
        isFinancialQuery,
        primaryIntent,
        entities: {
          timeframe,
          categories,
          amountThresholds
        }
      };
    } catch (error) {
      console.error('Error extracting query intent:', error);
      return {
        isFinancialQuery: false,
        primaryIntent: 'GENERAL',
        entities: {}
      };
    }
  }
}

module.exports = new ContextEnrichmentService(); 