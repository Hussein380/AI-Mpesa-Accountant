// Test script for transactions API
require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./src/models/transaction.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');
    
    try {
      // Get user ID from command line or use a default
      const userId = process.argv[2] || '65e9c2e0e6f6c9a8b4567890'; // Replace with a valid user ID
      
      console.log(`Testing transactions for user: ${userId}`);
      
      // Count transactions for user
      const count = await getTransactionCount(userId);
      
      // Get sample transactions
      const transactions = await Transaction.find({ user: userId }).limit(5);
      console.log('Sample transactions:');
      transactions.forEach(t => {
        console.log(`- ${t.transactionId}: ${t.type} ${t.amount} (${new Date(t.date).toLocaleDateString()})`);
      });
      
      // Create a test transaction
      const testTransaction = new Transaction({
        user: userId,
        transactionId: `test-${Date.now()}`,
        date: new Date(),
        type: 'RECEIVED',
        amount: 1000,
        balance: 5000,
        recipient: 'Test Recipient',
        sender: 'Test Sender',
        description: 'Test Transaction',
        category: 'OTHER',
        source: 'TEST'
      });
      
      // Save the test transaction
      const savedTransaction = await testTransaction.save();
      console.log('Created test transaction:', savedTransaction.transactionId);
      
      console.log('Test completed successfully');
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      // Disconnect from MongoDB
      await mongoose.disconnect();
      console.log('MongoDB disconnected');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function getTransactionCount(userId) {
    try {
        const count = await Transaction.find({ user: userId }).countDocuments();
        console.log(`Total transactions for user ${userId}: ${count}`);
        return count;
    } catch (error) {
        console.error('Error counting transactions:', error);
        throw error;
    }
} 