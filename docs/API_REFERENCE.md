# AI-Pesa API Reference

This document provides a reference for all API endpoints used in the AI-Pesa application.

## API Response Format

All API responses follow a standardized format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful message",
  "data": {
    // Response data specific to the endpoint
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  },
  "statusCode": 400 // HTTP status code
}
```

## Authentication Endpoints

### Register User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "securePassword123",
    "phoneNumber": "254712345678" // Optional
  }
  ```
- **Success Response** (201 Created):
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "_id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "phoneNumber": "254712345678",
      "token": "jwt_token_here"
    }
  }
  ```
- **Error Response** (400 Bad Request):
  ```json
  {
    "success": false,
    "error": {
      "message": "User already exists with this email",
      "code": "USER_EXISTS"
    },
    "statusCode": 400
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
- **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "_id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "phoneNumber": "254712345678",
      "token": "jwt_token_here"
    }
  }
  ```
- **Error Response** (401 Unauthorized):
  ```json
  {
    "success": false,
    "error": {
      "message": "Invalid credentials",
      "code": "INVALID_CREDENTIALS"
    },
    "statusCode": 401
  }
  ```

## User Endpoints

### Get User Profile
- **URL**: `/api/users/profile`
- **Method**: `GET`
- **Headers**: 
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "User profile retrieved successfully",
    "data": {
      "_id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "phoneNumber": "254712345678"
    }
  }
  ```
- **Error Response** (401 Unauthorized):
  ```json
  {
    "success": false,
    "error": {
      "message": "User not authenticated",
      "code": "AUTH_ERROR"
    },
    "statusCode": 401
  }
  ```

## Transaction Endpoints

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
- **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Transactions retrieved successfully",
    "data": {
      "transactions": [
        {
          "_id": "transaction_id",
          "transactionId": "MPesa123456",
          "date": "2023-03-01T12:00:00Z",
          "type": "SENT",
          "amount": 1000,
          "balance": 5000,
          "recipient": "John Doe",
          "sender": "",
          "description": "Payment for services",
          "category": "UTILITIES",
          "source": "SMS",
          "createdAt": "2023-03-01T12:05:00Z",
          "mpesaReference": "ABC123"
        }
      ],
      "pagination": {
        "total": 25,
        "page": 1,
        "pages": 3
      }
    }
  }
  ```
- **Error Response** (500 Internal Server Error):
  ```json
  {
    "success": false,
    "error": {
      "message": "Failed to retrieve transactions",
      "code": "TRANSACTION_FETCH_ERROR"
    },
    "statusCode": 500
  }
  ```

### Create Transaction
- **URL**: `/api/transactions`
- **Method**: `POST`
- **Headers**: 
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Body**:
  ```json
  {
    "transactionId": "MPesa123456",
    "date": "2023-03-01T12:00:00Z",
    "type": "SENT",
    "amount": 1000,
    "balance": 5000,
    "recipient": "John Doe",
    "description": "Payment for services",
    "category": "UTILITIES",
    "source": "MANUAL"
  }
  ```
- **Success Response** (201 Created):
  ```json
  {
    "success": true,
    "message": "Transaction created successfully",
    "data": {
      "_id": "transaction_id",
      "transactionId": "MPesa123456",
      "date": "2023-03-01T12:00:00Z",
      "type": "SENT",
      "amount": 1000,
      "balance": 5000,
      "recipient": "John Doe",
      "description": "Payment for services",
      "category": "UTILITIES",
      "source": "MANUAL",
      "createdAt": "2023-03-01T12:05:00Z"
    }
  }
  ```

### Bulk Create Transactions
- **URL**: `/api/transactions/bulk`
- **Method**: `POST`
- **Headers**: 
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Body**:
  ```json
  {
    "transactions": [
      {
        "transactionId": "MPesa123456",
        "date": "2023-03-01T12:00:00Z",
        "type": "SENT",
        "amount": 1000,
        "balance": 5000,
        "recipient": "John Doe",
        "description": "Payment for services",
        "category": "UTILITIES",
        "source": "SMS"
      }
    ]
  }
  ```
- **Success Response** (201 Created):
  ```json
  {
    "success": true,
    "message": "Successfully created 1 transactions",
    "data": [
      {
        "_id": "transaction_id",
        "transactionId": "MPesa123456",
        "date": "2023-03-01T12:00:00Z",
        "type": "SENT",
        "amount": 1000,
        "balance": 5000,
        "recipient": "John Doe",
        "description": "Payment for services",
        "category": "UTILITIES",
        "source": "SMS",
        "createdAt": "2023-03-01T12:05:00Z"
      }
    ]
  }
  ```

### Get Balance
- **URL**: `/api/transactions/balance`
- **Method**: `GET`
- **Headers**: 
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Balance retrieved successfully",
    "data": {
      "balance": 5000
    }
  }
  ```
- **Error Response** (500 Internal Server Error):
  ```json
  {
    "success": false,
    "error": {
      "message": "Failed to retrieve balance",
      "code": "BALANCE_FETCH_ERROR"
    },
    "statusCode": 500
  }
  ```

## AI Chat Endpoints

### Chat Completion
- **URL**: `/api/ai/chat`
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
- **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "AI response generated successfully",
    "data": {
      "response": "Based on your transactions, you spent Ksh 8,500 on food last month.",
      "sessionId": "session_id"
    }
  }
  ```
- **Error Response** (403 Forbidden):
  ```json
  {
    "success": false,
    "error": {
      "message": "Free message limit reached. Please sign up to continue.",
      "code": "FREE_LIMIT_REACHED"
    },
    "statusCode": 403,
    "limitReached": true
  }
  ```

## Statement Endpoints

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
- **Success Response** (201 Created):
  ```json
  {
    "success": true,
    "message": "Statement uploaded successfully",
    "data": {
      "_id": "statement_id",
      "filename": "statement-123456.pdf",
      "originalFilename": "mpesa_statement_march.pdf",
      "fileSize": 125000,
      "mimeType": "application/pdf",
      "startDate": "2023-03-01T00:00:00Z",
      "endDate": "2023-03-31T23:59:59Z",
      "processed": false,
      "createdAt": "2023-04-01T10:15:00Z"
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