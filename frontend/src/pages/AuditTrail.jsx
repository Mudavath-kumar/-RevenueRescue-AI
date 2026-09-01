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
        <p>Immutable Event Ledger</p>
        <h2>Immutable <span className="italic-serif">Audit Trail</span></h2>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Transaction Identifier</label>
            <input
              placeholder="e.g. TXN000001, TXN001741"
              value={txnId}
              onChange={e => setTxnId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
            {loading ? <><div className="spinner" /> Loading...</> : 'Load Audit Trail'}
          </button>
        </div>
      </div>

      {loading && <div className="loader"><div className="spinner" /><span>Loading immutable audit events...</span></div>}

      {!loading && searched && events.length === 0 && (
        <div className="empty-state">
          <p>No audit events recorded for this transaction yet</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Execute an autonomous recovery to generate event telemetry</p>
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="card">
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div className="section-title" style={{ margin: 0 }}>
              {events.length} Events for <code style={{ color: 'var(--accent-blue)', marginLeft: 4 }}>{txnId}</code>
            </div>
            <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              {Object.keys(ACTOR_COLORS).map((actor) => (
                <span key={actor} style={{ color: ACTOR_COLORS[actor], fontWeight: 700 }}>
                  ● {actor.replace(/_/g,' ')}
                </span>
              ))}
            </div>
          </div>

          <div className="timeline">
            {events.map((event, i) => (
              <div key={event.auditId || i} className="timeline-item">
                <div className={`timeline-dot ${dotClass(event)}`} />
                <div className="timeline-time">{formatDate(event.timestamp)}</div>
                <div className="timeline-action" style={{ color: ACTOR_COLORS[event.actor] || 'var(--text-primary)' }}>
                  [{event.actor}] {event.action}
                </div>
                <div className="timeline-reason">{event.reason}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  {event.policyDecision && event.policyDecision !== 'N/A' && (
                    <span className={`badge ${event.policyDecision === 'ALLOWED' ? 'badge-success' : event.policyDecision === 'BLOCKED' ? 'badge-danger' : 'badge-warning'}`}>
                      Policy: {event.policyDecision}
                    </span>
                  )}
                  {event.result && event.result !== 'N/A' && (
                    <span className={`badge ${statusBadge(event.result)}`}>Result: {event.result}</span>
                  )}
                  {event.revenueRecovered > 0 && (
                    <span className="badge badge-success" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      ₹{event.revenueRecovered.toLocaleString('en-IN')} recovered
                    </span>
                  )}
                </div>
                {event.details && Object.keys(event.details).length > 0 && (
                  <details style={{ marginTop: 6 }}>
                    <summary style={{ fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}>View payload details</summary>
                    <pre style={{ fontSize: 10.5, color: 'var(--text-secondary)', background: 'var(--bg-subtle)', padding: 10, borderRadius: 6, marginTop: 4, overflow: 'auto', fontFamily: 'JetBrains Mono, monospace' }}>
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
