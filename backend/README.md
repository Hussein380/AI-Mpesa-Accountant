# AI-Pesa Backend

This is the backend server for AI-Pesa, an AI-powered M-Pesa financial assistant that helps users analyze their M-Pesa statements and gain insights into their financial behavior.

## Features

- **User Authentication**: Register, login, and password reset functionality
- **Statement Management**: Upload, view, and delete M-Pesa statements
- **AI Analysis**: Analyze M-Pesa statements using AI to extract insights
- **Chat Interface**: Chat with AI to ask questions about financial data

## Tech Stack

- **Node.js & Express**: Server framework
- **MongoDB**: Database for storing user data and statements
- **Ollama**: Local AI model integration for statement analysis and chat
- **JWT**: Authentication mechanism
- **Multer**: File upload handling

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Ollama (for AI functionality)

## Getting Started

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
5. Update the `.env` file with your configuration

### Running the Server

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/profile` - Delete user account

### AI Chat

- `POST /api/ai/chat` - Chat with AI (authenticated)
- `POST /api/ai/free-chat` - Free chat with AI (limited to 3 messages)
- `POST /api/ai/analyze-statement` - Analyze M-Pesa statement

### Statement Management

- `POST /api/statements/upload` - Upload M-Pesa statement
- `GET /api/statements` - Get all statements for a user
- `GET /api/statements/:id` - Get a specific statement
- `DELETE /api/statements/:id` - Delete a statement

## Ollama Integration

This backend is designed to work with Ollama for AI functionality. Ollama allows you to run large language models locally.

To set up Ollama:

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull the Llama3 model:
   ```
   ollama pull llama3
   ```
3. Ensure Ollama is running when you start the backend

## Development

### Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── index.js        # Entry point
├── uploads/            # Uploaded files
├── .env                # Environment variables
├── .env.example        # Example environment variables
└── package.json        # Dependencies and scripts
```

### Database Models

- **User**: User account information
- **Statement**: M-Pesa statement data
- **ChatSession**: AI chat history
- **Transaction**: Individual M-Pesa transactions

## License

This project is licensed under the MIT License.