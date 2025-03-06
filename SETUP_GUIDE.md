# AI-Pesa Setup Guide

This guide provides instructions for setting up and running the AI-Pesa application.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Project Structure

The project consists of two main parts:
- `frontend`: Next.js application
- `backend`: Express.js API server

## Environment Variables

### Backend (.env file in backend directory)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-pesa
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

### Frontend (.env.local file in frontend directory)

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the environment variables listed above.

4. Start the development server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file with the environment variables listed above.

4. Start the development server:
   ```
   npm run dev
   ```

## Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. In a separate terminal, start the frontend:
   ```
   cd frontend
   npm run dev
   ```

3. Access the application at `http://localhost:3000`

## Authentication

The application uses JWT (JSON Web Tokens) for authentication. When a user registers or logs in, a token is generated and stored in localStorage. This token is included in the Authorization header for authenticated API requests.

## Database

The application uses MongoDB to store user data, transactions, and chat messages. Make sure MongoDB is running before starting the application.

## Features

### User Registration and Login

Users can register with a name, email, and password. After registration, they can log in with their email and password.

### Dashboard

The dashboard displays a summary of the user's financial data, including recent transactions, income, and expenses.

### Upload Statements

Users can upload M-Pesa statements (PDF) or paste M-Pesa SMS messages to import their transaction data.

### AI Chat

Users can chat with an AI assistant to get insights about their financial data. Non-authenticated users have a limited number of messages they can send.

## Deployment

### Backend Deployment

1. Build the backend:
   ```
   cd backend
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

### Frontend Deployment

1. Build the frontend:
   ```
   cd frontend
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**: Make sure MongoDB is running and the connection string in the `.env` file is correct.

2. **JWT Secret**: Ensure that the JWT_SECRET in the `.env` file is set and is a strong, unique string.

3. **CORS Issues**: If you're experiencing CORS issues, check that the frontend is making requests to the correct backend URL.

4. **Authentication Issues**: If authentication is not working, check that the JWT token is being properly stored in localStorage and included in API requests.

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Documentation](https://jwt.io/introduction) 