const express = require('express');
const router = express.Router();
const { runRecoveryAgent } = require('../agent/agent');

// POST /api/agent/recover
router.post('/recover', async (req, res) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId) return res.status(400).json({ error: 'transactionId is required' });

    const result = await runRecoveryAgent(transactionId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
