# AI-Pesa API Reference

This document provides a reference for all API endpoints used in the AI-Pesa application.

## Authentication Endpoints

### Register User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "securePassword123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User registered successfully",
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com"
    }
  }
  ```

### Login User
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Login successful",
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com"
    }
  }
  ```

### Get Current User
- **URL**: `/api/users/me`
- **Method**: `GET`
- **Headers**: 
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Response**:
  ```json
  {
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com"
    }
  }
  ```

## Chat Endpoints

### Send Message
- **URL**: `/api/chat/message`
- **Method**: `POST`
- **Headers**: (Optional)
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Body**:
  ```json
  {
    "message": "How much did I spend on food last month?",
    "sessionId": "session_id" // Optional
  }
  ```
- **Response**:
  ```json
  {
    "message": "AI response here",
    "sessionId": "session_id",
    "limitReached": false
  }
  ```

### Get Chat History
- **URL**: `/api/chat/history`
- **Method**: `GET`
- **Headers**: 
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Response**:
  ```json
  {
    "messages": [
      {
        "id": "message_id",
        "content": "User message",
        "role": "user",
        "timestamp": "2023-03-05T12:00:00Z"
      },
      {
        "id": "message_id",
        "content": "AI response",
        "role": "assistant",
        "timestamp": "2023-03-05T12:00:05Z"
      }
    ]
  }
  ```

## Transaction Endpoints

### Upload Statement
- **URL**: `/api/statements/upload`
- **Method**: `POST`
- **Headers**: 
  ```
  Authorization: Bearer jwt_token_here
  Content-Type: multipart/form-data
  ```
- **Body**:
  ```
  file: [PDF file]
  name: "March 2023 Statement"
  startDate: "2023-03-01"
  endDate: "2023-03-31"
  ```
- **Response**:
  ```json
  {
    "message": "Statement uploaded successfully",
    "statement": {
      "id": "statement_id",
      "name": "March 2023 Statement",
      "startDate": "2023-03-01T00:00:00Z",
      "endDate": "2023-03-31T23:59:59Z"
    }
  }
  ```

### Process SMS
- **URL**: `/api/statements/process-sms`
- **Method**: `POST`
- **Headers**: 
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Body**:
  ```json
  {
    "smsText": "M-PESA message content here"
  }
  ```
- **Response**:
  ```json
  {
    "message": "SMS processed successfully",
    "transactions": [
      {
        "transactionId": "transaction_id",
        "date": "2023-03-01T12:00:00Z",
        "type": "SENT",
        "amount": 1000,
        "recipient": "John Doe",
        "description": "Payment for services"
      }
    ],
    "stats": {
      "income": 5000,
      "expenses": 3000,
      "count": 10
    }
  }
  ```

### Get Transactions
- **URL**: `/api/transactions`
- **Method**: `GET`
- **Headers**: 
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Query Parameters**:
  ```
  page: 1
  limit: 10
  startDate: 2023-03-01
  endDate: 2023-03-31
  ```
- **Response**:
  ```json
  {
    "transactions": [
      {
        "transactionId": "transaction_id",
        "date": "2023-03-01T12:00:00Z",
        "type": "SENT",
        "amount": 1000,
        "recipient": "John Doe",
        "description": "Payment for services",
        "category": "UTILITIES"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "pages": 3
    }
  }
  ```

## AI Analysis Endpoints

### Analyze Statement
- **URL**: `/api/ai/analyze-statement`
- **Method**: `POST`
- **Headers**: 
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Body**:
  ```json
  {
    "statementId": "statement_id"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Statement analyzed successfully",
    "insights": {
      "totalIncome": 45000,
      "totalExpenses": 32500,
      "balance": 12500,
      "topCategories": [
        { "name": "Food", "amount": 8500 },
        { "name": "Transport", "amount": 6200 },
        { "name": "Entertainment", "amount": 4800 },
        { "name": "Utilities", "amount": 3500 },
        { "name": "Shopping", "amount": 2800 }
      ],
      "unusualTransactions": [
        { "id": "transaction_id", "reason": "Unusually large amount" }
      ],
      "savingTips": [
        "Reduce spending on entertainment by 20% to save KSh 960 per month",
        "Consider using public transport more often to save on transport costs"
      ],
      "healthSummary": "Your financial health is good. You're saving 27% of your income."
    }
  }
  ```

### Categorize Transactions
- **URL**: `/api/ai/categorize-transactions`
- **Method**: `POST`
- **Headers**: 
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Body**:
  ```json
  {
    "transactionIds": ["transaction_id_1", "transaction_id_2"]
  }
  ```
- **Response**:
  ```json
  {
    "message": "Transactions categorized successfully",
    "results": [
      {
        "transactionId": "transaction_id_1",
        "category": "FOOD"
      },
      {
        "transactionId": "transaction_id_2",
        "category": "TRANSPORT"
      }
    ]
  }
  ```

## Important Notes

1. All authenticated endpoints require a valid JWT token in the Authorization header
2. The chat endpoint allows a limited number of messages for non-authenticated users
3. Error responses follow this format:
   ```json
   {
     "message": "Error message here"
   }
   ```
4. All dates are in ISO format
5. Currency amounts are in KES (Kenyan Shillings)
6. AI analysis is powered by Google's Gemini AI 