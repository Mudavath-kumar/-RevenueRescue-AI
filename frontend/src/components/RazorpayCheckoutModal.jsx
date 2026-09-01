import { useState } from 'react';
import { createRazorpayOrder, verifyRazorpayPayment } from '../api';
import { formatINR } from './utils';

export default function RazorpayCheckoutModal({ transaction, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null); // 'SUCCESS', 'FAILED', null

  const handlePayNow = async () => {
    if (!window.Razorpay) {
      setError('Razorpay SDK not loaded. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create order on backend
      const orderRes = await createRazorpayOrder({
        transactionId: transaction.transactionId,
        amount: transaction.amount,
        currency: transaction.currency || 'INR'
      });

      const { order_id, amount, currency, key_id } = orderRes.data;

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'RevenueRescue AI',
        description: `Recovery Payment for ${transaction.transactionId}`,
        order_id: order_id,
        prefill: {
          name: transaction.customerId || 'Customer',
          email: `${transaction.customerId?.toLowerCase() || 'customer'}@example.com`,
          contact: '9999999999'
        },
        theme: {
          color: '#4f8cff'
        },
        handler: async function (response) {
          // 3. Verify payment signature on backend
          try {
            const verifyRes = await verifyRazorpayPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              transactionId: transaction.transactionId
            });

            if (verifyRes.data.success) {
              setPaymentStatus('SUCCESS');
              if (onSuccess) onSuccess(verifyRes.data);
            } else {
              setPaymentStatus('FAILED');
              setError(verifyRes.data.error || 'Payment signature verification failed.');
            }
          } catch (err) {
            setPaymentStatus('FAILED');
            setError(err.response?.data?.error || err.message || 'Verification failed');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            console.log('Razorpay modal dismissed by user');
          }
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        setLoading(false);
        setPaymentStatus('FAILED');
        setError(response.error?.description || 'Payment attempt failed.');
      });

      rzp.open();

    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || err.message || 'Failed to initialize payment.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(10, 14, 26, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="card" style={{ maxWidth: 460, width: '90%', padding: 28, position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16, right: 16,
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: 20,
            cursor: 'pointer'
          }}
        >
          ✕
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(37, 99, 235, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-blue)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Razorpay Test Checkout</h3>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
          Test standard web checkout to recover payment for transaction <strong>{transaction.transactionId}</strong>.
        </p>

        <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 8, marginBottom: 20 }}>
          <div className="stat-row">
            <span className="stat-label">Transaction ID</span>
            <span className="stat-value"><code style={{ color: 'var(--accent-blue)' }}>{transaction.transactionId}</code></span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Customer ID</span>
            <span className="stat-value">{transaction.customerId}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Recovery Amount</span>
            <span className="stat-value" style={{ color: 'var(--accent-green)', fontSize: 16 }}>{formatINR(transaction.amount)}</span>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255, 79, 106, 0.1)',
            border: '1px solid rgba(255, 79, 106, 0.3)',
            color: 'var(--accent-red)',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: 12,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span style={{ fontWeight: 800 }}>!</span>
            <span>{error}</span>
          </div>
        )}

        {paymentStatus === 'SUCCESS' ? (
          <div style={{
            background: 'rgba(34, 208, 122, 0.1)',
            border: '1px solid rgba(34, 208, 122, 0.3)',
            color: 'var(--accent-green)',
            padding: '14px',
            borderRadius: 8,
            textAlign: 'center',
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 16
          }}>
            <span style={{ fontWeight: 800, marginRight: 6 }}>✓</span> Payment of {formatINR(transaction.amount)} successfully recovered & verified!
            <div style={{ marginTop: 12 }}>
              <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={handlePayNow}
              disabled={loading}
            >
              {loading ? <><div className="spinner" /> Initializing...</> : `Pay ${formatINR(transaction.amount)} with Razorpay`}
            </button>
            <button className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Razorpay Standard Web Checkout (Test Mode)</span>
        </div>
      </div>
    </div>
  );
}
