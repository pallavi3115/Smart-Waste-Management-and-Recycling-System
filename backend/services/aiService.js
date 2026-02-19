const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Classify waste from image
const classifyWaste = async (imageBase64) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are a waste classification expert. Analyze this image and provide:
    1. Category: [Plastic (OPAQUE), Plastic (TRANSPARENT), Glass, Paper/Cardboard, Metal, E-Waste, Organic, Hazardous]
    2. Confidence: [0-100]
    3. Recyclable: [Yes/No/Maybe]
    4. Instructions: [Brief recycling instructions]
    5. Environmental Impact: [Brief statement about environmental impact]
    
    Format as JSON.`;

    const result = await model.generateContent([prompt, imageBase64]);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      category: "Unknown",
      confidence: 0,
      recyclable: "Maybe",
      instructions: "Unable to classify",
      environmentalImpact: "Unknown"
    };
  } catch (error) {
    console.error('AI classification error:', error);
    throw error;
  }
};

// Suggest report category from image
const suggestCategory = async (imageBase64) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are a municipal complaint system. Analyze this image and suggest:
    1. Category: [Overflowing Bin, Bin Damaged, Missed Collection, Illegal Dumping, Fire Hazard, Blocked Drain, Dead Animal, Public Toilet Issue, Stray Animals, Road Cleaning]
    2. Confidence: [0-100]
    3. Priority: [LOW, MEDIUM, HIGH, CRITICAL]
    4. Brief Description: [One line description]
    5. Urgency: [Explain why this is urgent or not]
    
    Format as JSON.`;

    const result = await model.generateContent([prompt, imageBase64]);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      category: "Other",
      confidence: 0,
      priority: "MEDIUM",
      description: "Unable to determine",
      urgency: "Please describe manually"
    };
  } catch (error) {
    console.error('AI suggestion error:', error);
    throw error;
  }
};

// Analyze waste trends
const analyzeTrends = async (data) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const prompt = `Analyze this waste management data and provide insights:
    Data: ${JSON.stringify(data)}
    
    Provide:
    1. Key trends (3-5 points)
    2. Problem areas
    3. Recommendations for improvement
    4. Predicted future patterns
    5. Areas needing immediate attention
    
    Format as JSON with sections.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      trends: [],
      problemAreas: [],
      recommendations: [],
      predictions: [],
      immediateActions: []
    };
  } catch (error) {
    console.error('AI trend analysis error:', error);
    throw error;
  }
};

// Generate response for citizen query
const chatResponse = async (message, context) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are a helpful assistant for a smart waste management system. 
    Context: User is in ${context.city || 'Indore'}, asking about waste management.
    
    User message: ${message}
    
    Provide a helpful, concise response. Include:
    - Direct answer to query
    - Practical tips if relevant
    - Where to get more help if needed
    
    Be friendly and encouraging about environmental responsibility.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI chat error:', error);
    throw error;
  }
};

// Optimize collection routes
const optimizeRoutes = async (bins, trucks) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const prompt = `Optimize waste collection routes with:
    Bins: ${JSON.stringify(bins)}
    Trucks: ${JSON.stringify(trucks)}
    
    Consider:
    1. Fill levels (prioritize >80%)
    2. Traffic patterns
    3. Truck capacities
    4. Working hours
    
    Provide optimized route sequence for each truck. Format as JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {};
  } catch (error) {
    console.error('AI route optimization error:', error);
    throw error;
  }
};

module.exports = {
  classifyWaste,
  suggestCategory,
  analyzeTrends,
  chatResponse,
  optimizeRoutes
};