// Test script for Gemini AI integration
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Check if API key is available
if (!process.env.GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY not found in environment variables');
  process.exit(1);
}

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use the correct model name - gemini-1.5-pro is the current model
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

async function testGemini() {
  try {
    console.log('Testing Gemini AI integration...');
    console.log('API Key:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
    console.log('Model: gemini-1.5-pro');
    
    // Test a simple prompt
    const prompt = 'Give me 3 tips for managing personal finances in Kenya.';
    console.log('\nSending prompt:', prompt);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('\nResponse from Gemini AI:');
    console.log(text);
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing Gemini AI:', error.message);
    console.error('Full error:', error);
    if (error.message.includes('API key')) {
      console.error('Please check your API key configuration.');
    }
  }
}

// Run the test
testGemini(); 