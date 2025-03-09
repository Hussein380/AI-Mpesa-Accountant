# AI-Pesa Database Schema

This document outlines the database schema used in the AI-Pesa application. The application uses MongoDB as its database.

## User Model

The User model stores information about registered users.

```javascript
{
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

- `name`: The user's full name
- `email`: The user's email address (unique)
- `password`: Hashed password using bcrypt
- `phoneNumber`: The user's phone number (optional)
- `role`: User role for access control
- `createdAt`: Timestamp when the user was created

## Transaction Model

The Transaction model stores information about financial transactions parsed from statements or SMS.

```javascript
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  transactionId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['SENT', 'RECEIVED', 'PAYMENT', 'WITHDRAWAL', 'DEPOSIT', 'OTHER'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  balance: {
    type: Number,
    default: null
  },
  recipient: {
    type: String,
    default: ''
  },
  sender: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['FOOD', 'TRANSPORT', 'UTILITIES', 'ENTERTAINMENT', 'SHOPPING', 'HEALTH', 'EDUCATION', 'OTHER'],
    default: 'OTHER'
  },
  source: {
    type: String,
    enum: ['PDF', 'SMS', 'MANUAL', 'TEST'],
    default: 'MANUAL'
  },
  mpesaReference: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

- `user`: Reference to the User who owns this transaction
- `transactionId`: Unique identifier for the transaction
- `date`: Date and time when the transaction occurred
- `type`: Type of transaction (SENT, RECEIVED, etc.)
- `amount`: Amount of money involved in the transaction
- `balance`: Account balance after the transaction (if available)
- `recipient`: Name or phone number of the recipient (for outgoing transactions)
- `sender`: Name or phone number of the sender (for incoming transactions)
- `description`: Description or purpose of the transaction
- `category`: Category of the transaction for analysis purposes
- `source`: Source of the transaction data (PDF statement, SMS, manual entry, or test)
- `mpesaReference`: M-Pesa reference number for the transaction (if available)
- `createdAt`: Timestamp when the transaction was added to the database

## Statement Model

The Statement model stores information about uploaded M-Pesa statements.

```javascript
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  transactionCount: {
    type: Number,
    default: 0
  },
  processed: {
    type: Boolean,
    default: false
  },
  analysis: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

- `user`: Reference to the User who uploaded the statement
- `filename`: Name of the file stored on the server
- `originalFilename`: Original name of the uploaded file
- `fileSize`: Size of the file in bytes
- `mimeType`: MIME type of the file
- `startDate`: Start date of the statement period
- `endDate`: End date of the statement period
- `transactionCount`: Number of transactions in the statement
- `processed`: Whether the statement has been processed
- `analysis`: Object containing AI analysis results
- `createdAt`: Timestamp when the statement was uploaded

## ChatMessage Model

The ChatMessage model stores chat messages between users and the AI assistant.

```javascript
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

- `user`: Reference to the User who sent/received the message (null for non-authenticated users)
- `sessionId`: Unique identifier for the chat session
- `role`: Whether the message is from the user, the AI assistant, or a system message
- `content`: The text content of the message
- `createdAt`: When the message was sent

## MessageCount Model

The MessageCount model tracks the number of messages sent by non-authenticated users.

```javascript
{
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  count: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}
```

- `sessionId`: Unique identifier for the user's session
- `count`: Number of messages sent in this session
- `lastUpdated`: When the count was last updated

## Important Notes

1. All IDs in MongoDB are stored as ObjectId
2. Passwords are hashed before storage using bcrypt
3. Timestamps are stored in UTC
4. Foreign key relationships are maintained using MongoDB references
5. Indexes should be created on frequently queried fields (email, sessionId, user, date)
6. The Transaction model is designed to accommodate both M-Pesa statements and SMS messages
7. All API responses follow a standardized format defined in `apiResponse.js` 