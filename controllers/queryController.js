const Query = require('../models/Query');
const { generateResponse } = require('../services/gemini/geminiService');

exports.processQuery = async (req, res) => {
  const { query, board, mediaType } = req.body;
  const user = req.user;

  if (!query || !board) {
    return res.status(400).json({ error: 'Query and board are required' });
  }

  try {
    const { text, visual, video } = await generateResponse(query, board, mediaType);

    const newQuery = new Query({
      user: user.userId,
      board,
      query,
      response: text || undefined, // Use undefined if text is empty
      visual,
      video,
    });
    await newQuery.save();

    res.json({ text, visual, video });
  } catch (err) {
    console.error('Query processing error:', err.message, err.stack);
    res.status(500).json({ error: err.message || 'Failed to process query' });
  }
};