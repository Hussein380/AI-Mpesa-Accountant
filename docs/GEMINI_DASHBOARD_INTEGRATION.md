# Gemini Dashboard Integration Plan

## Overview

This document outlines a comprehensive plan to integrate Gemini AI with the AI-Pesa dashboard data, enabling the AI to provide personalized financial advice based on the user's actual transaction history and spending patterns.

## Current Architecture

Currently, the AI-Pesa system has:

1. **Dashboard** - Displays financial summaries, recent transactions, and user profile information
2. **AI Chat** - Allows users to interact with Gemini AI, but without context of the user's actual financial data
3. **Transaction Processing** - Parses and stores M-Pesa transactions in MongoDB

## Integration Goals

1. Enable Gemini to access and analyze user transaction data
2. Provide personalized financial insights based on actual spending patterns
3. Allow the AI to reference specific transactions when answering questions
4. Maintain all existing functionality and UI design
5. Ensure data privacy and security

## Implementation Strategy

### 1. Context Enrichment Middleware

Create a middleware layer that enriches the chat context with relevant financial data before sending it to Gemini.

```
User Query → Context Enrichment → Gemini AI → Response → User
```

### 2. Data Selection Logic

Implement intelligent data selection to include only relevant transactions based on:
- Query keywords (e.g., "food", "last month")
- Time periods mentioned (e.g., "last week", "March")
- Transaction categories (e.g., "entertainment", "utilities")
- Amount thresholds (e.g., "large expenses", "recurring payments")

### 3. Backend Implementation

#### 3.1 Enhanced AI Controller

```javascript
// backend/src/controllers/ai.controller.js

exports.chatCompletion = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user ? req.user.id : null;
    
    // Existing authentication checks...
    
    // NEW: Enrich context with financial data if authenticated
    let enrichedContext = "";
    let relevantTransactions = [];
    
    if (userId) {
      // Get financial summary
      const financialSummary = await getFinancialSummary(userId);
      
      // Get relevant transactions based on the query
      relevantTransactions = await getRelevantTransactions(userId, message);
      
      // Create context string with financial data
      enrichedContext = createFinancialContext(financialSummary, relevantTransactions, message);
    }
    
    // Process the message with Gemini - now with enriched context
    const aiResponse = await geminiService.generateChatResponse(
      message, 
      chatHistory, 
      enrichedContext
    );
    
    // Rest of the existing function...
  } catch (error) {
    // Error handling...
  }
};
```

#### 3.2 Financial Context Helpers

```javascript
// backend/src/services/contextEnrichment.service.js

/**
 * Get financial summary for a user
 */
const getFinancialSummary = async (userId) => {
  // Get balance
  const balance = await getBalance(userId);
  
  // Get income/expense totals for current month
  const { totalIncome, totalExpenses } = await getMonthlyTotals(userId);
  
  // Get top spending categories
  const topCategories = await getTopCategories(userId);
  
  return { balance, totalIncome, totalExpenses, topCategories };
};

/**
 * Get transactions relevant to the user's query
 */
const getRelevantTransactions = async (userId, query) => {
  // Extract time periods from query
  const timeframe = extractTimeframe(query);
  
  // Extract categories from query
  const categories = extractCategories(query);
  
  // Extract amount thresholds from query
  const amountThresholds = extractAmountThresholds(query);
  
  // Build MongoDB query
  const dbQuery = buildTransactionQuery(userId, timeframe, categories, amountThresholds);
  
  // Get transactions
  return await Transaction.find(dbQuery).sort({ date: -1 }).limit(10);
};

/**
 * Create a context string with financial data
 */
const createFinancialContext = (summary, transactions, query) => {
  let context = `
Financial Summary:
- Current Balance: KSh ${summary.balance}
- This Month's Income: KSh ${summary.totalIncome}
- This Month's Expenses: KSh ${summary.totalExpenses}
- Top Spending Categories: ${summary.topCategories.map(c => `${c.name} (KSh ${c.amount})`).join(', ')}

