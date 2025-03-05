# AI-Pesa Backend Implementation

This document outlines how the AI-Pesa backend will work with the existing frontend to create a complete M-Pesa transaction analysis system.

## How AI-Pesa Works

### 1️⃣ Users Access the Web Dashboard
- Users visit the AI-Pesa website (hosted on Vercel)
- They sign up or log in to access their personal financial dashboard
- Authentication is handled via JWT tokens

### 2️⃣ Users Upload M-Pesa Transactions
- Users can upload an M-Pesa statement PDF or copy & paste M-Pesa SMS messages
- The system extracts transaction data using text parsing
- Future enhancement: Direct M-Pesa API integration

### 3️⃣ AI Reads & Understands Transactions
- Ollama AI processes the uploaded data and extracts key details:
  - Date of transaction
  - Amount (money sent/received)
  - Type (Send Money, Receive Money, Withdrawal, Deposit, Till, Paybill)
  - Recipient/Sender Name
  
- Example transaction analysis:
  ```
  "You have received Ksh 5,000 from John on 01/03/2025."
  → AI detects: Received 5,000 Ksh → Income
  → AI categorizes: Transaction as Personal
  ```

### 4️⃣ AI Saves Transactions & Generates Reports
- All transactions are stored in MongoDB Atlas
- The system automatically calculates:
  - Total income & expenses per week/month
  - Spending categories breakdown
  - Cash flow trends and anomalies

### 5️⃣ Users View Their Financial Reports
- The dashboard displays financial summaries:
  - Income totals
  - Expense breakdowns
  - Balance tracking
  - Savings suggestions

### 6️⃣ Users Chat with AI for Insights
- Users can ask questions about their finances through the chat interface
- AI provides personalized financial advice and insights
- The system can generate alerts for unusual spending patterns

## Technical Implementation

### Tech Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **AI Engine**: Ollama (running locally or on a dedicated server)
- **Authentication**: JWT
- **File Processing**: PDF.js, text parsing libraries
- **API Communication**: RESTful endpoints + Socket.io for real-time chat

### Core Components

#### 1. Authentication Service
- User registration and login
- JWT token management
- User profile storage

#### 2. Transaction Processing Service
- PDF and text parsing for M-Pesa statements
- Transaction data extraction and normalization
- Data storage in MongoDB

#### 3. Ollama AI Integration
- Local Ollama instance running a financial analysis model
- Prompt engineering for transaction categorization
- Natural language processing for chat interactions

#### 4. Chat Interface
- Real-time communication between user and AI
- Transaction query capabilities
- Financial advice generation

#### 5. Reporting Engine
- Transaction aggregation and analysis
- Chart and graph data generation
- Financial insights calculation

### API Endpoints

```
# Authentication
POST /api/auth/register     # Create new user account
POST /api/auth/login        # User login
GET  /api/auth/profile      # Get user profile

# Transactions
POST /api/transactions/upload       # Upload M-Pesa statement
POST /api/transactions/parse-text   # Parse pasted M-Pesa messages
GET  /api/transactions              # Get user transactions
GET  /api/transactions/summary      # Get transaction summary

# Chat
POST /api/chat/message      # Send message to AI
GET  /api/chat/history      # Get chat history
```

### Database Schema

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  passwordHash: String,
  phoneNumber: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Transactions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  transactionId: String,
  type: String,  // "SEND", "RECEIVE", "WITHDRAWAL", "DEPOSIT", "TILL", "PAYBILL"
  amount: Number,
  balance: Number,
  counterparty: {
    name: String,
    phoneOrTill: String
  },
  category: String,  // AI-assigned category
  description: String,
  timestamp: Date,
  createdAt: Date
}
```

#### Chat Messages Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  sender: String,  // "USER" or "AI"
  message: String,
  relatedTransactions: [ObjectId],  // References to transactions
  timestamp: Date
}
```

## Ollama Implementation

### Model Selection
For financial analysis and chat, we recommend:
- Llama 3 (8B) - Good balance of performance and resource usage
- Mistral (7B) - Efficient for deployment on smaller servers

### Prompt Engineering for Transaction Analysis
```
You are AI-Pesa, an AI financial assistant. Analyze the following M-Pesa transaction:

[TRANSACTION_TEXT]

Extract and provide the following information:
1. Transaction type (Send Money, Receive Money, Withdrawal, Deposit, Till, Paybill)
2. Amount
3. Counterparty name
4. Date and time
5. Categorize this transaction (e.g., Food, Transport, Bills, Income, etc.)
```

### Prompt Engineering for Chat Interface
```
You are AI-Pesa, an AI financial assistant. The user has the following recent transactions:

[RECENT_TRANSACTIONS_SUMMARY]

Their current balance is [BALANCE].

Based on this information, respond to the user's question:
[USER_QUESTION]

Provide helpful, concise financial advice. If they ask about spending patterns, reference their actual transaction data.
```

## Implementation Steps

1. **Setup Project Structure**
   - Initialize Node.js project
   - Configure Express server
   - Set up MongoDB connection

2. **Build Authentication System**
   - Implement user registration and login
   - Set up JWT authentication
   - Create user profile management

3. **Create Transaction Processing**
   - Build PDF and text parsing functionality
   - Implement transaction extraction logic
   - Create database storage for transactions

4. **Integrate Ollama**
   - Set up Ollama with appropriate model
   - Create API for transaction analysis
   - Implement chat functionality

5. **Develop Reporting Features**
   - Create transaction aggregation logic
   - Implement financial summary generation
   - Build data visualization endpoints

6. **Connect with Frontend**
   - Ensure API endpoints match frontend expectations
   - Implement CORS for cross-origin requests
   - Test end-to-end functionality

## Deployment

### Development Environment
- Run Ollama locally for development
- Use MongoDB Atlas free tier for database
- Deploy Express server locally

### Production Environment
- Deploy Node.js backend to a cloud provider (Vercel, Render, or Railway)
- Set up a dedicated server for Ollama (or use a managed AI service)
- Configure environment variables for production

## Security Considerations
- Encrypt sensitive data
- Implement rate limiting
- Use HTTPS for all communications
- Sanitize user inputs
- Regular security audits

## Future Enhancements
- Direct M-Pesa API integration
- Email/SMS notifications
- Budget planning features
- Financial goal tracking
- Multi-language support

## Resources
- [Ollama GitHub Repository](https://github.com/ollama/ollama)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [M-Pesa API Documentation](https://developer.safaricom.co.ke/) 