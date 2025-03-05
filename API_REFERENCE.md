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
    "message": "How much did I spend on food last month?"
  }
  ```
- **Response**:
  ```json
  {
    "message": "AI response here",
    "remainingMessages": 3
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
  ```
- **Response**:
  ```json
  {
    "message": "Statement processed successfully",
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
- **Response**: (Same as upload statement)

### Get Transactions
- **URL**: `/api/transactions`
- **Method**: `GET`
- **Headers**: 
  ```
  Authorization: Bearer jwt_token_here
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
        "description": "Payment for services"
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