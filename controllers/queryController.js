const Query = require('../models/Query');
const { generateResponse } = require('../services/gemini/geminiService');

exports.processQuery = async (req, res) => {
  const { query, board } = req.body;
  const user = req.user;

  if (!query || !board) {
    return res.status(400).json({ error: 'Query and board are required' });
  }

  try {
    const { text, visual } = await generateResponse(query, board);

    const newQuery = new Query({
      user: user.userId,
      board,
      query,
      response: text,
      visual,
    });
    await newQuery.save();

    res.json({ text, visual });
  } catch (err) {
    console.error('Query processing error:', err.message, err.stack);
    res.status(500).json({ error: err.message || 'Failed to process query' });
  }
};