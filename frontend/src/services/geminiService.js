// src/services/geminiService.js - WITH RETRY LOGIC
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// Fallback responses (keep your existing getFallbackResponse function)
export const getFallbackResponse = (query) => {
  // ... (keep your existing fallback responses)
};

// Retry helper function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getGeminiResponse = async (userMessage, chatHistory = [], retryCount = 0) => {
  const maxRetries = 3;
  const retryDelays = [1000, 3000, 5000]; // Wait 1s, 3s, 5s between retries
  
  // List of models to try in order (newest to oldest)
  const modelsToTry = [
    "gemini-3-flash-preview",  // Latest model
    "gemini-2.5-flash",        // Stable model
    "gemini-2.0-flash",        // Legacy fallback
    "gemini-1.5-flash"         // Last resort
  ];
  
  try {
    if (!process.env.REACT_APP_GEMINI_API_KEY) {
      return getFallbackResponse(userMessage);
    }

    // Try each model until one works
    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const conversationContext = chatHistory.slice(-6).map(msg => 
          `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
        ).join('\n');

        const prompt = `You are a waste management assistant for SmartWaste System. Be friendly, use emojis, and keep responses concise.

${conversationContext ? `Previous conversation:\n${conversationContext}\n` : ''}
User: ${userMessage}
Assistant:`;

        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 15000)
          )
        ]);
        
        const response = await result.response;
        let aiResponse = response.text();
        aiResponse = aiResponse.trim();
        
        console.log(`Success with model: ${modelName}`);
        return aiResponse;
        
      } catch (modelError) {
        console.log(`Model ${modelName} failed:`, modelError.message);
        continue; // Try next model
      }
    }
    
    // If all models failed, retry with delay if under max retries
    if (retryCount < maxRetries) {
      console.log(`Retry attempt ${retryCount + 1} after ${retryDelays[retryCount]}ms...`);
      await delay(retryDelays[retryCount]);
      return getGeminiResponse(userMessage, chatHistory, retryCount + 1);
    }
    
    // All retries exhausted, use fallback
    console.log('All models and retries failed, using fallback response');
    return getFallbackResponse(userMessage);
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    if (retryCount < maxRetries) {
      console.log(`Retry attempt ${retryCount + 1} after error...`);
      await delay(retryDelays[retryCount]);
      return getGeminiResponse(userMessage, chatHistory, retryCount + 1);
    }
    
    return getFallbackResponse(userMessage);
  }
};