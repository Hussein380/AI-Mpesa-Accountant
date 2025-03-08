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
    
    // System prompt to guide the AI's responses
    this.systemPrompt = `You are AI-Pesa, a helpful financial assistant for M-Pesa users in Kenya. 
        
Your primary goal is to help users understand their finances, provide financial advice, and answer questions about money management in Kenya.

When users ask general questions about finance, M-Pesa, or other topics, provide helpful and informative responses.

If users ask specific questions about their personal finances or transactions, you can provide general advice, but encourage them to upload their M-Pesa statements for more personalized insights.

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
   * Generate a chat response using Gemini
   * @param {string} message - The user's message
   * @param {Array} history - Previous conversation history
   * @returns {Promise<string>} - The AI response
   */
  async generateChatResponse(message, history = []) {
    try {
      console.log('Generating chat response for message:', message);
      
      // Format history for Gemini - ensure it's in the correct format
      const formattedHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Create a chat session with the system prompt included in the first message
      const chat = this.model.startChat({
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });
      
      // If there's no history, include the system prompt with the user's message
      let userMessage = message;
      if (formattedHistory.length === 0) {
        userMessage = `${this.systemPrompt}\n\nUser message: ${message}`;
      }

      // Generate response
      const result = await chat.sendMessage(userMessage);
      const response = result.response.text();
      
      console.log('Generated response:', response.substring(0, 100) + '...');
      return response;
    } catch (error) {
      console.error('Gemini API error:', error);
      // Return a fallback response in case of error
      return "I'm sorry, I encountered an issue processing your request. Please try again later.";
    }
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