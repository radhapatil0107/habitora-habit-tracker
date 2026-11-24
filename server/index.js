const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
const habitRoutes = require('./routes/habits');
app.use('/api/habits', habitRoutes);

// ── Root route ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('Habit Tracker API is running ✅');
});

// ── Connect to MongoDB & Start Server ───────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
  });
