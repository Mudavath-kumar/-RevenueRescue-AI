/**
 * Batch Runner
 * Processes N transactions using:
 * 1. Baseline (rule-based) strategy
 * 2. RevenueRescue AI strategy
 * Both run on the same dataset for fair comparison.
 */

const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const AuditEvent = require('../models/AuditEvent');
const { validateAction } = require('../agent/policy-engine');
const { simulatePayment } = require('./paymentSimulator');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Baseline: simple rule-based strategy
function baselineDecision(transaction) {
  const { failureReason, retryCount } = transaction;
  if (retryCount >= 1) return 'ESCALATE_TO_HUMAN';
  if (['TEMPORARY_BANK_FAILURE', 'NETWORK_FAILURE'].includes(failureReason)) return 'RETRY_PAYMENT';
  if (['INSUFFICIENT_FUNDS', 'REPEATED_FAILURE'].includes(failureReason)) return 'ESCALATE_TO_HUMAN';
  return 'SEND_NOTIFICATION';
}

// AI-enhanced decision using policy engine + ML prediction
function aiDecision(transaction, recoveryProbability) {
  if (recoveryProbability >= 0.65) return 'RETRY_PAYMENT';
  if (recoveryProbability >= 0.40) return 'SEND_NOTIFICATION';
  return 'ESCALATE_TO_HUMAN';
}

async function getPrediction(txn, customer) {
  try {
    const resp = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
      amount: txn.amount,
      payment_method: txn.paymentMethod,
      failure_reason: txn.failureReason,
      retry_count: txn.retryCount,
      success_rate: customer?.successRate || 0.5,
      avg_transaction_value: customer?.averageTransactionValue || txn.amount,
      previous_recoveries: customer?.previousRecoveries || 0,
      customer_total_transactions: customer?.totalTransactions || 5,
      hours_since_failure: (Date.now() - new Date(txn.lastAttemptAt)) / (1000 * 60 * 60)
    }, { timeout: 2000 });
    return resp.data.recovery_probability;
  } catch (_) {
    // Deterministic fallback
    let h = 0;
    for (const c of txn.transactionId) h = ((h << 5) - h) + c.charCodeAt(0);
    return 0.3 + (Math.abs(h) % 50) / 100;
  }
}

async function runBatch(options = {}) {
  const {
    limit = 1000,
    seed = parseInt(process.env.SIMULATOR_SEED) || 42,
    mode = 'both' // 'baseline', 'ai', or 'both'
  } = options;

  console.log(`\n🚀 Starting batch evaluation: ${limit} transactions (seed=${seed})`);

  // Fetch failed transactions
  const transactions = await Transaction.find({ status: 'FAILED' }).limit(limit).lean();
  const actualLimit = transactions.length;
  console.log(`📊 Processing ${actualLimit} failed transactions`);

  const results = {
    batchSize: actualLimit,
    seed,
    timestamp: new Date().toISOString(),
    baseline: null,
    ai: null,
    comparison: null
  };

  // ── Baseline Run ────────────────────────────────────────────────────────────
  if (mode === 'baseline' || mode === 'both') {
    let baselineStats = {
      totalAttempted: 0, successful: 0, failed: 0, escalated: 0,
      revenueRecovered: 0, revenueAtRisk: 0, interventionCost: 0,
      policyBlocked: 0, falsPositives: 0
    };

    const interventionCost = parseInt(process.env.INTERVENTION_COST) || 25;

    for (const txn of transactions) {
      baselineStats.revenueAtRisk += txn.amount;
      const action = baselineDecision(txn);

      if (action === 'ESCALATE_TO_HUMAN') {
        baselineStats.escalated++;
        continue;
      }

      baselineStats.totalAttempted++;
      baselineStats.interventionCost += interventionCost;

      const simResult = simulatePayment(txn, action, 0.5, seed);
      if (simResult.success) {
        baselineStats.successful++;
        baselineStats.revenueRecovered += txn.amount;
      } else {
        baselineStats.failed++;
        if (action === 'RETRY_PAYMENT') baselineStats.falsPositives++;
      }
    }

    baselineStats.recoveryRate = baselineStats.successful > 0
      ? ((baselineStats.successful / actualLimit) * 100).toFixed(2) : 0;
    baselineStats.netValue = baselineStats.revenueRecovered - baselineStats.interventionCost;
    results.baseline = baselineStats;
    console.log(`✅ Baseline done: ${baselineStats.successful} recovered`);
  }

  // ── AI Run ──────────────────────────────────────────────────────────────────
  if (mode === 'ai' || mode === 'both') {
    let aiStats = {
      totalAttempted: 0, successful: 0, failed: 0, escalated: 0,
      revenueRecovered: 0, revenueAtRisk: 0, interventionCost: 0,
      policyBlocked: 0, falsePositives: 0
    };

    const interventionCost = parseInt(process.env.INTERVENTION_COST) || 25;

    for (let i = 0; i < transactions.length; i++) {
      const txn = transactions[i];
      aiStats.revenueAtRisk += txn.amount;

      const customer = await Customer.findOne({ customerId: txn.customerId }).lean();
      const recoveryProbability = await getPrediction(txn, customer);

      const proposedAction = aiDecision(txn, recoveryProbability);
      const policyResult = validateAction(txn, proposedAction, recoveryProbability);

      if (!policyResult.allowed) {
        aiStats.policyBlocked++;
        aiStats.escalated++;
        continue;
      }

      if (proposedAction === 'ESCALATE_TO_HUMAN') {
        aiStats.escalated++;
        continue;
      }

      aiStats.totalAttempted++;
      aiStats.interventionCost += interventionCost;

      const simResult = simulatePayment(txn, proposedAction, recoveryProbability, seed);
      if (simResult.success) {
        aiStats.successful++;
        aiStats.revenueRecovered += txn.amount;
      } else {
        aiStats.failed++;
        if (proposedAction === 'RETRY_PAYMENT') aiStats.falsePositives++;
      }

      if ((i + 1) % 500 === 0) console.log(`  AI: processed ${i + 1}/${actualLimit}`);
    }

    aiStats.recoveryRate = aiStats.successful > 0
      ? ((aiStats.successful / actualLimit) * 100).toFixed(2) : 0;
    aiStats.netValue = aiStats.revenueRecovered - aiStats.interventionCost;
    results.ai = aiStats;
    console.log(`✅ AI done: ${aiStats.successful} recovered`);
  }

  // ── Comparison ──────────────────────────────────────────────────────────────
  if (results.baseline && results.ai) {
    results.comparison = {
      incrementalRevenueRecovered: results.ai.revenueRecovered - results.baseline.revenueRecovered,
      incrementalRecoveryRate: (parseFloat(results.ai.recoveryRate) - parseFloat(results.baseline.recoveryRate)).toFixed(2),
      netValueDifference: results.ai.netValue - results.baseline.netValue,
      falsePositiveReduction: results.baseline.falsPositives - results.ai.falsePositives,
      interventionEfficiency: results.ai.revenueRecovered > 0
        ? (results.ai.revenueRecovered / results.ai.interventionCost).toFixed(2) : 0,
      winner: results.ai.revenueRecovered > results.baseline.revenueRecovered ? 'AI' : 'BASELINE'
    };
  }

  console.log('\n📈 Batch evaluation complete!');
  return results;
}

module.exports = { runBatch };
