/**
 * Payment Simulator
 * Deterministic simulation of payment outcomes.
 * Uses a seeded random function for reproducibility.
 */

// Simple seeded pseudo-random (mulberry32)
function seededRandom(seed) {
  let s = seed;
  return function () {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Base success probabilities per failure reason
const BASE_RECOVERY_RATE = {
  TEMPORARY_BANK_FAILURE:   0.82,
  NETWORK_FAILURE:          0.75,
  PAYMENT_METHOD_ISSUE:     0.55,
  INSUFFICIENT_FUNDS:       0.15,
  EXPIRED_PAYMENT_METHOD:   0.20,
  REPEATED_FAILURE:         0.10,
  UNKNOWN:                  0.40
};

/**
 * Simulate a payment retry attempt.
 * @param {Object} transaction - Transaction object
 * @param {string} action - Recovery action (RETRY_PAYMENT, SEND_NOTIFICATION, ESCALATE_TO_HUMAN)
 * @param {number} recoveryProbability - ML predicted probability (0-1)
 * @param {number} seed - Random seed for reproducibility
 * @returns {Object} - { success, paymentStatus, revenueRecovered, failureReason, executionId }
 */
function simulatePayment(transaction, action, recoveryProbability = 0.5, seed = 42) {
  const rand = seededRandom(seed + hashString(transaction.transactionId));

  if (action === 'ESCALATE_TO_HUMAN') {
    return {
      success: false,
      paymentStatus: 'ESCALATED',
      revenueRecovered: 0,
      failureReason: 'Human review required',
      executionId: `SIM_ESC_${Date.now()}`,
      action
    };
  }

  if (action === 'SEND_NOTIFICATION') {
    return {
      success: true,
      paymentStatus: 'NOTIFICATION_SENT',
      revenueRecovered: 0,
      failureReason: null,
      executionId: `SIM_NOTIF_${Date.now()}`,
      action
    };
  }

  if (action === 'RETRY_PAYMENT') {
    const baseRate = BASE_RECOVERY_RATE[transaction.failureReason] || 0.40;
    
    // Blend base rate with ML probability (weighted)
    const effectiveProbability = (baseRate * 0.4) + (recoveryProbability * 0.6);
    
    // Penalty for multiple retries
    const retryPenalty = transaction.retryCount * 0.10;
    
    const finalProbability = Math.max(0, effectiveProbability - retryPenalty);
    const roll = rand();
    const success = roll < finalProbability;

    return {
      success,
      paymentStatus: success ? 'SUCCESS' : 'FAILED',
      revenueRecovered: success ? transaction.amount : 0,
      failureReason: success ? null : transaction.failureReason,
      executionId: `SIM_${Date.now()}_${Math.floor(rand() * 10000)}`,
      action,
      debugInfo: {
        roll: roll.toFixed(4),
        threshold: finalProbability.toFixed(4),
        baseRate,
        mlProbability: recoveryProbability
      }
    };
  }

  return {
    success: false,
    paymentStatus: 'UNKNOWN_ACTION',
    revenueRecovered: 0,
    failureReason: `Unknown action: ${action}`,
    executionId: `SIM_ERR_${Date.now()}`,
    action
  };
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

module.exports = { simulatePayment };
