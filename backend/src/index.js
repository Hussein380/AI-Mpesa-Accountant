require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    mongodbStatus: mongoose.connection.readyState
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    mongodbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Connect to MongoDB with improved options
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // Timeout after 10s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
.then(() => {
  console.log('MongoDB connected successfully');
  
  // Import routes AFTER MongoDB connection is established
  const authRoutes = require('./routes/auth.routes');
  const userRoutes = require('./routes/user.routes');
  const aiRoutes = require('./routes/ai.routes');
  const statementRoutes = require('./routes/statement.routes');
  const transactionsRoutes = require('./routes/transactions.js');
  
  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/statements', statementRoutes);
  app.use('/api/transactions', transactionsRoutes);
  
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

// Export app for serverless deployment
module.exports = app; 