const mongoose = require('mongoose');

const auditEventSchema = new mongoose.Schema({
  auditId: { type: String, required: true, unique: true },
  transactionId: { type: String, required: true },
  actor: {
    type: String,
    enum: ['SYSTEM', 'AI_AGENT', 'ML_SERVICE', 'POLICY_ENGINE', 'PAYMENT_SIMULATOR', 'HUMAN'],
    required: true
  },
  action: { type: String, required: true },
  reason: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  policyDecision: { type: String, enum: ['ALLOWED', 'BLOCKED', 'ESCALATED', 'N/A'], default: 'N/A' },
  result: { type: String, enum: ['SUCCESS', 'FAILED', 'PENDING', 'SKIPPED', 'N/A'], default: 'N/A' },
  revenueRecovered: { type: Number, default: 0 },
  errorMessage: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: false });

auditEventSchema.index({ transactionId: 1, timestamp: 1 });

module.exports = mongoose.model('AuditEvent', auditEventSchema);
