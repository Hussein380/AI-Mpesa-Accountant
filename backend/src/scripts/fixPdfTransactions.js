/**
 * Script to fix PDF transactions in the database
 * 
 * This script updates existing PDF transactions to have the correct transaction types
 * so they are properly counted in the dashboard.
 */

const mongoose = require('mongoose');
const Transaction = require('../models/transaction.model');
const config = require('../config');

// Connect to MongoDB
mongoose.connect(config.mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function fixPdfTransactions() {
  try {
    console.log('Starting to fix PDF transactions...');

    // Find all PDF transactions
    const pdfTransactions = await Transaction.find({ source: 'PDF' });
    console.log(`Found ${pdfTransactions.length} PDF transactions`);

    // Count transactions by type
    const typeCount = {};
    pdfTransactions.forEach(t => {
      typeCount[t.type] = (typeCount[t.type] || 0) + 1;
    });
    console.log('Transactions by type:', typeCount);

    // Update summary transactions
    const summaryTransactions = pdfTransactions.filter(t => 
      t.description && t.description.includes('M-Pesa Statement Summary')
    );
    console.log(`Found ${summaryTransactions.length} summary transactions`);

    if (summaryTransactions.length > 0) {
      for (const transaction of summaryTransactions) {
        if (transaction.type !== 'RECEIVED') {
          console.log(`Updating summary transaction ${transaction._id} from type ${transaction.type} to RECEIVED`);
          transaction.type = 'RECEIVED';
          await transaction.save();
        }
      }
    }

    // Update income transactions (with "Received" in description)
    const incomeTransactions = pdfTransactions.filter(t => 
      t.description && t.description.includes('Received')
    );
    console.log(`Found ${incomeTransactions.length} income transactions`);

    if (incomeTransactions.length > 0) {
      for (const transaction of incomeTransactions) {
        if (transaction.type !== 'RECEIVED') {
          console.log(`Updating income transaction ${transaction._id} from type ${transaction.type} to RECEIVED`);
          transaction.type = 'RECEIVED';
          await transaction.save();
        }
      }
    }

    // Update expense transactions (with "Sent" in description)
    const expenseTransactions = pdfTransactions.filter(t => 
      t.description && t.description.includes('Sent')
    );
    console.log(`Found ${expenseTransactions.length} expense transactions`);

    if (expenseTransactions.length > 0) {
      for (const transaction of expenseTransactions) {
        if (transaction.type !== 'SENT' && transaction.type !== 'PAYMENT' && transaction.type !== 'WITHDRAWAL') {
          // Determine the appropriate type based on transaction description
          let newType = 'SENT';
          if (transaction.description.includes('Payment') || transaction.description.includes('Pay')) {
            newType = 'PAYMENT';
          } else if (transaction.description.includes('Withdraw')) {
            newType = 'WITHDRAWAL';
          }
          
          console.log(`Updating expense transaction ${transaction._id} from type ${transaction.type} to ${newType}`);
          transaction.type = newType;
          await transaction.save();
        }
      }
    }

    // Update transactions with PDF in transactionId
    const pdfIdTransactions = await Transaction.find({ 
      transactionId: { $regex: 'PDF', $options: 'i' },
      source: { $ne: 'PDF' }
    });
    console.log(`Found ${pdfIdTransactions.length} transactions with PDF in transactionId but wrong source`);

    if (pdfIdTransactions.length > 0) {
      for (const transaction of pdfIdTransactions) {
        console.log(`Updating transaction ${transaction._id} source to PDF`);
        transaction.source = 'PDF';
        await transaction.save();
      }
    }

    console.log('PDF transactions fixed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing PDF transactions:', error);
    process.exit(1);
  }
}

// Run the function
fixPdfTransactions(); 