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
const transactionsRoutes = require('./routes/transaction.routes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'https://ai-mpesa-accountant-frontend.vercel.app',
    'https://ai-mpesa-accountant.vercel.app',
    'https://ai-mpesa-accountant-backend.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json({ limit: '10mb' }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes - register these regardless of MongoDB connection
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/statements', statementRoutes);
app.use('/api/transactions', transactionsRoutes);

// Root route for health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to AI-Pesa API',
    documentation: 'See API_REFERENCE.md for details'
  });
});

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
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // Don't exit process in serverless environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    } else {
      // In production, start the server anyway so routes work
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} (without MongoDB connection)`);
      });
    }
  });

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Handle MongoDB disconnection
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Handle process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API test successful',
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// Export app for serverless deployment
module.exports = app; 