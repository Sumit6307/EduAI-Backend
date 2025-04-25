const { GoogleGenerativeAI, GoogleGenerativeAIFetchError } = require('@google/generative-ai');
const { generateVisual, generateVideo } = require('../visual/visualService');

require('dotenv').config();

// Load API key from .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAB57IgJOMDV-qR2yi4W3BAJOrqrca3Tew';
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

async function generateResponse(query, board, mediaType = 'all') {
  if (!genAI) {
    console.warn('Gemini API key missing. Using mock response.');
    return {
      text: `Mock response for ${board}: This is a placeholder explanation for "${query}".`,
      visual: await generateVisual(query),
      video: await generateVideo(query),
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const response = { text: '', visual: null, video: null };

    // Text Generation
    if (mediaType === 'all' || mediaType === 'text') {
      const textPrompt = `You are an AI tutor for ${board} students. Provide a detailed, step-by-step explanation for the following question: ${query}.`;
      const textResult = await model.generateContent(textPrompt);
      response.text = textResult.response.text();
    }

    // Image Generation
    if (mediaType === 'all' || mediaType === 'image') {
      response.visual = await generateVisual(query);
    }

    // Video Generation
    if (mediaType === 'all' || mediaType === 'video') {
      response.video = await generateVideo(query);
    }

    return response;
  } catch (err) {
    console.error('Gemini API error:', err.message, err.stack);
    if (err instanceof GoogleGenerativeAIFetchError) {
      throw new Error(`Gemini API failure: ${err.message} (check API key validity or network)`);
    }
    throw new Error(`Failed to generate response: ${err.message}`);
  }
}

module.exports = { generateResponse };