const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * GeminiService - Handles all communication with Google's Gemini AI
 */
class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // Enhanced system prompt with financial context instructions
    this.systemPrompt = `You are AI-Pesa, a helpful financial assistant for M-Pesa users in Kenya.

Your primary goal is to help users understand their finances, provide financial advice, and answer questions about money management in Kenya.

IMPORTANT: You now have access to the user's actual financial data. When answering questions:
1. Reference specific transactions when relevant
2. Provide personalized advice based on their spending patterns
3. Calculate accurate totals from the provided transaction data
4. Identify spending trends and suggest improvements
5. Be specific about amounts, dates, and categories in your answers

When users ask general questions about finance, M-Pesa, or other topics, provide helpful and informative responses.

If users ask specific questions about their personal finances or transactions, use the provided financial context to give personalized answers.

Always be friendly, professional, and focus on providing value to the user.

IMPORTANT FORMATTING INSTRUCTIONS:
1. Use proper markdown formatting for your responses
2. Use headings (## or ###) for section titles
3. Use bullet points (* item) for lists
4. Use numbered lists (1. item) for sequential steps
5. Use bold (**text**) for emphasis on important points
6. Break your response into clear paragraphs with a blank line between them
7. Keep paragraphs short (2-3 sentences) for better readability
8. Use spacing consistently throughout your response
9. Don't overuse formatting - be judicious with bold, italics, etc.`;
  }

  /**
   * Generate system prompt
   * @param {Object} options - Options for the prompt
   * @returns {string} System prompt
   */
  generateSystemPrompt(options = {}) {
    const { financialContext } = options;
    
    let prompt = `You are AI-Pesa, an AI-powered financial assistant for M-Pesa users in Kenya.
Your goal is to help users understand their finances, analyze their spending patterns, and provide personalized financial advice.

Guidelines:
1. Be conversational, friendly, and professional.
2. Provide concise, accurate responses focused on financial information.
3. When analyzing transactions, focus on patterns, categories, and actionable insights.
4. Respect privacy and confidentiality of financial data.
5. If you don't know something, admit it rather than making up information.
6. Format currency as "KSh X" for Kenyan Shillings.
7. When referring to visualizations, be specific about which chart or element contains the information.
8. Highlight unusual patterns or concerning financial behaviors when detected.
9. Provide practical, culturally relevant financial advice for Kenyan users.
10. When suggesting financial improvements, offer specific, actionable steps.`;

    if (financialContext) {
      prompt += `\n\nHere is the user's financial context that you can reference in your response:
${financialContext}

When responding:
- Reference specific transactions or patterns from the provided data.
- Mention relevant visualizations that the user can check on their dashboard.
- Highlight any proactive insights that might be valuable to the user.
- Tailor your financial advice based on the user's actual spending patterns.
- If you reference a visualization, be specific about what the user should look for.`;
    }

    return prompt;
  }

  /**
   * Format messages for Gemini API
   * @param {Array} messages - Messages to format
   * @returns {Array} Formatted messages
   */
  formatMessagesForGemini(messages) {
    return messages.map(message => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{ text: message.content }]
    }));
  }

  /**
   * Generate chat completion
   * @param {Array} messages - Chat messages
   * @param {Object} options - Options for the completion
   * @returns {Promise<Object>} Chat completion
   */
  async generateChatCompletion(messages, options = {}) {
    try {
      const { financialContext } = options;
      
      // Generate system prompt
      const systemPrompt = this.generateSystemPrompt({ financialContext });
      
      // Add system message to the beginning of the messages array
      const messagesWithSystem = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];
      
      // Generate chat completion
      const result = await this.model.generateContent({
        contents: this.formatMessagesForGemini(messagesWithSystem),
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      });
      
      // Extract response text
      const responseText = result.response.text();
      
      // Check if financial context was used
      const hasFinancialContext = this.checkIfFinancialContextUsed(responseText, financialContext);
      
      // Check if visualization references were used
      const hasVisualizationReferences = this.checkIfVisualizationReferencesUsed(responseText);
      
      return { 
        text: responseText,
        hasFinancialContext,
        hasVisualizationReferences
      };
    } catch (error) {
      console.error('Error generating chat completion:', error);
      throw new Error('Failed to generate chat completion');
    }
  }

  /**
   * Check if financial context was used in the response
   * @param {string} response - Response text
   * @param {string} financialContext - Financial context
   * @returns {boolean} Whether financial context was used
   */
  checkIfFinancialContextUsed(response, financialContext) {
    if (!financialContext) return false;
    
    // Extract key information from financial context
    const contextLines = financialContext.split('\n');
    const keyPhrases = [];
    
    // Extract amounts and categories
    for (const line of contextLines) {
      // Match currency amounts
      const amountMatches = line.match(/KSh\s+(\d+(?:\.\d+)?)/g);
      if (amountMatches) {
        keyPhrases.push(...amountMatches);
      }
      
      // Match category names
      const categoryMatches = line.match(/\b(FOOD|TRANSPORT|UTILITIES|ENTERTAINMENT|SHOPPING|HEALTH|EDUCATION|HOUSING|PERSONAL|SAVINGS|INCOME|DEBT)\b/g);
      if (categoryMatches) {
        keyPhrases.push(...categoryMatches);
      }
      
      // Match transaction descriptions
      if (line.includes(':') && line.includes('-')) {
        const descriptionMatch = line.match(/:\s+(.+?)\s+-/);
        if (descriptionMatch && descriptionMatch[1]) {
          keyPhrases.push(descriptionMatch[1]);
        }
      }
    }
    
    // Check if any key phrases are used in the response
    const uniquePhrases = [...new Set(keyPhrases)];
    for (const phrase of uniquePhrases) {
      if (response.includes(phrase)) {
        return true;
      }
    }
    
    // Check for specific financial advice patterns
    const financialAdvicePatterns = [
      /you spent.*KSh/i,
      /your balance is/i,
      /your top spending category/i,
      /your spending on/i,
      /your income this month/i,
      /your expenses this month/i,
      /you have spent/i,
      /unusual transaction/i,
      /recurring payment/i,
      /spending ratio/i,
      /spending pattern/i
    ];
    
    for (const pattern of financialAdvicePatterns) {
      if (pattern.test(response)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if visualization references were used in the response
   * @param {string} response - Response text
   * @returns {boolean} Whether visualization references were used
   */
  checkIfVisualizationReferencesUsed(response) {
    const visualizationPatterns = [
      /dashboard shows/i,
      /you can see.*in the/i,
      /check the.*chart/i,
      /refer to the/i,
      /visualization/i,
      /pie chart/i,
      /bar chart/i,
      /line chart/i,
      /graph/i,
      /summary card/i,
      /dashboard/i
    ];
    
    for (const pattern of visualizationPatterns) {
      if (pattern.test(response)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Analyze transactions and provide insights
   * @param {Array} transactions - List of transactions to analyze
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeTransactions(transactions) {
    try {
      console.log('Analyzing transactions:', transactions.length);
      
      // Prepare transaction data for the model
      const transactionData = JSON.stringify(transactions);
      
      // Create a prompt for transaction analysis
      const prompt = `
        You are a financial analyst AI for M-Pesa transactions. 
        Analyze the following transactions and provide insights:
        1. Total income and expenses
        2. Top spending categories
        3. Unusual transactions
        4. Saving opportunities
        5. Financial health summary

        Transactions:
        ${transactionData}

        Provide the analysis in JSON format with the following structure:
        {
          "totalIncome": number,
          "totalExpenses": number,
          "balance": number,
          "topCategories": [{"name": string, "amount": number}],
          "unusualTransactions": [{"id": string, "reason": string}],
          "savingTips": [string],
          "healthSummary": string
        }
      `;

      // Generate analysis
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                        responseText.match(/```\n([\s\S]*?)\n```/) ||
                        [null, responseText];
      
      const jsonStr = jsonMatch[1];
      
      try {
        return JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        // Return a default structure if parsing fails
        return {
          totalIncome: 0,
          totalExpenses: 0,
          balance: 0,
          topCategories: [],
          unusualTransactions: [],
          savingTips: ["Unable to generate saving tips at this time."],
          healthSummary: "Unable to analyze financial health at this time."
        };
      }
    } catch (error) {
      console.error('Transaction analysis error:', error);
      // Return a default structure in case of error
      return {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        topCategories: [],
        unusualTransactions: [],
        savingTips: ["Unable to generate saving tips at this time."],
        healthSummary: "Unable to analyze financial health at this time."
      };
    }
  }

  /**
   * Categorize a transaction using AI
   * @param {Object} transaction - The transaction to categorize
   * @returns {Promise<string>} - The predicted category
   */
  async categorizeTransaction(transaction) {
    try {
      console.log('Categorizing transaction:', transaction.transactionId || 'new transaction');
      
      const prompt = `
        Categorize the following M-Pesa transaction into one of these categories:
        FOOD, TRANSPORT, UTILITIES, ENTERTAINMENT, SHOPPING, HEALTH, EDUCATION, INCOME, TRANSFER, OTHER

        Transaction:
        ${JSON.stringify(transaction)}

        Return only the category name, nothing else.
      `;

      const result = await this.model.generateContent(prompt);
      const category = result.response.text().trim();
      
      // Validate the category
      const validCategories = [
        'FOOD', 'TRANSPORT', 'UTILITIES', 'ENTERTAINMENT', 
        'SHOPPING', 'HEALTH', 'EDUCATION', 'INCOME', 'TRANSFER', 'OTHER'
      ];
      
      const finalCategory = validCategories.includes(category.toUpperCase()) 
        ? category.toUpperCase() 
        : 'OTHER';
        
      console.log('Categorized as:', finalCategory);
      return finalCategory;
    } catch (error) {
      console.error('Transaction categorization error:', error);
      return 'OTHER';
    }
  }
}

// Export a singleton instance
module.exports = new GeminiService(); 