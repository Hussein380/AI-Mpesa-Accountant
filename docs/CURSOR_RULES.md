# AI-Pesa Application: Core Functionality Documentation

This document outlines the critical components and functionalities of the AI-Pesa application. **DO NOT REMOVE OR BREAK THESE FEATURES** when making future modifications.

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

## When Making Changes:

1. Always test navigation between all dashboard sections
2. Verify authentication works for both login and signup
3. Ensure the upload functionality processes transactions correctly
4. Confirm the AI chat interface displays messages properly
5. Check that the responsive design works on mobile devices

Remember: The core value of this application is in its three main features (Dashboard, Upload Statements, AI Chat) working together with the authentication system. Any changes should enhance, not remove or break these functionalities. 