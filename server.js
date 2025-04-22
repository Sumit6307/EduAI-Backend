const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const queryRoutes = require('./routes/query');
const historyRoutes = require('./routes/history');
const connectDB = require('./utils/db');
const { PORT } = require('./config/env');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/history', historyRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));