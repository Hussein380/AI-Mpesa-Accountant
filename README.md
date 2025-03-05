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
├── backend/     # Express.js backend with Ollama integration
├── SYSTEM_OVERVIEW.md  # Comprehensive system architecture documentation
```

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
- Integrates with Ollama for AI analysis
- Stores user data and transactions in MongoDB
- Provides RESTful API endpoints for the frontend

See the [backend README](./backend/README.md) for more details.

## System Architecture

For a comprehensive overview of how the frontend and backend components work together, see the [System Overview](./SYSTEM_OVERVIEW.md) document.

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

### Ollama Setup

To run the AI engine locally:

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull the Llama 3 model:
   ```bash
   ollama pull llama3:8b
   ```
3. Run the model:
   ```bash
   ollama run llama3:8b
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
3. Configure environment variables
4. Set up Ollama integration

## License

MIT 