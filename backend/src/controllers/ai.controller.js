// We'll use dynamic import for Ollama later
// const ollama = require('ollama');
const User = require('../models/user.model');
const ChatSession = require('../models/chat.model');

/**
 * Chat with AI
 */
exports.chatCompletion = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user ? req.user.id : null;
    
    // Check if this is a free chat (no authentication)
    if (!userId) {
      // For free chat, check if the IP has exceeded the free message limit
      const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      
      // In a real implementation, you would track IP-based usage in a database
      // For now, we'll just simulate the check
      const FREE_MESSAGE_LIMIT = 3;
      const usedMessages = req.session?.messageCount || 0;
      
      if (usedMessages >= FREE_MESSAGE_LIMIT) {
        return res.status(403).json({ 
          message: 'Free message limit reached. Please sign up to continue.',
          limitReached: true
        });
      }
      
      // Increment message count
      if (!req.session) req.session = {};
      req.session.messageCount = (req.session.messageCount || 0) + 1;
    }

    // In a production environment, we would use Ollama to generate a response
    // For now, we'll simulate the AI response
    const aiResponse = simulateAIResponse(message);
    
    // Save the chat message to the database if user is authenticated
    if (userId && sessionId) {
      await ChatSession.findByIdAndUpdate(
        sessionId,
        { 
          $push: { 
            messages: [
              { content: message, sender: 'user' },
              { content: aiResponse, sender: 'ai' }
            ] 
          },
          lastUpdated: new Date()
        },
        { new: true, upsert: true }
      );
    }

    res.json({
      message: aiResponse,
      sessionId: sessionId || 'free-session',
      limitReached: !userId && (req.session?.messageCount >= FREE_MESSAGE_LIMIT)
    });
  } catch (error) {
    console.error('Chat completion error:', error);
    res.status(500).json({ message: 'Server error during AI chat' });
  }
};

/**
 * Analyze M-Pesa statement
 */
exports.analyzeStatement = async (req, res) => {
  try {
    const { statementId } = req.body;
    const userId = req.user.id;

    // In a real implementation, you would:
    // 1. Retrieve the statement from the database
    // 2. Process it with Ollama or another AI model
    // 3. Return insights

    // For now, we'll return simulated insights
    const insights = {
      totalIncome: 45000,
      totalExpenses: 32500,
      balance: 12500,
      topCategories: [
        { name: 'Food', amount: 8500 },
        { name: 'Transport', amount: 6200 },
        { name: 'Entertainment', amount: 4800 },
        { name: 'Utilities', amount: 3500 },
        { name: 'Shopping', amount: 2800 }
      ],
      savingsTrend: [
        { month: 'January', amount: 8000 },
        { month: 'February', amount: 9500 },
        { month: 'March', amount: 12500 }
      ]
    };

    res.json({
      message: 'Statement analyzed successfully',
      insights
    });
  } catch (error) {
    console.error('Statement analysis error:', error);
    res.status(500).json({ message: 'Server error during statement analysis' });
  }
};

/**
 * Simulate AI response (temporary function until Ollama integration)
 */
function simulateAIResponse(userInput) {
  const input = userInput.toLowerCase();

  if (input.includes('spend') && input.includes('food')) {
    return "Based on your M-Pesa statements, you spent KSh 12,450 on food last month. This is about 15% of your total spending.";
  } else if (input.includes('largest transaction')) {
    return "Your largest transaction in the past week was KSh 5,000 sent to John Doe on Monday, June 10th.";
  } else if (input.includes('savings')) {
    return "Your savings have increased by 8% over the past 3 months. You saved KSh 8,000 in April, KSh 9,200 in May, and KSh 10,500 in June.";
  } else if (input.includes('family')) {
    return "Last month, you sent a total of KSh 15,000 to contacts tagged as 'Family'. This includes KSh 8,000 to Mom, KSh 5,000 to Dad, and KSh 2,000 to Sister.";
  } else if (input.includes('categories') || input.includes('spending')) {
    return "Your top spending categories last month were: 1. Utilities (KSh 18,500), 2. Food (KSh 12,450), 3. Transport (KSh 8,300), 4. Entertainment (KSh 5,200), and 5. Shopping (KSh 4,100).";
  } else {
    return "I don't have enough information to answer that question yet. Please upload your M-Pesa statements for more detailed insights.";
  }
} 