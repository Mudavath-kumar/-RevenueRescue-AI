export function formatINR(amount) {
  if (amount === undefined || amount === null) return '₹0';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export function probColor(prob) {
  if (prob >= 0.65) return 'var(--accent-green)';
  if (prob >= 0.40) return 'var(--accent-yellow)';
  return 'var(--accent-red)';
}

export function statusBadge(status) {
  const map = {
    RECOVERED: 'badge-success',
    FAILED:    'badge-danger',
    ESCALATED: 'badge-warning',
    BLOCKED:   'badge-purple',
    PENDING:   'badge-info',
    SUCCESS:   'badge-success'
  };
  return map[status] || 'badge-muted';
}

export function failureLabel(reason) {
  const labels = {
    TEMPORARY_BANK_FAILURE: 'Bank Failure',
    NETWORK_FAILURE:        'Network Error',
    INSUFFICIENT_FUNDS:     'Insufficient Funds',
    EXPIRED_PAYMENT_METHOD: 'Expired Method',
    PAYMENT_METHOD_ISSUE:   'Method Issue',
    REPEATED_FAILURE:       'Repeated Failure',
    UNKNOWN:                'Unknown'
  };
  return labels[reason] || reason;
}

export function ProbBar({ prob }) {
  const color = probColor(prob);
  return (
    <div className="prob-bar">
      <div className="prob-bar-track">
        <div
          className="prob-bar-fill"
          style={{ width: `${(prob * 100).toFixed(0)}%`, background: color }}
        />
      </div>
      <span className="prob-text" style={{ color }}>{(prob * 100).toFixed(0)}%</span>
    </div>
  );
}
