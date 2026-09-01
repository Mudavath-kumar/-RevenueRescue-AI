/**
 * Seed Script — Generates 10,000 synthetic transactions + customers
 * Run: node scripts/seed.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');

const PAYMENT_METHODS = ['UPI', 'CARD', 'NETBANKING', 'WALLET'];
const FAILURE_REASONS = [
  'TEMPORARY_BANK_FAILURE',
  'NETWORK_FAILURE',
  'INSUFFICIENT_FUNDS',
  'EXPIRED_PAYMENT_METHOD',
  'PAYMENT_METHOD_ISSUE',
  'REPEATED_FAILURE',
  'UNKNOWN'
];

// Weighted distributions (realistic)
const FAILURE_WEIGHTS = [0.30, 0.20, 0.20, 0.10, 0.10, 0.05, 0.05];
const METHOD_WEIGHTS  = [0.45, 0.30, 0.15, 0.10];

function weightedRandom(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min, max) { return Math.random() * (max - min) + min; }

function generateCustomers(count = 2000) {
  const customers = [];
  for (let i = 1; i <= count; i++) {
    const total = randomInt(2, 50);
    const failed = randomInt(1, Math.max(1, Math.floor(total * 0.3)));
    const successful = total - failed;
    const totalSpent = successful * randomInt(500, 5000);
    const recoveries = randomInt(0, Math.min(failed, 3));

    customers.push({
      customerId: `CUS${String(i).padStart(5, '0')}`,
      name: `Customer ${i}`,
      email: `customer${i}@example.com`,
      totalTransactions: total,
      successfulTransactions: successful,
      failedTransactions: failed,
      totalSpent,
      averageTransactionValue: Math.round(totalSpent / Math.max(successful, 1)),
      previousRecoveries: recoveries,
      successRate: parseFloat((successful / total).toFixed(2)),
      customerSince: new Date(Date.now() - randomInt(30, 730) * 24 * 60 * 60 * 1000),
      riskProfile: successful / total > 0.8 ? 'LOW' : successful / total > 0.6 ? 'MEDIUM' : 'HIGH'
    });
  }
  return customers;
}

function generateTransactions(customers, count = 10000) {
  const transactions = [];
  const now = Date.now();

  for (let i = 1; i <= count; i++) {
    const customer = customers[randomInt(0, customers.length - 1)];
    const failureReason = weightedRandom(FAILURE_REASONS, FAILURE_WEIGHTS);
    const paymentMethod = weightedRandom(PAYMENT_METHODS, METHOD_WEIGHTS);
    const createdAt = new Date(now - randomInt(1, 48) * 60 * 60 * 1000);
    const retryCount = failureReason === 'REPEATED_FAILURE' ? randomInt(1, 3) : randomInt(0, 1);

    // Amount ranges by method (realistic INR amounts)
    const amountRanges = {
      UPI: [100, 4999],
      CARD: [500, 15000],
      NETBANKING: [1000, 20000],
      WALLET: [50, 2000]
    };
    const [minAmt, maxAmt] = amountRanges[paymentMethod];
    const amount = randomInt(minAmt, maxAmt);

    transactions.push({
      transactionId: `TXN${String(i).padStart(6, '0')}`,
      customerId: customer.customerId,
      amount,
      currency: 'INR',
      paymentMethod,
      status: 'FAILED',
      failureReason,
      retryCount,
      recoveryAttempts: 0,
      revenueRecovered: 0,
      createdAt,
      lastAttemptAt: new Date(createdAt.getTime() + randomInt(1, 10) * 60 * 1000)
    });
  }
  return transactions;
}

async function seed() {
  console.log('🌱 Starting seed...');
  console.log('Using MongoDB URI:', process.env.MONGODB_URI);
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Transaction.deleteMany({});
  await Customer.deleteMany({});
  console.log('🧹 Cleared existing data');

  // Generate and insert customers
  const customers = generateCustomers(2000);
  await Customer.insertMany(customers);
  console.log(`✅ Inserted ${customers.length} customers`);

  // Generate and insert transactions in batches
  const transactions = generateTransactions(customers, 10000);
  const BATCH = 1000;
  for (let i = 0; i < transactions.length; i += BATCH) {
    await Transaction.insertMany(transactions.slice(i, i + BATCH));
    console.log(`  → Inserted transactions ${i + 1}–${Math.min(i + BATCH, transactions.length)}`);
  }

  console.log(`\n✅ Seed complete!`);
  console.log(`   Customers:    ${customers.length}`);
  console.log(`   Transactions: ${transactions.length}`);
  console.log(`   Revenue at risk: ₹${transactions.reduce((s, t) => s + t.amount, 0).toLocaleString('en-IN')}`);

  await mongoose.disconnect();
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
