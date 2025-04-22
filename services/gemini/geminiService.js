const { GoogleGenerativeAI, GoogleGenerativeAIFetchError } = require('@google/generative-ai');

const GEMINI_API_KEY = 'AIzaSyAB57IgJOMDV-qR2yi4W3BAJOrqrca3Tew';
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

async function generateResponse(query, board) {
  if (!genAI) {
    console.warn('Gemini API key missing. Using mock response.');
    return {
      text: `Mock response for ${board}: This is a placeholder explanation for "${query}".`,
      visual: 'https://via.placeholder.com/400x300?text=Mock+Diagram',
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const prompt = `You are an AI tutor for ${board} students. Provide a detailed, step-by-step explanation for the following question: ${query}. Include relevant diagrams or visuals if applicable.`;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const visual = response.candidates?.[0]?.content?.parts?.find(part => part.fileData)?.fileData?.uri || 'https://via.placeholder.com/400x300?text=Diagram';

    return { text, visual };
  } catch (err) {
    console.error('Gemini API error:', err.message, err.stack);
    if (err instanceof GoogleGenerativeAIFetchError) {
      throw new Error(`Gemini API failure: ${err.message} (check API key validity or network)`);
    }
    throw new Error(`Failed to generate response: ${err.message}`);
  }
}

module.exports = { generateResponse };