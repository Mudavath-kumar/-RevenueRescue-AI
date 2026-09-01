const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const AuditEvent = require('../models/AuditEvent');
const { validateAction } = require('../agent/policy-engine');
const { simulatePayment } = require('../simulator/paymentSimulator');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');


/* ── Helpers ─────────────────────────────────────────────────── */
async function getMLPrediction(txn, customer) {
  try {
    const hoursSince = (Date.now() - new Date(txn.lastAttemptAt)) / (1000 * 60 * 60);
    const resp = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
      amount: txn.amount,
      payment_method: txn.paymentMethod,
      failure_reason: txn.failureReason,
      retry_count: txn.retryCount,
      success_rate: customer?.successRate ?? 0.7,
      avg_transaction_value: customer?.averageTransactionValue ?? txn.amount,
      previous_recoveries: customer?.previousRecoveries ?? 0,
      customer_total_transactions: customer?.totalTransactions ?? 5,
      hours_since_failure: Math.max(0, hoursSince)
    }, { timeout: 3000 });
    return {
      recoveryProbability: resp.data.recovery_probability,
      riskLevel: resp.data.risk_level,
      recommendedAction: resp.data.recommended_action,
      modelVersion: resp.data.model_version
    };
  } catch (_) {
    // Deterministic fallback when ML service is unavailable
    let h = 0;
    for (const c of txn.transactionId) h = ((h << 5) - h) + c.charCodeAt(0);
    return {
      recoveryProbability: 0.3 + (Math.abs(h) % 50) / 100,
      riskLevel: 'MEDIUM',
      recommendedAction: 'RETRY',
      modelVersion: 'fallback-v1'
    };
  }
}

async function writeAudit(transactionId, actor, action, reason, policyDecision, result, revenueRecovered, details) {
  try {
    await AuditEvent.create({
      auditId: `AUD-${uuidv4().slice(0, 8).toUpperCase()}`,
      transactionId,
      actor,
      action,
      reason,
      policyDecision,
      result,
      revenueRecovered: revenueRecovered || 0,
      details
    });
  } catch (_) { /* Non-blocking audit failure */ }
}

/* ── POST /api/recovery/analyze ─────────────────────────────── */
router.post('/analyze', async (req, res) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId) return res.status(400).json({ error: 'transactionId is required' });

    const txn = await Transaction.findOne({ transactionId });
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });

    // Fetch real customer data
    const customer = await Customer.findOne({ customerId: txn.customerId }).lean();

    // Get ML prediction using actual customer history
    const prediction = await getMLPrediction(txn, customer);

    // Policy checks for all possible actions
    const policyChecks = {
      RETRY_PAYMENT:      validateAction(txn, 'RETRY_PAYMENT',      prediction.recoveryProbability),
      SEND_NOTIFICATION:  validateAction(txn, 'SEND_NOTIFICATION',  prediction.recoveryProbability),
      ESCALATE_TO_HUMAN:  validateAction(txn, 'ESCALATE_TO_HUMAN',  prediction.recoveryProbability)
    };

    // Write audit — analysis requested
    await writeAudit(transactionId, 'ML_SERVICE', 'RECOVERY_ANALYSIS',
      `ML prediction: ${(prediction.recoveryProbability * 100).toFixed(1)}% recovery probability`,
      'N/A', 'PENDING', 0,
      { prediction, customer: customer ? { customerId: customer.customerId, successRate: customer.successRate } : null }
    );

    res.json({ transaction: txn, prediction, policyChecks, customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/recovery/execute ─────────────────────────────── */
router.post('/execute', async (req, res) => {
  try {
    const { transactionId, action } = req.body;
    if (!transactionId || !action) return res.status(400).json({ error: 'transactionId and action are required' });

    const txn = await Transaction.findOne({ transactionId });
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });

    // Idempotency guard — don't re-execute a successfully recovered transaction
    if (txn.status === 'RECOVERED') {
      return res.json({
        success: true,
        blocked: false,
        idempotent: true,
        message: 'Transaction already recovered',
        executionResult: { success: true, revenueRecovered: txn.revenueRecovered }
      });
    }

    // Fetch real customer data
    const customer = await Customer.findOne({ customerId: txn.customerId }).lean();

    // Get ML prediction using actual customer history
    const prediction = await getMLPrediction(txn, customer);

    // Policy gate — deterministic safety layer
    const policyResult = validateAction(txn, action, prediction.recoveryProbability);

    if (!policyResult.allowed) {
      // Update transaction state
      await Transaction.findOneAndUpdate({ transactionId }, {
        status: 'BLOCKED',
        isPolicyBlocked: true,
        isEscalated: action === 'ESCALATE_TO_HUMAN',
        requiresHumanApproval: policyResult.reason?.includes('amount') || false,
        lastAttemptAt: new Date()
      });

      // Write audit — policy blocked
      await writeAudit(transactionId, 'POLICY_ENGINE', action,
        policyResult.reason, 'BLOCKED', 'SKIPPED', 0,
        { policyResult, recoveryProbability: prediction.recoveryProbability }
      );

      return res.json({ success: false, blocked: true, reason: policyResult.reason, policyResult, prediction });
    }

    // Execute via payment simulator
    const simResult = simulatePayment(txn, action, prediction.recoveryProbability, parseInt(process.env.SIMULATOR_SEED) || 42);

    // Determine new transaction status
    let newStatus;
    if (action === 'ESCALATE_TO_HUMAN') {
      newStatus = 'ESCALATED';
    } else if (simResult.success) {
      newStatus = 'RECOVERED';
    } else {
      newStatus = 'FAILED';
    }

    // Update transaction in DB
    await Transaction.findOneAndUpdate({ transactionId }, {
      status: newStatus,
      retryCount: txn.retryCount + (action === 'RETRY_PAYMENT' ? 1 : 0),
      recoveryAttempts: (txn.recoveryAttempts || 0) + 1,
      revenueRecovered: simResult.success ? txn.amount : 0,
      recoveryAction: action,
      recoveryProbability: prediction.recoveryProbability,
      isEscalated: action === 'ESCALATE_TO_HUMAN',
      lastAttemptAt: new Date(),
      recoveredAt: simResult.success ? new Date() : undefined
    });

    // Write audit — execution result
    await writeAudit(
      transactionId,
      'PAYMENT_SIMULATOR',
      action,
      simResult.success
        ? `Payment recovered successfully — ₹${txn.amount.toLocaleString()} recovered`
        : `Payment execution failed: ${simResult.failureReason || 'Simulator rejection'}`,
      'ALLOWED',
      simResult.success ? 'SUCCESS' : 'FAILED',
      simResult.success ? txn.amount : 0,
      { simResult, policy: policyResult, prediction: prediction.recoveryProbability }
    );

    res.json({
      success: simResult.success,
      status: newStatus,
      policyResult,
      executionResult: simResult,
      prediction,
      revenueRecovered: simResult.success ? txn.amount : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
