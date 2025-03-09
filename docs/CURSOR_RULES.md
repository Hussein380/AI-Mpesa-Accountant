# AI-Pesa Application: Core Functionality Documentation

This document outlines the critical components and functionalities of the AI-Pesa application. **DO NOT REMOVE OR BREAK THESE FEATURES** when making future modifications.

## Technology Stack

### Frontend
- **Framework**: Next.js (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **API Communication**: Axios

### Backend
- **Framework**: Express.js
- **Language**: JavaScript/TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: Google's Gemini AI

### Development Tools
- **Package Manager**: npm
- **Version Control**: Git
- **Linting**: ESLint
- **Formatting**: Prettier

## Code Consistency Guidelines

1. **File Naming Conventions**:
   - React components: PascalCase (e.g., `TransactionList.tsx`)
   - Utility functions: camelCase (e.g., `formatCurrency.ts`)
   - API routes: kebab-case (e.g., `transaction-routes.js`)
   - Database models: PascalCase (e.g., `Transaction.js`)

2. **Import Order**:
   - React/Next.js imports
   - Third-party library imports
   - Local component imports
   - Utility/helper imports
   - Style imports

3. **TypeScript Usage**:
   - Use TypeScript for all new frontend code
   - Define interfaces for all props and state
   - Use proper type annotations for functions
   - Avoid using `any` type when possible

4. **API Response Format**:
   - All API responses must follow the standardized format defined in `apiResponse.js`
   - Success responses must include `success`, `message`, and `data` fields
   - Error responses must include `success`, `error`, and `statusCode` fields

5. **Model Consistency**:
   - Frontend interfaces must match backend MongoDB schemas
   - Use shared type definitions when possible
   - Follow the guidelines in the Model Consistency document

## Core Components

### 1. Dashboard Layout Structure
- **DashboardLayout** (`frontend/app/dashboard/layout.tsx`): Server component that provides metadata and wraps the dashboard with protection and layout components
- **DashboardLayoutClient** (`frontend/components/DashboardLayoutClient.tsx`): Client component that manages the sidebar state and responsive layout
- **DashboardSidebar** (`frontend/components/DashboardSidebar.tsx`): Navigation sidebar with links to Dashboard, Upload Statements, and AI Chat
- **DashboardProtection** (`frontend/app/dashboard/DashboardProtection.tsx`): Handles authentication protection for dashboard routes

### 2. Authentication System
- **AuthContext** (`frontend/lib/context/AuthContext.tsx`): Manages user authentication state, login, signup, and logout functions
- **ProtectedRoute** (`frontend/components/ProtectedRoute.tsx`): Component that restricts access to authenticated users
- **Login/Signup Pages**: Handle user registration and authentication

### 3. Main Features

#### Dashboard Home (`frontend/app/dashboard/page.tsx`)
- Financial summary cards (Income, Expenses, Balance)
- Recent transactions list
- User profile information with logout functionality
- "Get Started" prompt for new users

#### Upload Statements (`frontend/app/dashboard/upload/page.tsx`)
- File upload for M-Pesa statements
- SMS text input for M-Pesa messages
- Transaction parsing and visualization
- Transaction statistics

#### AI Chat (`frontend/app/dashboard/ai-chat/page.tsx`)
- Interactive chat interface with AI assistant
- Sample questions for quick access
- Message history display
- Trial message limit for non-authenticated users

## Authentication Flow

1. **User Registration**: 
   - Collects name, email, password
   - Validates password strength
   - Stores user in MongoDB
   - Issues JWT token

2. **User Login**:
   - Authenticates with email/password
   - Issues JWT token
   - Redirects to dashboard

3. **Protected Routes**:
   - Dashboard routes are protected
   - AI Chat allows limited trial access
   - Authentication state persists via localStorage

## Backend Integration

- **API Endpoints**: 
  - `/api/auth/register`: User registration
  - `/api/auth/login`: User authentication
  - `/api/users/me`: Get current user info
  - `/api/transactions`: Get user transactions
  - `/api/ai/chat`: Chat with AI assistant

## Gemini AI Integration

- **Service**: `backend/src/services/geminiService.js`
- **Environment Variables**: 
  - `GEMINI_API_KEY`: API key from Google AI Studio
  - `GEMINI_MODEL`: Model name (default: gemini-pro)
- **Features**:
  - Chat completion for user questions
  - Transaction analysis and categorization
  - Financial insights generation

## Critical UI Elements

1. **Dashboard Sidebar Navigation**:
   - Must include links to Dashboard, Upload Statements, and AI Chat
   - Must be responsive (collapsible on mobile)
   - Must highlight active route

2. **Transaction Display**:
   - Must show transaction date, type, details, and amount
   - Must format currency correctly
   - Must color-code transaction types (received/sent)

3. **AI Chat Interface**:
   - Must display message history
   - Must show remaining messages for non-authenticated users
   - Must provide sample questions

## DO NOT MODIFY OR REMOVE:

1. The sidebar navigation structure
2. The upload statements functionality
3. The AI chat interface
4. The authentication flow
5. The dashboard layout structure
6. The transaction display components
7. The standardized API response format
8. The Gemini AI integration

## When Making Changes:

1. Always test navigation between all dashboard sections
2. Verify authentication works for both login and signup
3. Ensure the upload functionality processes transactions correctly
4. Confirm the AI chat interface displays messages properly
5. Check that the responsive design works on mobile devices
6. Maintain consistency between frontend interfaces and backend models
7. Follow the established code style and naming conventions
8. Use TypeScript for all new frontend code

Remember: The core value of this application is in its three main features (Dashboard, Upload Statements, AI Chat) working together with the authentication system. Any changes should enhance, not remove or break these functionalities. 