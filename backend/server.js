require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// DB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/recovery', require('./routes/recovery'));
app.use('/api/agent', require('./routes/agent'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/simulation', require('./routes/simulation'));
app.use('/api/exceptions', require('./routes/exceptions'));
app.use('/api/razorpay', require('./routes/razorpay'));
app.use('/api/ml', require('./routes/ml'));
app.use('/api/copilot', require('./routes/copilot'));

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'RevenueRescue AI Backend',
    uptime: Math.floor(process.uptime()) + 's'
  });
});

// ─── Keep-Alive Ping (prevents Render free tier sleep) ─────────────────────
// External cron (cron-job.org) hits GET /ping every 14 minutes.
// This endpoint also pings the ML service so BOTH services stay warm.
app.get('/ping', async (req, res) => {
  const results = { backend: 'awake', ml: 'unknown', ts: new Date().toISOString() };

  if (process.env.ML_SERVICE_URL) {
    try {
      await axios.get(`${process.env.ML_SERVICE_URL}/health`, { timeout: 5000 });
      results.ml = 'awake';
    } catch (_) {
      results.ml = 'unreachable';
    }
  }

  res.json(results);
});

// ─── Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// ─── Self-Ping every 14 minutes in production to prevent Render spin-down ──
if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
  const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes
  setInterval(async () => {
    try {
      await axios.get(`${process.env.RENDER_EXTERNAL_URL}/ping`, { timeout: 10000 });
      console.log(`[keep-alive] Self-pinged at ${new Date().toISOString()}`);
    } catch (e) {
      console.warn('[keep-alive] Self-ping failed:', e.message);
    }
  }, PING_INTERVAL);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
