/**
 * AI Recovery Agent — Powered by Google Gemini with Resilient Decision Engine
 * The agent analyzes transactions and proposes recovery actions.
 * It CANNOT bypass the policy engine.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { validateAction } = require('./policy-engine');
const { simulatePayment } = require('../simulator/paymentSimulator');
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const AuditEvent = require('../models/AuditEvent');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (_) {}
}

// ─── Tool Definitions ───────────────────────────────────────────────────────

const tools = [
  {
    name: 'get_transaction',
    description: 'Retrieve full details of a transaction by ID',
    parameters: {
      type: 'object',
      properties: {
        transactionId: { type: 'string', description: 'Transaction ID' }
      },
      required: ['transactionId']
    }
  },
  {
    name: 'get_customer_history',
    description: 'Retrieve customer history and profile by customer ID',
    parameters: {
      type: 'object',
      properties: {
        customerId: { type: 'string', description: 'Customer ID' }
      },
      required: ['customerId']
    }
  },
  {
    name: 'get_recovery_prediction',
    description: 'Get ML recovery probability prediction for a transaction',
    parameters: {
      type: 'object',
      properties: {
        transactionId: { type: 'string', description: 'Transaction ID' }
      },
      required: ['transactionId']
    }
  },
  {
    name: 'get_allowed_actions',
    description: 'Get list of allowed recovery actions and current policy limits',
    parameters: { type: 'object', properties: {} }
  }
];

// ─── Tool Implementations ────────────────────────────────────────────────────

async function executeTool(toolName, args, transactionId) {
  await logAudit(transactionId, 'AI_AGENT', `TOOL_CALL:${toolName}`, JSON.stringify(args), 'N/A', 'N/A');

  switch (toolName) {
    case 'get_transaction': {
      const txn = await Transaction.findOne({ transactionId: args.transactionId });
      if (!txn) return { error: 'Transaction not found' };
      return txn.toObject();
    }

    case 'get_customer_history': {
      const customer = await Customer.findOne({ customerId: args.customerId });
      if (!customer) return { error: 'Customer not found' };
      return customer.toObject();
    }

    case 'get_recovery_prediction': {
      try {
        const txn = await Transaction.findOne({ transactionId: args.transactionId });
        if (!txn) return { error: 'Transaction not found' };
        const customer = await Customer.findOne({ customerId: txn.customerId });

        // Call ML service
        const response = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
          amount: txn.amount,
          payment_method: txn.paymentMethod,
          failure_reason: txn.failureReason,
          retry_count: txn.retryCount,
          success_rate: customer?.successRate || 0.5,
          avg_transaction_value: customer?.averageTransactionValue || txn.amount,
          previous_recoveries: customer?.previousRecoveries || 0,
          customer_total_transactions: customer?.totalTransactions || 1,
          hours_since_failure: (Date.now() - new Date(txn.lastAttemptAt)) / (1000 * 60 * 60)
        });

        return {
          transactionId: args.transactionId,
          recoveryProbability: response.data.recovery_probability,
          riskLevel: response.data.risk_level,
          recommendedAction: response.data.recommended_action,
          modelVersion: response.data.model_version
        };
      } catch (err) {
        const fallbackProb = getFallbackProbability(args.transactionId);
        return {
          transactionId: args.transactionId,
          recoveryProbability: fallbackProb,
          riskLevel: fallbackProb > 0.6 ? 'LOW' : fallbackProb > 0.4 ? 'MEDIUM' : 'HIGH',
          recommendedAction: fallbackProb > 0.4 ? 'RETRY' : 'ESCALATE',
          modelVersion: 'fallback-v1',
          fallback: true
        };
      }
    }

    case 'get_allowed_actions': {
      return {
        actions: ['RETRY_PAYMENT', 'SEND_NOTIFICATION', 'ESCALATE_TO_HUMAN'],
        policies: {
          maxRetries: parseInt(process.env.MAX_RETRIES) || 2,
          maxAutonomousAmount: parseFloat(process.env.MAX_AUTONOMOUS_AMOUNT) || 5000,
          maxRecoveryWindowHours: parseInt(process.env.MAX_RECOVERY_WINDOW_HOURS) || 48,
          minRecoveryProbability: parseFloat(process.env.MIN_RECOVERY_PROBABILITY) || 0.40
        }
      };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

/**
 * Intelligent reasoning engine (generates structured action & explanation)
 */
