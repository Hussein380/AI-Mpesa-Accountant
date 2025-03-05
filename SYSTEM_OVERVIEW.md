# AI-Pesa: Complete System Overview

This document provides a comprehensive overview of how the AI-Pesa system works, connecting the frontend and backend components.

## System Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  User Interface │◄────►│  Backend API    │◄────►│  Ollama AI      │
│  (Next.js)      │      │  (Express)      │      │  Engine         │
│                 │      │                 │      │                 │
└────────┬────────┘      └────────┬────────┘      └─────────────────┘
         │                        │
         │                        │
         │                        ▼
         │               ┌─────────────────┐
         └──────────────►│                 │
                         │  MongoDB Atlas  │
                         │  Database       │
                         │                 │
                         └─────────────────┘
```

## User Flow

### 1. User Registration & Login
- User visits the AI-Pesa website (deployed on Vercel)
- User creates an account or logs in
- Frontend sends credentials to backend API
- Backend validates and returns JWT token
- Frontend stores token for authenticated requests

### 2. Dashboard Access
- User is presented with the main dashboard
- Dashboard shows summary of financial data (if any)
- Options to upload M-Pesa statement or paste M-Pesa messages
- Chat interface to interact with AI

### 3. Transaction Upload Process
- User uploads M-Pesa statement PDF or pastes SMS messages
- Frontend sends data to backend API
- Backend processes the data:
  - Extracts transaction details
  - Sends to Ollama for analysis and categorization
  - Stores processed transactions in MongoDB
- Backend returns processed transaction data
- Frontend displays transaction summary and details

### 4. AI Chat Interaction
- User types a question about their finances in the chat interface
- Frontend sends message to backend API
- Backend:
  - Retrieves relevant transaction data
  - Constructs prompt for Ollama with transaction context
  - Gets AI response
  - Stores the conversation in MongoDB
- Backend returns AI response
- Frontend displays the response in the chat interface

### 5. Financial Reports & Insights
- User navigates to reports section
- Frontend requests financial summaries from backend
- Backend:
  - Aggregates transaction data
  - Calculates financial metrics
  - Generates insights using Ollama
- Backend returns report data
- Frontend displays visualizations and insights

## Component Integration

### Frontend (Next.js)
- **Landing Page**: Introduces AI-Pesa and its features
- **Authentication**: Handles user signup/login
- **Dashboard**: Displays financial overview
- **Transaction Upload**: Interface for uploading statements
- **Chat Interface**: Real-time communication with AI
- **Reports**: Visual representation of financial data

### Backend (Express)
- **Authentication API**: Handles user management
- **Transaction Processing**: Parses and stores transaction data
- **Ollama Integration**: Connects to AI engine for analysis
- **Chat API**: Manages conversation flow
- **Reporting API**: Generates financial summaries

### Database (MongoDB Atlas)
- Stores user profiles
- Maintains transaction records
- Preserves chat history
- Caches financial reports

### AI Engine (Ollama)
- Processes natural language
- Analyzes transaction patterns
- Categorizes financial activities
- Generates financial insights
- Provides conversational responses

## Data Flow Examples

### Example 1: Processing an M-Pesa Statement

1. User uploads M-Pesa statement PDF
2. Frontend sends file to `/api/transactions/upload` endpoint
3. Backend extracts text from PDF
4. Backend sends transaction text to Ollama for processing
5. Ollama identifies and categorizes each transaction
6. Backend stores processed transactions in MongoDB
7. Backend returns transaction summary to frontend
8. Frontend displays categorized transactions and summary

### Example 2: Chat Interaction

1. User asks: "How much did I spend on food last month?"
2. Frontend sends message to `/api/chat/message` endpoint
3. Backend retrieves user's food-related transactions for last month
4. Backend constructs prompt for Ollama with transaction data
5. Ollama generates response with spending analysis
6. Backend stores the conversation in chat history
7. Backend returns AI response to frontend
8. Frontend displays the response in chat interface

## Deployment Strategy

### Frontend Deployment (Vercel)
- Connect GitHub repository to Vercel
- Configure build settings:
  - Framework: Next.js
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install --legacy-peer-deps`
- Set environment variables:
  - `NEXT_PUBLIC_API_URL`: URL of deployed backend

### Backend Deployment (Options)
- **Render/Railway/Fly.io**:
  - Deploy Node.js Express application
  - Configure environment variables
  - Set up MongoDB Atlas connection
  - Configure Ollama integration

### Ollama Deployment
- **Self-hosted**: Run on dedicated server with GPU
- **Cloud VM**: Deploy on cloud provider with GPU support
- **Managed AI Service**: Alternative to self-hosting

## Security Considerations

- All API communications secured with HTTPS
- JWT authentication for all protected endpoints
- Input validation and sanitization
- Rate limiting to prevent abuse
- Secure storage of sensitive financial data
- Regular security audits

## Future Roadmap

### Phase 1: Core Functionality
- Basic authentication
- M-Pesa statement parsing
- Transaction categorization
- Simple chat interface

### Phase 2: Enhanced Features
- Improved AI analysis
- Advanced financial reporting
- Budget planning tools
- Email notifications

### Phase 3: Advanced Integration
- Direct M-Pesa API integration
- Mobile app development
- Multi-language support
- Financial goal tracking

## Getting Started for Developers

1. Clone the repository
2. Set up frontend:
   ```
   cd frontend
   npm install --legacy-peer-deps
   npm run dev
   ```

3. Set up backend:
   ```
   cd backend
   npm install
   npm run dev
   ```

4. Install and run Ollama:
   ```
   # Follow instructions at https://github.com/ollama/ollama
   ollama pull llama3:8b
   ollama run llama3:8b
   ```

5. Configure environment variables as needed

## Conclusion

The AI-Pesa system provides a seamless experience for users to manage their M-Pesa transactions with AI assistance. By combining a modern Next.js frontend with a robust Express backend and powerful Ollama AI engine, the system delivers valuable financial insights without requiring manual data entry or analysis. 