`;

  if (transactions.length > 0) {
    context += `Relevant Transactions:\n`;
    transactions.forEach(t => {
      context += `- ${formatDate(t.date)}: ${t.description} - KSh ${t.amount} (${t.category})\n`;
    });
  }
  
  return context;
};
```

#### 3.3 Enhanced Gemini Service

```javascript
// backend/src/services/gemini.service.js

/**
 * Generate a chat response using Gemini with financial context
 */
async generateChatResponse(message, history = [], financialContext = "") {
  try {
    console.log('Generating chat response for message:', message);
    
    // Format history for Gemini
    let formattedHistory = [];
    
    if (Array.isArray(history) && history.length > 0) {
      formattedHistory = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));
    }

    // Create a chat session
    const chat = this.model.startChat({
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });
    
    // Prepare user message with system prompt and financial context
    let userMessage = message;
    
    if (formattedHistory.length === 0) {
      // If this is the first message, include system prompt and financial context
      userMessage = `${this.systemPrompt}\n\n`;
      
      if (financialContext) {
        userMessage += `Here is the user's financial information:\n${financialContext}\n\n`;
      }
      
      userMessage += `User message: ${message}`;
    } else if (financialContext) {
      // If not the first message but we have financial context, include it
      userMessage = `Based on the following financial information:\n${financialContext}\n\nUser question: ${message}`;
    }

    // Generate response
    const result = await chat.sendMessage(userMessage);
    const response = result.response.text();
    
    console.log('Generated response:', response.substring(0, 100) + '...');
    
    return response;
  } catch (error) {
    console.error('Gemini API error:', error);
    return "I'm sorry, I encountered an issue processing your request. Please try again later.";
  }
}
```

### 4. Frontend Implementation

#### 4.1 Enhanced Chat Context

```typescript
// frontend/lib/context/ChatContext.tsx

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const { isAuthenticated, user } = useAuth();
  
  // Fetch dashboard data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);
  
  const fetchDashboardData = async () => {
    try {
      // Fetch financial summary
      const summary = await fetchFinancialSummary();
      
      // Fetch recent transactions
      const transactions = await fetchTransactions({ limit: 20 });
      
      setDashboardData({ summary, transactions });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };
  
  // Rest of the existing context...
}
```

#### 4.2 Enhanced Send Message Function

```typescript
// frontend/app/dashboard/ai-chat/page.tsx

const handleSendMessage = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!input.trim()) return;

  if (!isAuthenticated && remainingFreeMessages <= 0) {
    router.push("/auth/login");
    return;
  }

  // Add user message
  await addMessage(input, "user");
  setInput("");
  setLoading(true);

  try {
    // Determine which endpoint to use based on authentication status
    const endpoint = isAuthenticated
      ? getEndpoint('ai/chat')
      : getEndpoint('ai/free-chat');

    // Create request with authentication in one atomic operation
    const requestConfig = createAuthenticatedRequest('POST', {
      message: input,
      previousMessages: messages.map(m => ({ role: m.role, content: m.content })),
      sessionId: localStorage.getItem('chatSessionId') || undefined,
      // No need to send dashboard data - the backend will fetch it
    });

    // Make API call to backend
    const response = await fetch(endpoint, requestConfig);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response:', data);

    // Save session ID if provided
    if (data.data && data.data.sessionId && data.data.sessionId !== 'free-session') {
      localStorage.setItem('chatSessionId', data.data.sessionId);
    }

    // Add AI response
    if (data.data && data.data.response) {
      await addMessage(data.data.response, "assistant");
    } else {
      console.error('Invalid response format:', data);
      await addMessage("Sorry, I received an invalid response format. Please try again.", "assistant");
    }
  } catch (error) {
    console.error('Error sending message:', error);
    await addMessage("Sorry, I'm having trouble connecting to the server. Please try again later.", "assistant");
  } finally {
    setLoading(false);
  }
};
```

### 5. Natural Language Processing Utilities

```javascript
// backend/src/utils/nlp.utils.js

/**
 * Extract timeframe from a query
 */
