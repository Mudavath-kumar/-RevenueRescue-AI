const express = require('express');
const router = express.Router();
const AuditEvent = require('../models/AuditEvent');

// GET /api/audit/:transactionId
router.get('/:transactionId', async (req, res) => {
  try {
    const events = await AuditEvent.find({ transactionId: req.params.transactionId })
      .sort({ timestamp: 1 });
    res.json({ transactionId: req.params.transactionId, events, count: events.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/audit - recent events
router.get('/', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const events = await AuditEvent.find().sort({ timestamp: -1 }).limit(parseInt(limit));
    res.json({ events, count: events.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
