const Query = require('../models/Query');

exports.getHistory = async (req, res) => {
  try {
    const history = await Query.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};