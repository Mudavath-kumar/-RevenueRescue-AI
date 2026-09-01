const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const AuditEvent = require('../models/AuditEvent');
const { v4: uuidv4 } = require('uuid');

// GET /api/exceptions
router.get('/', async (req, res) => {
  try {
    const exceptions = await Transaction.find({
      $or: [
        { isEscalated: true },
        { isPolicyBlocked: true },
        { status: 'FAILED', recoveryAttempts: { $gt: 0 } },
        { requiresHumanApproval: true }
      ]
    }).sort({ createdAt: -1 }).limit(200);

    res.json({ exceptions, count: exceptions.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/exceptions/:id/resolve
router.post('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution = 'RESOLVED', notes = 'Resolved by operator', action = 'APPROVE_MANUAL_RETRY' } = req.body;

    const txn = await Transaction.findOne({ transactionId: id });
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });

    let updatedFields = {
      isEscalated: false,
      isPolicyBlocked: false,
      requiresHumanApproval: false
    };

    if (action === 'DISMISS') {
      updatedFields.status = 'BLOCKED';
    } else if (action === 'APPROVE_MANUAL_RETRY') {
      updatedFields.status = 'PENDING';
    }

    const updatedTxn = await Transaction.findOneAndUpdate(
      { transactionId: id },
      { $set: updatedFields },
      { new: true }
    );

    // Record human resolution in audit log
    await AuditEvent.create({
      auditId: `AUD-${uuidv4().slice(0, 8).toUpperCase()}`,
      transactionId: id,
      actor: 'HUMAN',
      action: `EXCEPTION_RESOLVE_${action}`,
      reason: notes,
      policyDecision: 'ALLOWED',
      result: 'SUCCESS',
      revenueRecovered: 0,
      details: { resolution, notes, action, previousStatus: txn.status }
    });

    res.json({ success: true, message: `Exception for ${id} successfully resolved`, transaction: updatedTxn });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
