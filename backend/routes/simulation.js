const express = require('express');
const router = express.Router();
const { runBatch } = require('../simulator/batchRunner');

// POST /api/simulation/run
router.post('/run', async (req, res) => {
  try {
    const { limit = 1000, seed = 42, mode = 'both' } = req.body;
    const results = await runBatch({ limit: Math.min(limit, 10000), seed, mode });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
