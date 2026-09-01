/**
 * Policy Engine — Deterministic Financial Safety Layer
 * All financial recovery actions MUST pass through here before execution.
 * The AI agent cannot bypass this gate.
 */

const VALID_ACTIONS = ['RETRY_PAYMENT', 'SEND_NOTIFICATION', 'ESCALATE_TO_HUMAN'];

function getPolicyConfig() {
  return {
    MAX_RETRIES:               parseInt(process.env.MAX_RETRIES) || 2,
    MAX_AUTONOMOUS_AMOUNT:     parseFloat(process.env.MAX_AUTONOMOUS_AMOUNT) || 5000,
    MAX_RECOVERY_WINDOW_HOURS: parseInt(process.env.MAX_RECOVERY_WINDOW_HOURS) || 48,
    MIN_RECOVERY_PROBABILITY:  parseFloat(process.env.MIN_RECOVERY_PROBABILITY) || 0.40
  };
}

/**
 * Validate a proposed recovery action against all policies.
 * @returns {{ allowed: boolean, reason: string, checks: Object[] }}
 */
function validateAction(transaction, proposedAction, recoveryProbability) {
  const config = getPolicyConfig();
  const checks = [];
  let allowed = true;
  let blockReason = null;

  // 1. Valid action check
  const isValidAction = VALID_ACTIONS.includes(proposedAction);
  checks.push({
    rule: 'VALID_ACTION',
    passed: isValidAction,
    detail: `Action "${proposedAction}" is ${isValidAction ? 'valid' : 'invalid'}`
  });
  if (!isValidAction) {
    allowed = false;
    blockReason = `Invalid action proposed: ${proposedAction}`;
  }

  // ESCALATE_TO_HUMAN always allowed
  if (proposedAction === 'ESCALATE_TO_HUMAN') {
    checks.push({ rule: 'ESCALATION_ALWAYS_ALLOWED', passed: true, detail: 'Human escalation is always permitted' });
    return { allowed: true, reason: 'Human escalation approved', checks };
  }

  // SEND_NOTIFICATION always allowed
  if (proposedAction === 'SEND_NOTIFICATION') {
    checks.push({ rule: 'NOTIFICATION_ALWAYS_ALLOWED', passed: true, detail: 'Notifications are always permitted' });
    return { allowed: true, reason: 'Notification approved', checks };
  }

  // 2. Retry count check
  const retryOk = transaction.retryCount < config.MAX_RETRIES;
  checks.push({
    rule: 'MAX_RETRIES',
    passed: retryOk,
    detail: `Retry count ${transaction.retryCount} vs limit ${config.MAX_RETRIES}`
  });
  if (!retryOk) { allowed = false; blockReason = blockReason || `Retry limit reached (${config.MAX_RETRIES})`; }

  // 3. Amount check
  const amountOk = transaction.amount <= config.MAX_AUTONOMOUS_AMOUNT;
  checks.push({
    rule: 'MAX_AUTONOMOUS_AMOUNT',
    passed: amountOk,
    detail: `Amount ₹${transaction.amount} vs limit ₹${config.MAX_AUTONOMOUS_AMOUNT}`
  });
  if (!amountOk) { allowed = false; blockReason = blockReason || `Amount ₹${transaction.amount} exceeds autonomous limit ₹${config.MAX_AUTONOMOUS_AMOUNT}`; }

  // 4. Recovery window check
  const ageHours = (Date.now() - new Date(transaction.createdAt).getTime()) / (1000 * 60 * 60);
  const windowOk = ageHours <= config.MAX_RECOVERY_WINDOW_HOURS;
  checks.push({
    rule: 'MAX_RECOVERY_WINDOW',
    passed: windowOk,
    detail: `Age ${ageHours.toFixed(1)}h vs window ${config.MAX_RECOVERY_WINDOW_HOURS}h`
  });
  if (!windowOk) { allowed = false; blockReason = blockReason || `Recovery window expired (${ageHours.toFixed(1)}h > ${config.MAX_RECOVERY_WINDOW_HOURS}h)`; }

  // 5. Minimum recovery probability check
  const probOk = recoveryProbability >= config.MIN_RECOVERY_PROBABILITY;
  checks.push({
    rule: 'MIN_RECOVERY_PROBABILITY',
    passed: probOk,
    detail: `Probability ${(recoveryProbability * 100).toFixed(1)}% vs min ${(config.MIN_RECOVERY_PROBABILITY * 100).toFixed(1)}%`
  });
  if (!probOk) { allowed = false; blockReason = blockReason || `Recovery probability too low (${(recoveryProbability * 100).toFixed(1)}%)`; }

  return {
    allowed,
    reason: allowed ? 'All policy checks passed' : blockReason,
    checks,
    config
  };
}

module.exports = { validateAction, getPolicyConfig, VALID_ACTIONS };
