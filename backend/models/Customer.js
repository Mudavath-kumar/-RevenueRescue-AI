const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String },
  totalTransactions: { type: Number, default: 0 },
  successfulTransactions: { type: Number, default: 0 },
  failedTransactions: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  averageTransactionValue: { type: Number, default: 0 },
  previousRecoveries: { type: Number, default: 0 },
  successRate: { type: Number, default: 0 },
  customerSince: { type: Date, default: Date.now },
  riskProfile: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
