const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentMethod: { type: String, enum: ['UPI', 'CARD', 'NETBANKING', 'WALLET'], required: true },
  status: { type: String, enum: ['FAILED', 'RECOVERED', 'ESCALATED', 'PENDING', 'SUCCESS', 'BLOCKED'], default: 'FAILED' },
  failureReason: {
    type: String,
    enum: [
      'TEMPORARY_BANK_FAILURE',
      'NETWORK_FAILURE',
      'INSUFFICIENT_FUNDS',
      'EXPIRED_PAYMENT_METHOD',
      'REPEATED_FAILURE',
      'PAYMENT_METHOD_ISSUE',
      'UNKNOWN'
    ]
  },
  retryCount: { type: Number, default: 0 },
  recoveryAttempts: { type: Number, default: 0 },
  revenueRecovered: { type: Number, default: 0 },
  recoveryAction: { type: String },
  recoveryProbability: { type: Number },
  requiresHumanApproval: { type: Boolean, default: false },
  isEscalated: { type: Boolean, default: false },
  isPolicyBlocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastAttemptAt: { type: Date, default: Date.now },
  recoveredAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
