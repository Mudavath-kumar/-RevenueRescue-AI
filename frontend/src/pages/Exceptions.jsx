import { useEffect, useState } from 'react';
import { getExceptions, resolveException } from '../api';
import { formatINR, formatDate, statusBadge, failureLabel } from '../components/utils';

export default function Exceptions({ onNavigate, setSelectedTxnId }) {
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [feedback, setFeedback] = useState('');

  const loadExceptions = () => {
    setLoading(true);
    getExceptions()
      .then(r => setExceptions(r.data.exceptions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadExceptions();
  }, []);

  const handleResolve = async (txnId, action) => {
    setResolvingId(txnId);
    setFeedback('');
    try {
      await resolveException(txnId, {
        action,
        notes: action === 'APPROVE_MANUAL_RETRY' ? 'Approved for manual retry by operator' : 'Dismissed by operator'
      });
      setFeedback(`Transaction ${txnId} updated (${action})`);
      setExceptions(prev => prev.filter(e => e.transactionId !== txnId));
    } catch (err) {
      setFeedback(`Error resolving ${txnId}: ${err.response?.data?.error || err.message}`);
    } finally {
      setResolvingId(null);
    }
  };

  const escalated = exceptions.filter(e => e.isEscalated && !e.isPolicyBlocked);
  const blocked   = exceptions.filter(e => e.isPolicyBlocked);
  const failed    = exceptions.filter(e => !e.isEscalated && !e.isPolicyBlocked && e.status === 'FAILED');

  const ExceptionTable = ({ items, label, badge }) => (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="section-title">
        {label} <span className={`badge ${badge}`}>{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="empty-state" style={{ padding: 24 }}><p>No active exceptions in this queue</p></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Failure Reason</th>
                <th>Attempts</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(e => (
                <tr key={e.transactionId}>
                  <td><code style={{ color: 'var(--accent-blue)', fontSize: 12, fontWeight: 600 }}>{e.transactionId}</code></td>
                  <td className="muted">{e.customerId}</td>
                  <td style={{ fontWeight: 700 }}>{formatINR(e.amount)}</td>
                  <td><span className="badge badge-info">{e.paymentMethod}</span></td>
                  <td className="muted" style={{ fontSize: 11 }}>{failureLabel(e.failureReason)}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{e.recoveryAttempts}</td>
                  <td><span className={`badge ${statusBadge(e.status)}`}>{e.status}</span></td>
                  <td className="muted" style={{ fontSize: 11 }}>{formatDate(e.createdAt)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setSelectedTxnId(e.transactionId);
                          onNavigate('ai_decision', e.transactionId);
                        }}
                      >
                        Inspect
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        disabled={resolvingId === e.transactionId}
                        onClick={() => handleResolve(e.transactionId, 'APPROVE_MANUAL_RETRY')}
                      >
                        {resolvingId === e.transactionId ? '...' : 'Approve'}
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--accent-red)' }}
                        disabled={resolvingId === e.transactionId}
                        onClick={() => handleResolve(e.transactionId, 'DISMISS')}
                      >
                        Dismiss
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (loading) return <div className="loader"><div className="spinner" />Loading exceptions queue...</div>;

  return (
    <div className="animate-in">
      <div className="page-header">
        <p>Human-in-the-Loop</p>
        <h2>Exceptions Queue</h2>
      </div>

      {feedback && (
        <div style={{
          padding: '10px 16px',
          marginBottom: 18,
          borderRadius: 8,
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          color: '#1E40AF',
          fontSize: 13,
          fontWeight: 500
        }}>
          {feedback}
        </div>
      )}

      <div className="card-grid card-grid-3" style={{ marginBottom: 24 }}>
        <div className="kpi-card yellow">
          <div className="kpi-label">Human Escalations</div>
          <div className="kpi-value yellow">{escalated.length}</div>
          <div className="kpi-sub">High value / complex failures</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-label">Policy Blocked</div>
          <div className="kpi-value" style={{ color: 'var(--accent-purple)' }}>{blocked.length}</div>
          <div className="kpi-sub">Max retry or window reached</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-label">Failed Recoveries</div>
          <div className="kpi-value red">{failed.length}</div>
          <div className="kpi-sub">Needs manual intervention</div>
        </div>
      </div>

      <ExceptionTable items={escalated} label="Human Escalations Queue" badge="badge-warning" />
      <ExceptionTable items={blocked}   label="Policy Blocked Transactions" badge="badge-purple" />
      <ExceptionTable items={failed}    label="Failed Recovery Attempts" badge="badge-danger" />
    </div>
  );
}
