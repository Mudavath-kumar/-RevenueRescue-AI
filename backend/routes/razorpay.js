const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const AuditEvent = require('../models/AuditEvent');
const { v4: uuidv4 } = require('uuid');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ─── POST /api/razorpay/create-order ──────────────────────────────────────────
// Creates a Razorpay order for a recovery payment retry
router.post('/create-order', async (req, res) => {
  try {
    const { transactionId, amount, currency = 'INR' } = req.body;

    // Validate amount (minimum 100 paise = ₹1)
    const amountInPaise = Math.round((amount || 0) * 100);
    if (amountInPaise < 100) {
      return res.status(400).json({ error: 'Amount must be at least ₹1 (100 paise)' });
    }

    // Validate transactionId if provided
    let txn = null;
    if (transactionId) {
      txn = await Transaction.findOne({ transactionId });
      if (!txn) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
    }

    // Create Razorpay order
    const orderOptions = {
      amount: amountInPaise,
      currency,
      receipt: transactionId || `rcpt_${Date.now()}`,
      notes: {
        transactionId: transactionId || 'manual',
        source: 'RevenueRescue AI',
        type: 'recovery_payment'
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    // Log audit event
    if (transactionId) {
      await AuditEvent.create({
        auditId: uuidv4(),
        transactionId,
        actor: 'SYSTEM',
        action: 'RAZORPAY_ORDER_CREATED',
        reason: `Razorpay order ${order.id} created for ₹${amount}`,
        details: { orderId: order.id, amount: amountInPaise, currency },
        policyDecision: 'N/A',
        result: 'PENDING',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });

  } catch (err) {
    console.error('Razorpay create order error:', err);
    if (err.statusCode === 401) {
      return res.status(401).json({ error: 'Razorpay authentication failed. Check API keys.' });
    }
    res.status(500).json({ error: err.error?.description || err.message || 'Failed to create order' });
  }
});

// ─── POST /api/razorpay/verify-payment ────────────────────────────────────────
// Verifies payment signature using HMAC-SHA256
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, transactionId } = req.body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: razorpay_payment_id, razorpay_order_id, razorpay_signature'
      });
    }

    // Verify signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      // Log failed verification
      if (transactionId) {
        await AuditEvent.create({
          auditId: uuidv4(),
          transactionId,
          actor: 'SYSTEM',
          action: 'RAZORPAY_VERIFICATION_FAILED',
          reason: 'Payment signature mismatch — possible tampering',
          details: { razorpay_order_id, razorpay_payment_id },
          policyDecision: 'BLOCKED',
          result: 'FAILED',
          timestamp: new Date()
        });
      }

      return res.status(400).json({
        success: false,
        error: 'Payment verification failed — signature mismatch'
      });
    }

    // Payment verified — update transaction if linked
    if (transactionId) {
      await Transaction.findOneAndUpdate(
        { transactionId },
        {
          status: 'RECOVERED',
          revenueRecovered: 0, // will be set from order amount below
          recoveryAction: 'RAZORPAY_PAYMENT',
          recoveredAt: new Date(),
          lastAttemptAt: new Date()
        }
      );

      // Fetch order details to get amount
      try {
        const order = await razorpay.orders.fetch(razorpay_order_id);
        if (order?.amount) {
          await Transaction.findOneAndUpdate(
            { transactionId },
            { revenueRecovered: order.amount / 100 }
          );
        }
      } catch (_) {}

      // Log successful verification
      await AuditEvent.create({
        auditId: uuidv4(),
        transactionId,
        actor: 'SYSTEM',
        action: 'RAZORPAY_PAYMENT_VERIFIED',
        reason: `Payment ${razorpay_payment_id} verified successfully`,
        details: { razorpay_order_id, razorpay_payment_id },
        policyDecision: 'ALLOWED',
        result: 'SUCCESS',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id
    });

  } catch (err) {
    console.error('Razorpay verify error:', err);
    res.status(500).json({ error: err.message || 'Payment verification failed' });
  }
});

// ─── GET /api/razorpay/payment/:paymentId ─────────────────────────────────────
// Fetch payment details from Razorpay
router.get('/payment/:paymentId', async (req, res) => {
  try {
    const payment = await razorpay.payments.fetch(req.params.paymentId);
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