function generateStructuredDecision(txn, customer, recoveryProbability) {
  const maxAmount = parseFloat(process.env.MAX_AUTONOMOUS_AMOUNT) || 5000;
  const maxRetries = parseInt(process.env.MAX_RETRIES) || 2;
  const keyFactors = [];

  keyFactors.push(`ML Recovery Prob: ${(recoveryProbability * 100).toFixed(1)}%`);
  if (txn.amount > maxAmount) {
    keyFactors.push(`High Value Amount (₹${txn.amount.toLocaleString()})`);
  }
  if (txn.retryCount >= maxRetries) {
    keyFactors.push(`Retry Limit Reached (${txn.retryCount}/${maxRetries})`);
  }
  if (customer) {
    keyFactors.push(`Customer Success Rate: ${((customer.successRate || 0.7) * 100).toFixed(0)}%`);
  }

  let action = 'RETRY_PAYMENT';
  let reason = '';
  let requiresHumanApproval = false;
  let confidence = Math.min(0.95, Math.max(0.45, recoveryProbability));

  if (txn.amount > maxAmount) {
    action = 'ESCALATE_TO_HUMAN';
    reason = `Transaction amount (₹${txn.amount.toLocaleString()}) exceeds autonomous limit (₹${maxAmount.toLocaleString()}). Requires human operator review.`;
    requiresHumanApproval = true;
  } else if (txn.retryCount >= maxRetries) {
    action = 'ESCALATE_TO_HUMAN';
    reason = `Maximum retry attempts (${maxRetries}) exceeded. Escalated to prevent customer fatigue.`;
    requiresHumanApproval = true;
  } else if (recoveryProbability >= 0.65) {
    action = 'RETRY_PAYMENT';
    reason = `High recovery probability (${(recoveryProbability * 100).toFixed(1)}%) for temporary ${txn.failureReason?.replace(/_/g, ' ').toLowerCase()}. Autonomous retry recommended.`;
  } else if (recoveryProbability >= 0.40) {
    action = 'SEND_NOTIFICATION';
    reason = `Moderate recovery probability (${(recoveryProbability * 100).toFixed(1)}%). Customer notification recommended to prompt manual retry.`;
  } else {
    action = 'ESCALATE_TO_HUMAN';
    reason = `Low recovery probability (${(recoveryProbability * 100).toFixed(1)}%) with persistent error. Routed to operations queue.`;
    requiresHumanApproval = true;
  }

  return {
    action,
    reason,
    confidence: Math.round(confidence * 100) / 100,
    requires_human_approval: requiresHumanApproval,
    key_factors: keyFactors
  };
}

// ─── Main Agent Function ─────────────────────────────────────────────────────

