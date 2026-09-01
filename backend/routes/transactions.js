const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET /api/transactions - list with filters
router.get('/', async (req, res) => {
  try {
    const { status, failureReason, paymentMethod, minProb, maxProb, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (failureReason) filter.failureReason = failureReason;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (minProb || maxProb) {
      filter.recoveryProbability = {};
      if (minProb) filter.recoveryProbability.$gte = parseFloat(minProb);
      if (maxProb) filter.recoveryProbability.$lte = parseFloat(maxProb);
    }
    if (search) {
      filter.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ transactions, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/:id
router.get('/:id', async (req, res) => {
  try {
    const txn = await Transaction.findOne({ transactionId: req.params.id });
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });
    res.json(txn);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
