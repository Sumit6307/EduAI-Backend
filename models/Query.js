const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  board: { type: String, required: true },
  query: { type: String, required: true },
  response: { type: String, required: true },
  visual: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Query', querySchema);