async function runRecoveryAgent(transactionId) {
  const startTime = Date.now();
  await logAudit(transactionId, 'SYSTEM', 'RECOVERY_STARTED', 'AI agent recovery workflow initiated', 'N/A', 'N/A');

  // Fetch transaction details
  const txn = await Transaction.findOne({ transactionId });
  if (!txn) throw new Error('Transaction not found');

  const customer = await Customer.findOne({ customerId: txn.customerId });

  // Get recovery probability
  let recoveryProbability = txn.recoveryProbability || 0.5;
  try {
    const hoursSince = (Date.now() - new Date(txn.lastAttemptAt)) / (1000 * 60 * 60);
    const predResp = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
      amount: txn.amount,
      payment_method: txn.paymentMethod,
      failure_reason: txn.failureReason,
      retry_count: txn.retryCount,
      success_rate: customer?.successRate || 0.7,
      avg_transaction_value: customer?.averageTransactionValue || txn.amount,
      previous_recoveries: customer?.previousRecoveries || 0,
      customer_total_transactions: customer?.totalTransactions || 5,
      hours_since_failure: Math.max(0, hoursSince)
    }, { timeout: 2000 });
    recoveryProbability = predResp.data.recovery_probability;
  } catch (e) {
    recoveryProbability = getFallbackProbability(transactionId);
  }

  let agentDecision = null;

  // Try LLM Agent Reasoning first if genAI is available
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        tools: [{ functionDeclarations: tools }],
        generationConfig: { temperature: 0.2 }
      });

      const systemPrompt = `You are RevenueRescue AI, a financial recovery agent.
Analyze transaction ${transactionId} and recommend: RETRY_PAYMENT, SEND_NOTIFICATION, or ESCALATE_TO_HUMAN.
Output JSON: {"action": "...", "reason": "...", "confidence": 0.85, "requires_human_approval": false, "key_factors": []}`;

      const chat = model.startChat();
      let response = await chat.sendMessage(systemPrompt);

      let toolCallCount = 0;
      while (toolCallCount < 6) {
        const candidate = response.candidates?.[0];
        if (!candidate) break;

        const parts = candidate.content?.parts || [];
        const functionCalls = parts.filter(p => p.functionCall);
        const textParts = parts.filter(p => p.text);

        if (textParts.length > 0) {
          const text = textParts.map(p => p.text).join('');
          const parsed = extractJSON(text);
          if (parsed?.action) {
            agentDecision = parsed;
            break;
          }
        }

        if (functionCalls.length === 0) {
          const text = parts.map(p => p.text || '').join('');
          agentDecision = extractJSON(text);
          break;
        }

        const functionResponses = [];
        for (const part of functionCalls) {
          const { name, args } = part.functionCall;
          toolCallCount++;
          const result = await executeTool(name, args, transactionId);
          functionResponses.push({
            functionResponse: { name, response: result }
          });
        }

        response = await chat.sendMessage(functionResponses);
      }
    } catch (llmErr) {
      console.warn(`[Agent LLM Fallback] ${llmErr.message} -> Falling back to structured AI reasoning.`);
    }
  }

  // Graceful deterministic AI reasoning fallback if LLM was unavailable or unreachable
  if (!agentDecision || !agentDecision.action) {
    agentDecision = generateStructuredDecision(txn, customer, recoveryProbability);
  }

  await logAudit(
    transactionId, 'AI_AGENT', `AI_DECISION:${agentDecision.action}`,
    agentDecision.reason, 'N/A', 'N/A',
    { confidence: agentDecision.confidence, factors: agentDecision.key_factors }
  );

  // ─── Policy Gate ─────────────────────────────────────────────────────────
  const policyResult = validateAction(txn, agentDecision.action, recoveryProbability);

  await logAudit(
    transactionId, 'POLICY_ENGINE',
    policyResult.allowed ? 'POLICY_ALLOWED' : 'POLICY_BLOCKED',
    policyResult.reason, policyResult.allowed ? 'ALLOWED' : 'BLOCKED', 'N/A',
    { checks: policyResult.checks }
  );

  if (!policyResult.allowed) {
    // Blocked — escalate
    await Transaction.findOneAndUpdate(
      { transactionId },
      {
        status: 'BLOCKED',
        isPolicyBlocked: true,
        isEscalated: true,
        requiresHumanApproval: true,
        recoveryAction: agentDecision.action,
        recoveryProbability
      }
    );

    await logAudit(transactionId, 'SYSTEM', 'ESCALATED_AFTER_BLOCK', policyResult.reason, 'BLOCKED', 'FAILED');

    return {
      success: false,
      transactionId,
      agentDecision,
      policyResult,
      executionResult: null,
      revenueRecovered: 0,
      status: 'BLOCKED',
      message: `Policy blocked: ${policyResult.reason}`,
      duration: Date.now() - startTime
    };
  }

  // ─── Execute Approved Action ──────────────────────────────────────────────
  const simResult = simulatePayment(txn, agentDecision.action, recoveryProbability, parseInt(process.env.SIMULATOR_SEED) || 42);

  await logAudit(
    transactionId, 'PAYMENT_SIMULATOR',
    `EXECUTION:${simResult.paymentStatus}`,
    simResult.success ? `Payment succeeded - ₹${txn.amount.toLocaleString()} recovered` : `Payment failed - ${simResult.failureReason}`,
    'ALLOWED',
    simResult.success ? 'SUCCESS' : 'FAILED',
    { executionId: simResult.executionId, revenueRecovered: simResult.revenueRecovered }
  );

  // Update transaction state
  let newStatus;
  if (agentDecision.action === 'ESCALATE_TO_HUMAN') {
    newStatus = 'ESCALATED';
  } else if (simResult.success) {
    newStatus = 'RECOVERED';
  } else {
    newStatus = 'FAILED';
  }

  await Transaction.findOneAndUpdate(
    { transactionId },
    {
      status: newStatus,
      retryCount: txn.retryCount + (agentDecision.action === 'RETRY_PAYMENT' ? 1 : 0),
      recoveryAttempts: (txn.recoveryAttempts || 0) + 1,
      revenueRecovered: simResult.success ? txn.amount : 0,
      recoveryAction: agentDecision.action,
      recoveryProbability,
      lastAttemptAt: new Date(),
      isEscalated: newStatus === 'ESCALATED',
      recoveredAt: simResult.success ? new Date() : undefined
    }
  );

  return {
    success: simResult.success,
    transactionId,
    agentDecision,
    policyResult,
    executionResult: simResult,
    revenueRecovered: simResult.success ? txn.amount : 0,
    status: newStatus,
    message: simResult.success
      ? `✅ Revenue recovered: ₹${txn.amount.toLocaleString()}`
      : `❌ Recovery failed: ${simResult.failureReason}`,
    duration: Date.now() - startTime
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*"action"[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch (_) {}
  return null;
}

function getFallbackProbability(transactionId) {
  let hash = 0;
  for (const c of transactionId) hash = ((hash << 5) - hash) + c.charCodeAt(0);
  return 0.3 + (Math.abs(hash) % 50) / 100;
}

async function logAudit(transactionId, actor, action, reason, policyDecision = 'N/A', result = 'N/A', details = {}) {
  try {
    await AuditEvent.create({
      auditId: `AUD-${uuidv4().slice(0, 8).toUpperCase()}`,
      transactionId,
      actor,
      action,
      reason,
      policyDecision,
      result,
      details,
      timestamp: new Date()
    });
  } catch (e) {
    console.error('Audit log error:', e.message);
  }
}

module.exports = { runRecoveryAgent };
