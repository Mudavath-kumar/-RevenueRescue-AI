const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const AuditEvent = require('../models/AuditEvent');

// GET /api/dashboard/metrics
router.get('/metrics', async (req, res) => {
  try {
    const [
      totalTransactions,
      failedTransactions,
      recoveredTransactions,
      escalatedTransactions,
      blockedTransactions,
      pendingTransactions,
      failedWithAttempts
    ] = await Promise.all([
      Transaction.countDocuments(),
      Transaction.countDocuments({ status: 'FAILED' }),
      Transaction.countDocuments({ status: 'RECOVERED' }),
      Transaction.countDocuments({ isEscalated: true }),
      Transaction.countDocuments({ isPolicyBlocked: true }),
      Transaction.countDocuments({ status: 'PENDING' }),
      Transaction.countDocuments({ status: 'FAILED', recoveryAttempts: { $gt: 0 } })
    ]);

    // Revenue metrics
    const revenueAtRisk = await Transaction.aggregate([
      { $match: { status: { $in: ['FAILED', 'PENDING', 'ESCALATED', 'BLOCKED'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const revenueRecovered = await Transaction.aggregate([
      { $match: { status: 'RECOVERED' } },
      { $group: { _id: null, total: { $sum: '$revenueRecovered' } } }
    ]);

    // Recovery trend (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyRecovery = await Transaction.aggregate([
      { $match: { status: 'RECOVERED', recoveredAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$recoveredAt' } },
          recovered: { $sum: '$revenueRecovered' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Recovery funnel
    const atRisk = failedTransactions + escalatedTransactions + blockedTransactions + pendingTransactions;
    const recoveryAttempts = await Transaction.countDocuments({ recoveryAttempts: { $gt: 0 } });
    const unresolvedExceptions = escalatedTransactions + blockedTransactions;

    // Failure breakdown
    const failureBreakdown = await Transaction.aggregate([
      { $match: { failureReason: { $exists: true } } },
      { $group: { _id: '$failureReason', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Payment method breakdown
    const methodBreakdown = await Transaction.aggregate([
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, recovered: { $sum: { $cond: [{ $eq: ['$status', 'RECOVERED'] }, 1, 0] } } } }
    ]);

    const totalRisk = revenueAtRisk[0]?.total || 0;
    const totalRecovered = revenueRecovered[0]?.total || 0;
    const recoveryRate = recoveredTransactions > 0 && (recoveredTransactions + failedTransactions) > 0
      ? ((recoveredTransactions / (recoveredTransactions + failedTransactions + escalatedTransactions)) * 100).toFixed(1)
      : 0;

    const interventionCostUnit = parseInt(process.env.INTERVENTION_COST) || 25;
    const totalInterventionCost = recoveryAttempts * interventionCostUnit;

    res.json({
      summary: {
        totalTransactions,
        failedTransactions,
        recoveredTransactions,
        escalatedTransactions,
        blockedTransactions,
        pendingTransactions,
        recoveryAttempts,
        successfulInterventions: recoveredTransactions,
        failedInterventions: failedWithAttempts,
        unresolvedExceptions,
        revenueAtRisk: totalRisk,
        revenueRecovered: totalRecovered,
        recoveryRate: parseFloat(recoveryRate),
        netRecovery: totalRecovered - totalInterventionCost,
        interventionCost: totalInterventionCost
      },
      funnel: {
        atRisk,
        recoverable: recoveryAttempts,
        attempted: recoveryAttempts,
        recovered: recoveredTransactions
      },
      dailyRecovery,
      failureBreakdown,
      methodBreakdown
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
