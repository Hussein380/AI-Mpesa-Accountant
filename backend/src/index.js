require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const aiRoutes = require('./routes/ai.routes');
const statementRoutes = require('./routes/statement.routes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');
    
    // Drop the problematic phoneNumber index if it exists
    try {
      // Get the User model collection
      const User = mongoose.connection.collection('users');
      
      // Get all indexes
      const indexes = await User.indexes();
      
      // Check if phoneNumber index exists
      const phoneNumberIndex = indexes.find(index => 
        index.key && index.key.phoneNumber !== undefined
      );
      
      // If the index exists, drop it
      if (phoneNumberIndex) {
        await User.dropIndex('phoneNumber_1');
        console.log('Dropped phoneNumber index successfully');
      }
    } catch (error) {
      console.error('Error handling phoneNumber index:', error);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // Don't exit process in serverless environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

// Middleware
app.use(cors({
  origin: [
    'ttps://ai-mpesa-accountant-backend.vercel.app',
    'https://ai-mpesa-accountant-frontend.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
// Note: In Vercel, file uploads should be handled differently
// This is kept for local development
if (process.env.NODE_ENV !== 'production') {
  const fs = require('fs');
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/statements', statementRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API test successful',
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'AI-Pesa API is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Welcome to AI-Pesa API',
    documentation: 'See API_REFERENCE.md for details'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server in development, export app in production
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export app for serverless deployment
module.exports = app; 