const extractTimeframe = (query) => {
  const timeframePatterns = [
    { regex: /last\s+month/i, period: { months: -1 } },
    { regex: /this\s+month/i, period: { months: 0 } },
    { regex: /last\s+week/i, period: { weeks: -1 } },
    { regex: /this\s+week/i, period: { weeks: 0 } },
    { regex: /yesterday/i, period: { days: -1 } },
    { regex: /today/i, period: { days: 0 } },
    { regex: /last\s+(\d+)\s+days/i, period: (matches) => ({ days: -parseInt(matches[1]) }) },
    { regex: /last\s+(\d+)\s+months/i, period: (matches) => ({ months: -parseInt(matches[1]) }) },
    // Add more patterns as needed
  ];
  
  for (const pattern of timeframePatterns) {
    const matches = query.match(pattern.regex);
    if (matches) {
      const period = typeof pattern.period === 'function' ? pattern.period(matches) : pattern.period;
      return calculateDateRange(period);
    }
  }
  
  // Default to last 30 days if no timeframe specified
  return calculateDateRange({ days: -30 });
};

/**
 * Extract categories from a query
 */
const extractCategories = (query) => {
  const categoryMap = {
    'food': ['food', 'restaurant', 'eating', 'lunch', 'dinner', 'breakfast'],
    'transport': ['transport', 'transportation', 'travel', 'uber', 'taxi', 'fare'],
    'utilities': ['utilities', 'electricity', 'water', 'gas', 'internet', 'wifi'],
    'entertainment': ['entertainment', 'movies', 'cinema', 'concert', 'subscription'],
    'shopping': ['shopping', 'clothes', 'shoes', 'mall'],
    'health': ['health', 'medical', 'hospital', 'doctor', 'medicine'],
    'education': ['education', 'school', 'college', 'university', 'tuition', 'books'],
    // Add more categories as needed
  };
  
  const categories = [];
  
  for (const [category, keywords] of Object.entries(categoryMap)) {
    for (const keyword of keywords) {
      if (query.toLowerCase().includes(keyword)) {
        categories.push(category);
        break;
      }
    }
  }
  
  return categories;
};

/**
 * Extract amount thresholds from a query
 */
