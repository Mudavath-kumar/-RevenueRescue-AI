import { useState } from 'react';
import { getAuditTrail } from '../api';
import { formatDate, statusBadge } from '../components/utils';

const ACTOR_COLORS = {
  SYSTEM:            'var(--text-muted)',
  AI_AGENT:          'var(--accent-blue)',
  ML_SERVICE:        'var(--accent-purple)',
  POLICY_ENGINE:     'var(--accent-yellow)',
  PAYMENT_SIMULATOR: 'var(--accent-green)',
  HUMAN:             'var(--accent-cyan)'
};

const ACTOR_ICONS = {
  SYSTEM:            '⚙️',
  AI_AGENT:          '🤖',
  ML_SERVICE:        '🧠',
  POLICY_ENGINE:     '🛡️',
  PAYMENT_SIMULATOR: '💳',
  HUMAN:             '👤'
};

function dotClass(event) {
  if (event.result === 'SUCCESS') return 'success';
  if (event.result === 'FAILED') return 'failed';
  if (event.policyDecision === 'BLOCKED') return 'escalated';
  return '';
}

export default function AuditTrail({ selectedTxnId }) {
  const [txnId, setTxnId] = useState(selectedTxnId || '');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!txnId.trim()) return;
    setLoading(true); setSearched(true);
    try {
      const r = await getAuditTrail(txnId.trim());
      setEvents(r.data.events || []);
    } catch (e) {
      setEvents([]);
    } finally { setLoading(false); }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <p>Immutable Event Log</p>
        <h2>Audit Trail</h2>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Transaction ID</label>
            <input
              placeholder="e.g. TXN000001"
              value={txnId}
              onChange={e => setTxnId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
            {loading ? <><div className="spinner" /> Loading...</> : '📋 Load Audit Trail'}
          </button>
        </div>
      </div>

      {loading && <div className="loader"><div className="spinner" />Loading audit events...</div>}

      {!loading && searched && events.length === 0 && (
        <div className="empty-state">
          <div className="icon">📭</div>
          <p>No audit events found for this transaction</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Run an AI recovery first to generate events</p>
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="card">
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="section-title" style={{ margin: 0 }}>
              {events.length} Events for {txnId}
            </div>
            <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-muted)' }}>
              {Object.entries(ACTOR_ICONS).map(([actor, icon]) => (
                <span key={actor} style={{ color: ACTOR_COLORS[actor] }}>{icon} {actor.replace(/_/g,' ')}</span>
              ))}
            </div>
          </div>

          <div className="timeline">
            {events.map((event, i) => (
              <div key={event.auditId || i} className="timeline-item">
                <div className={`timeline-dot ${dotClass(event)}`} />
                <div className="timeline-time">{formatDate(event.timestamp)}</div>
                <div className="timeline-action" style={{ color: ACTOR_COLORS[event.actor] || 'var(--text-primary)' }}>
                  {ACTOR_ICONS[event.actor] || '•'} [{event.actor}] {event.action}
                </div>
                <div className="timeline-reason">{event.reason}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                  {event.policyDecision && event.policyDecision !== 'N/A' && (
                    <span className={`badge ${event.policyDecision === 'ALLOWED' ? 'badge-success' : event.policyDecision === 'BLOCKED' ? 'badge-danger' : 'badge-warning'}`}>
                      Policy: {event.policyDecision}
                    </span>
                  )}
                  {event.result && event.result !== 'N/A' && (
                    <span className={`badge ${statusBadge(event.result)}`}>Result: {event.result}</span>
                  )}
                  {event.revenueRecovered > 0 && (
                    <span className="badge badge-success">💰 ₹{event.revenueRecovered.toLocaleString('en-IN')} recovered</span>
                  )}
                </div>
                {event.details && Object.keys(event.details).length > 0 && (
                  <details style={{ marginTop: 6 }}>
                    <summary style={{ fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer' }}>View details</summary>
                    <pre style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: 8, borderRadius: 4, marginTop: 4, overflow: 'auto' }}>
                      {JSON.stringify(event.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
