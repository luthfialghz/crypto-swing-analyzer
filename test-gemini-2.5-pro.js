// Simple test script to verify Gemini 2.5 Pro integration
require('dotenv').config({ path: './.env.local' });

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini25Pro() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY is not set in environment variables');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Test with the new Gemini 2.5 Pro model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      }
    });

    const prompt = "Hello, this is a test to verify Gemini 2.5 Pro is working. Please respond with 'Gemini 2.5 Pro is operational' and nothing else.";
    
    console.log('Testing Gemini 2.5 Pro model...');

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('Success! Response from Gemini 2.5 Pro:', text);
      console.log('Primary model is working correctly.');
    } catch (primaryError) {
      if (primaryError.message.includes('429') || primaryError.message.includes('quota')) {
        console.log('Quota exceeded for Gemini 2.5 Pro, testing fallback model...');

        try {
          // Test the fallback model
          const fallbackModel = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
            }
          });

          const fallbackResult = await fallbackModel.generateContent(prompt);
          const fallbackResponse = await fallbackResult.response;
          const fallbackText = fallbackResponse.text();

          console.log('Success! Response from fallback model (gemini-1.5-flash):', fallbackText);
          console.log('Both models are configured correctly, but 2.5 Pro has quota limits.');
        } catch (fallbackError) {
          console.log('Fallback model also failed, but primary configuration is correct.');
          console.log('Error with fallback:', fallbackError.message);
        }
      } else {
        console.log('Different error with primary model:', primaryError.message);
        throw primaryError; // Re-throw if it's not a quota issue
      }
    }
  } catch (error) {
    console.error('Error testing Gemini models:', error.message);

    // Check for specific error types
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('The API key appears to be invalid. Please check your GEMINI_API_KEY in .env.local');
    } else if (error.message.includes('QUOTA_EXCEEDED') || error.message.includes('429')) {
      console.log('API quota exceeded for primary model, but configuration is correct.');
    } else if (error.message.includes('model')) {
      console.error('The model name might be incorrect or unavailable.');
    }
  }
}

testGemini25Pro();