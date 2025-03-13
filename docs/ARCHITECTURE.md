# AI-Pesa Architecture

This document outlines the architecture of the AI-Pesa application, including component relationships and data flow.

## System Overview

AI-Pesa is a financial management application that helps users track and analyze their M-Pesa transactions. The application consists of a Next.js frontend and an Express.js backend with MongoDB for data storage.

## Architecture Diagram

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  Next.js        │ ──── │  Express.js     │ ──── │  MongoDB        │
│  Frontend       │      │  Backend API    │      │  Database       │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        │                        │                        │
        │                        │                        │
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Authentication │      │  Business Logic │      │  Data Models    │
│  - JWT          │      │  - Transaction  │      │  - User         │
│  - Protected    │      │    Processing   │      │  - Transaction  │
│    Routes       │      │  - AI Chat      │      │  - Message      │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                 │
                                 ▼
                         ┌─────────────────┐
                         │  Gemini AI      │
                         │  Integration    │
                         │  - Chat         │
                         │  - Analysis     │
                         └─────────────────┘
```

## Frontend Architecture

The frontend is built with Next.js and follows a component-based architecture.

### Key Components

1. **Authentication Context (`AuthContext.tsx`)**
   - Manages authentication state
   - Provides login, signup, and logout functions
   - Stores JWT token in localStorage

2. **Protected Route Component (`ProtectedRoute.tsx`)**
   - Restricts access to authenticated users
   - Allows trial access to AI chat for non-authenticated users
   - Redirects unauthenticated users to login page

3. **Dashboard Layout (`DashboardLayout.tsx`)**
   - Provides the layout structure for dashboard pages
   - Includes the sidebar navigation
   - Wraps content in the ProtectedRoute component

4. **Dashboard Sidebar (`DashboardSidebar.tsx`)**
   - Navigation menu for dashboard pages
   - Shows user profile information
   - Provides logout functionality

5. **Upload Page (`upload/page.tsx`)**
   - Handles file uploads (PDF statements)
   - Processes SMS text input
   - Displays transaction results

6. **AI Chat Page (`ai-chat/page.tsx`)**
   - Provides chat interface with AI assistant
   - Manages message history
   - Handles trial message limits for non-authenticated users

### Page Structure

```
/
├── auth
│   ├── login
│   └── signup
└── dashboard
    ├── index (home)
    ├── upload
    └── ai-chat
```

## Backend Architecture

The backend is built with Express.js and follows a modular architecture.

### Key Components

1. **Server (`index.ts`)**
   - Entry point for the application
   - Sets up middleware and routes
   - Connects to MongoDB

2. **Authentication Routes (`routes/auth.ts`)**
   - Handles user registration and login
   - Generates JWT tokens
   - Verifies user credentials

3. **Chat Routes (`routes/chat.ts`)**
   - Processes user messages
   - Generates AI responses
   - Manages message history and limits

4. **Transaction Routes (`routes/transactions.ts`)**
   - Handles statement uploads
   - Processes SMS messages
   - Retrieves transaction history

5. **Middleware**
   - Authentication middleware
   - Error handling middleware
   - Request logging middleware

6. **Gemini AI Service**
   - Handles communication with Google's Gemini AI
   - Processes natural language queries
   - Analyzes transaction data
   - Categorizes transactions

### API Structure

```
/api
├── auth
│   ├── register
│   └── login
├── users
│   └── me
├── chat
│   ├── message
│   └── history
├── statements
│   ├── upload
│   └── process-sms
└── transactions
    ├── /
    ├── /:id
    └── /categorize
```

## Data Flow

1. **Authentication Flow**
   - User enters credentials on login/signup page
   - Frontend sends request to backend auth routes
   - Backend validates credentials and generates JWT token
   - Frontend stores token in localStorage
   - Protected routes check for valid token

2. **Transaction Upload Flow**
   - User uploads statement or enters SMS text
   - Frontend sends data to backend
   - Backend processes and extracts transactions
   - Transactions are stored in MongoDB
   - Results are returned to frontend for display

3. **AI Chat Flow**
   - User sends message in chat interface
   - Frontend checks authentication status
   - For non-authenticated users, message count is checked
   - Message is sent to backend
   - Backend retrieves relevant transaction data
   - Backend sends message and context to Gemini AI
   - Gemini AI generates response
   - Response is returned to frontend and displayed
   - Message history is updated

## Security Considerations

1. **Authentication**
   - JWT tokens for secure authentication
   - Password hashing with bcrypt
   - Protected routes for authenticated content

2. **Data Protection**
   - User data is associated with user accounts
   - Transactions are only accessible to their owners
   - Sensitive data is not exposed in API responses

3. **Rate Limiting**
   - Message limits for non-authenticated users
   - API rate limiting to prevent abuse

## Scalability Considerations

1. **Database Indexing**
   - Indexes on frequently queried fields
   - Efficient query patterns

2. **Stateless Backend**
   - JWT-based authentication allows for horizontal scaling
   - No session state stored on the server

3. **Component Separation**
   - Clear separation of concerns
   - Modular architecture allows for independent scaling

## Future Architecture Enhancements

1. **Microservices**
   - Split backend into separate services for auth, transactions, and chat
   - Use API gateway for routing

2. **Real-time Updates**
   - Implement WebSockets for real-time chat and notifications
   - Add push notifications for mobile

3. **Caching Layer**
   - Add Redis for caching frequently accessed data
   - Implement query result caching

4. **Advanced Analytics**
   - Add dedicated analytics service
   - Implement data warehousing for historical analysis 