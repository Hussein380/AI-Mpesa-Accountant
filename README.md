# AI-Pesa Project

AI-Pesa is an AI-powered financial assistant that helps users track and manage their M-Pesa transactions through an intuitive web interface with AI chat capabilities.

## Project Overview

AI-Pesa allows users to:
- Upload M-Pesa statements or paste M-Pesa SMS messages
- Get AI-powered analysis of their transactions
- View categorized spending and financial insights
- Chat with an AI assistant about their finances
- Receive personalized financial advice

## Project Structure

```
/
├── frontend/    # Next.js frontend application
├── backend/     # Express.js backend with Gemini AI integration
├── docs/        # Project documentation
```

## Key Features

### 1. Standardized API Responses

All API responses follow a consistent format:

```json
// Success response
{
  "success": true,
  "message": "Operation successful message",
  "data": { /* Response data */ }
}

// Error response
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  },
  "statusCode": 400
}
```

See [API Reference](./docs/API_REFERENCE.md) for detailed endpoint documentation.

### 2. Model Consistency

To ensure data consistency between frontend and backend, we use a shared type system:

- TypeScript interfaces in the frontend match MongoDB schemas in the backend
- All models are defined in `frontend/src/types/models.ts`
- Consistent field naming and types across the application

See [Model Consistency Guide](./docs/MODEL_CONSISTENCY.md) for more details.

## Frontend

The frontend is a modern, responsive web application built with Next.js that provides:
- User authentication
- Transaction upload interface
- Financial dashboard
- AI chat interface
- Responsive design with dark mode support

See the [frontend README](./frontend/README.md) for more details.

## Backend

The backend is an Express.js application that:
- Processes M-Pesa transaction data
- Integrates with Google's Gemini AI for analysis
- Stores user data and transactions in MongoDB
- Provides RESTful API endpoints for the frontend

See the [backend README](./backend/README.md) for more details.

## System Architecture

For a comprehensive overview of how the frontend and backend components work together, see the [System Overview](./docs/SYSTEM_OVERVIEW.md) document.

## Development

### Frontend Development

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

### Backend Development

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Gemini AI Setup

To set up the AI engine:

1. Create a Google AI Studio account at [makersuite.google.com](https://makersuite.google.com)
2. Generate an API key in the Google AI Studio
3. Add the API key to your backend `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   GEMINI_MODEL=gemini-pro
   ```

## Deployment

### Frontend Deployment

The frontend can be deployed to Vercel:

1. Connect your GitHub repository to Vercel
2. Configure the build settings:
   - Framework: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install --legacy-peer-deps`

### Backend Deployment

The backend can be deployed to services like Render, Railway, or Fly.io:

1. Set up MongoDB Atlas for database
2. Deploy the Express application
3. Configure environment variables including the Gemini API key
4. Set up proper security for API keys

## Documentation

- [API Reference](./docs/API_REFERENCE.md) - Detailed API endpoint documentation
- [System Overview](./docs/SYSTEM_OVERVIEW.md) - Architecture and system design
- [Database Schema](./docs/DATABASE_SCHEMA.md) - MongoDB schema documentation
- [Model Consistency](./docs/MODEL_CONSISTENCY.md) - Frontend-backend data consistency
- [Improvement Plan](./docs/IMPROVEMENT.md) - Planned improvements and enhancements

## Contributing

We welcome contributions to AI-Pesa! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details on how to get started.

## License

MIT 