const extractAmountThresholds = (query) => {
  const thresholdPatterns = [
    { regex: /more than (?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)/i, type: 'min' },
    { regex: /less than (?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)/i, type: 'max' },
    { regex: /at least (?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)/i, type: 'min' },
    { regex: /at most (?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)/i, type: 'max' },
    { regex: /between (?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*) and (?:KSh|Ksh|ksh|KES|kes|)\s*(\d+[,\d]*)/i, type: 'range' },
    // Add more patterns as needed
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
};
```

### 6. Enhanced System Prompt

```javascript
// backend/src/services/gemini.service.js

constructor() {
  // ...existing code...
  
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
```

## Data Privacy and Security Considerations

1. **Data Minimization**: Only send relevant transaction data to Gemini, not the entire transaction history
2. **No Sensitive Data**: Ensure no sensitive personal identifiers are included in the context
3. **User Consent**: Add a clear notification that the AI has access to financial data
4. **Opt-Out Option**: Allow users to disable the enhanced context feature
5. **Data Retention**: Ensure chat history with financial data is properly secured and has appropriate retention policies

## User Experience Enhancements

1. **Transparency Indicator**: Add a small indicator in the chat UI showing when the AI is using financial data
2. **Context Awareness**: Add a feature to show what financial data the AI is considering
3. **Suggested Questions**: Update suggested questions to reflect the AI's ability to analyze personal finances
4. **Feedback Mechanism**: Add a way for users to rate the helpfulness of AI responses

## Implementation Phases

### Phase 1: Core Integration
- Implement context enrichment middleware
- Enhance Gemini service to use financial context
- Add basic NLP utilities for query analysis

### Phase 2: Advanced Features (Completed)

In this phase, we've enhanced the AI's capabilities with more sophisticated NLP, visualization references, and proactive insights:

#### 1. Enhanced NLP for Query Understanding
- **Improved Time Period Extraction**: Added support for custom dates, month/year combinations, quarters, and year-to-date queries.
- **Expanded Category Recognition**: Enhanced category detection with more keywords and semantic relationships.
- **Advanced Amount Threshold Detection**: Added support for various ways users might express amount ranges and thresholds.
- **Query Intent Extraction**: Added a new system to determine the primary intent of financial queries (balance, spending, income, etc.).

#### 2. Visualization References
- **Dashboard Integration**: The AI now references specific visualizations on the dashboard that are relevant to the user's query.
- **Chart-Specific References**: References include specific charts (pie, bar, line) and summary cards that contain relevant information.
- **Visual Indicator**: Added a "Dashboard Reference" badge to messages that contain visualization references.
- **Line Chart Implementation**: Added a spending trends line chart to the dashboard that visualizes income and expenses over time, providing users with a clear view of their financial patterns.

#### 3. Proactive Insights
- **Spending Pattern Analysis**: The system now detects high spending in categories, unusual transactions, and spending vs. income ratios.
- **Recurring Payment Detection**: Identifies potential recurring payments in transaction history.
- **Contextual Financial Advice**: Provides tailored financial advice based on actual spending patterns.

#### Implementation Details:

##### Backend Changes:
1. **Context Enrichment Service**:
   - Added sophisticated NLP for better query understanding
   - Implemented visualization reference generation
   - Added proactive insights generation based on transaction patterns
   - Added query intent extraction

2. **Gemini Service**:
   - Enhanced system prompt to include visualization guidance
   - Added detection of visualization references in responses
   - Improved financial context detection

3. **AI Controller**:
   - Updated to support the new query intent endpoint
   - Enhanced chat completion to include visualization reference flags

##### Frontend Changes:
1. **AI Chat Interface**:
   - Added "Dashboard Reference" badge for messages with visualization references
   - Updated message handling to support the new response format

2. **Dashboard Visualization**:
   - Added a SpendingTrendsChart component using Recharts library
   - Implemented data processing to aggregate transactions by month
   - Created a responsive line chart showing income and expenses over time
   - Integrated the chart into the dashboard UI with smooth animations
   - Ensured the chart matches the application's dark theme

The implementation is designed to be seamless, maintaining all existing functionality while enhancing the AI's capabilities. The modular approach allows for phased implementation and easy maintenance.

### Phase 3: Predictive Analytics (Planned)

The next phase will focus on predictive analytics and more advanced financial insights:

#### 1. Spending Forecasts
- Predict future spending based on historical patterns
- Alert users to potential budget overruns before they happen
- Provide month-end projections based on current spending rates

#### 2. Savings Goals
- Recommend personalized savings targets based on income and spending patterns
- Track progress toward financial goals
- Suggest adjustments to spending in specific categories to meet savings goals

#### 3. Anomaly Detection
- Identify unusual spending patterns that may indicate fraud
- Alert users to significant deviations from normal behavior
- Provide comparative analysis against previous months/periods

#### 4. Financial Health Score
- Develop a proprietary financial health scoring system
- Provide actionable recommendations to improve financial health
- Track score improvements over time

## Testing Strategy

1. **Unit Tests**: Test each NLP utility and context generation function
2. **Integration Tests**: Test the end-to-end flow from query to response
3. **User Testing**: Conduct user testing with sample financial data
4. **Performance Testing**: Ensure the system remains responsive with large transaction histories

## Conclusion

This integration transforms the AI chat feature from a general assistant to a personalized financial advisor that understands each user's unique financial situation. By leveraging the existing transaction data, Gemini provides much more valuable and actionable insights without requiring any changes to the core UI or user experience.

With the completion of Phase 2, the AI-Pesa system now offers:
- Sophisticated natural language understanding for financial queries
- Personalized financial insights based on actual transaction data
- Visual indicators for personalized responses and dashboard references
- Proactive insights that highlight important financial patterns

The planned Phase 3 will further enhance these capabilities with predictive analytics, goal tracking, and anomaly detection, making AI-Pesa an even more powerful tool for financial management. 