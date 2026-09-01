import { useState } from 'react';
import { runAgentRecovery, analyzeRecovery } from '../api';
import { formatINR, formatDate, statusBadge, failureLabel, ProbBar } from '../components/utils';
import RazorpayCheckoutModal from '../components/RazorpayCheckoutModal';

export default function AIDecisionView({ selectedTxnId, setSelectedTxnId, onNavigate }) {
  const [txnInput, setTxnInput] = useState(selectedTxnId || '');
  const [analysis, setAnalysis] = useState(null);
  const [agentResult, setAgentResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!txnInput.trim()) return;
    setLoading(true); setError(''); setAnalysis(null); setAgentResult(null);
    try {
      const r = await analyzeRecovery(txnInput.trim());
      setAnalysis(r.data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  const handleRunAgent = async () => {
    if (!txnInput.trim()) return;
    setAgentLoading(true); setError('');
    try {
      const r = await runAgentRecovery(txnInput.trim());
      setAgentResult(r.data);
      if (analysis) setAnalysis(a => ({ ...a, transaction: { ...a.transaction, status: r.data.status } }));
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally { setAgentLoading(false); }
  };

  const txn = analysis?.transaction;
  const pred = analysis?.prediction;

  return (
    <div className="animate-in">
      <div className="page-header">
        <p>Recovery Decision Engine</p>
        <h2>Decision Breakdown</h2>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Transaction ID</label>
            <input
              placeholder="e.g. TXN000001"
              value={txnInput}
              onChange={e => setTxnInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            />
          </div>
          <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading}>
            {loading ? <><div className="spinner" /> Analyzing...</> : '🔍 Analyze'}
          </button>
        </div>
        {error && <div style={{ marginTop: 10, color: 'var(--accent-red)', fontSize: 13 }}>⚠️ {error}</div>}
      </div>

      {txn && (
        <>
          {/* Transaction Details */}
          <div className="card-grid card-grid-2" style={{ marginBottom: 20 }}>
            <div className="card">
              <div className="section-title">💳 Transaction Details</div>
              {[
                ['Transaction ID', <code style={{ color: 'var(--accent-blue)' }}>{txn.transactionId}</code>],
                ['Customer ID',    txn.customerId],
                ['Amount',         <strong>{formatINR(txn.amount)}</strong>],
                ['Currency',       txn.currency],
                ['Payment Method', <span className="badge badge-info">{txn.paymentMethod}</span>],
                ['Failure Reason', <span className="badge badge-danger">{failureLabel(txn.failureReason)}</span>],
                ['Retry Count',    txn.retryCount],
                ['Status',         <span className={`badge ${statusBadge(txn.status)}`}>{txn.status}</span>],
                ['Created At',     formatDate(txn.createdAt)],
              ].map(([l, v]) => (
                <div key={l} className="stat-row"><span className="stat-label">{l}</span><span className="stat-value">{v}</span></div>
              ))}
            </div>

            <div className="card">
              <div className="section-title">🧠 ML Prediction</div>
              {pred && (
                <>
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: 48, fontWeight: 800, color: pred.recoveryProbability >= 0.65 ? 'var(--accent-green)' : pred.recoveryProbability >= 0.40 ? 'var(--accent-yellow)' : 'var(--accent-red)' }}>
                      {(pred.recoveryProbability * 100).toFixed(1)}%
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Recovery Probability</div>
                  </div>
                  <ProbBar prob={pred.recoveryProbability} />
                  <div style={{ marginTop: 16 }}>
                    {[
                      ['Risk Level',          <span className={`badge ${pred.riskLevel === 'LOW' ? 'badge-success' : pred.riskLevel === 'MEDIUM' ? 'badge-warning' : 'badge-danger'}`}>{pred.riskLevel}</span>],
                      ['Recommended Action', pred.recommendedAction],
                      ['Model Version',       pred.modelVersion],
                    ].map(([l, v]) => (
                      <div key={l} className="stat-row"><span className="stat-label">{l}</span><span className="stat-value">{v}</span></div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Policy Checks */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="section-title">🛡️ Policy Engine Checks (RETRY_PAYMENT)</div>
            {analysis.policyChecks?.RETRY_PAYMENT?.checks?.map((c, i) => (
              <div key={i} className={`policy-check ${c.passed ? 'pass' : 'fail'}`}>
                <span className="icon">{c.passed ? '✅' : '❌'}</span>
                <span style={{ fontWeight: 600, minWidth: 200, fontSize: 12 }}>{c.rule}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{c.detail}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, padding: '10px 16px', borderRadius: 8, background: analysis.policyChecks?.RETRY_PAYMENT?.allowed ? 'rgba(34,208,122,0.08)' : 'rgba(255,79,106,0.08)', border: `1px solid ${analysis.policyChecks?.RETRY_PAYMENT?.allowed ? 'rgba(34,208,122,0.3)' : 'rgba(255,79,106,0.3)'}`, fontSize: 13, fontWeight: 600 }}>
              {analysis.policyChecks?.RETRY_PAYMENT?.allowed
                ? '✅ RETRY_PAYMENT is ALLOWED by policy'
                : `🚫 RETRY_PAYMENT is BLOCKED: ${analysis.policyChecks?.RETRY_PAYMENT?.reason}`}
            </div>
          </div>

          {/* Run AI Agent */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="section-title">🤖 Run Full AI Recovery Agent</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
              Triggers the Gemini AI agent to analyze this transaction using all tools, then routes through the policy engine for execution.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                className="btn btn-success"
                onClick={handleRunAgent}
                disabled={agentLoading}
                style={{ fontSize: 14, padding: '10px 24px' }}
              >
                {agentLoading
                  ? <><div className="spinner" /> AI Agent Running...</>
                  : '🚀 Run AI Recovery Agent'}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowCheckoutModal(true)}
                style={{ fontSize: 14, padding: '10px 24px' }}
              >
                💳 Live Razorpay Checkout Test
              </button>
            </div>
          </div>

          {showCheckoutModal && txn && (
            <RazorpayCheckoutModal
              transaction={txn}
              onClose={() => setShowCheckoutModal(false)}
              onSuccess={(result) => {
                setAnalysis(a => ({
                  ...a,
                  transaction: { ...a.transaction, status: 'RECOVERED', revenueRecovered: txn.amount }
                }));
              }}
            />
          )}

          {/* Agent Result */}
          {agentResult && (
            <div className="card animate-in">
              <div className="section-title">🏁 Recovery Result</div>
              <div style={{
                padding: '16px 20px',
                borderRadius: 12,
                background: agentResult.success ? 'rgba(34,208,122,0.08)' : agentResult.status === 'BLOCKED' ? 'rgba(155,109,255,0.08)' : 'rgba(255,79,106,0.08)',
                border: `1px solid ${agentResult.success ? 'rgba(34,208,122,0.3)' : agentResult.status === 'BLOCKED' ? 'rgba(155,109,255,0.3)' : 'rgba(255,79,106,0.3)'}`,
                marginBottom: 16
              }}>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{agentResult.message}</div>
                {agentResult.revenueRecovered > 0 && (
                  <div style={{ color: 'var(--accent-green)', fontSize: 24, fontWeight: 800 }}>{formatINR(agentResult.revenueRecovered)} Recovered</div>
                )}
              </div>

              {agentResult.agentDecision && (
                <div>
                  <div className="section-title">🤖 Agent Decision</div>
                  {[
                    ['Proposed Action', <span className="badge badge-info">{agentResult.agentDecision.action}</span>],
                    ['Confidence',      `${(agentResult.agentDecision.confidence * 100).toFixed(1)}%`],
                    ['Reasoning',       agentResult.agentDecision.reason],
                    ['Human Approval?', agentResult.agentDecision.requires_human_approval ? '⚠️ Yes' : '✅ No'],
                  ].map(([l, v]) => (
                    <div key={l} className="stat-row"><span className="stat-label">{l}</span><span className="stat-value">{v}</span></div>
                  ))}
                  {agentResult.agentDecision.key_factors?.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {agentResult.agentDecision.key_factors.map(f => (
                        <span key={f} className="badge badge-muted">{f}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <button className="btn btn-outline btn-sm" onClick={() => onNavigate('audit', txn.transactionId)}>
                  📋 View Audit Trail
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {!txn && !loading && (
        <div className="empty-state">
          <div className="icon">🔍</div>
          <p>Enter a Transaction ID above to see the full AI decision breakdown</p>
          <p style={{ fontSize: 12, marginTop: 8 }}>Try: TXN000001, TXN000002, etc.</p>
        </div>
      )}
    </div>
  );
}
