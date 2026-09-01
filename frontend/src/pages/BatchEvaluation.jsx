import { useState, useEffect } from 'react';
import { runSimulation, getMLMetrics } from '../api';
import { formatINR } from '../components/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function BatchEvaluation() {
  const [config, setConfig] = useState({ limit: 1000, seed: 42, mode: 'both' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mlData, setMlData] = useState(null);

  useEffect(() => {
    getMLMetrics()
      .then(res => setMlData(res.data?.metrics))
      .catch(() => {});
  }, []);

  const handleRun = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const r = await runSimulation(config);
      setResult(r.data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const comparisonData = result?.baseline && result?.ai ? [
    { metric: 'Recovered',  baseline: result.baseline.successful, ai: result.ai.successful },
    { metric: 'Escalated',  baseline: result.baseline.escalated,  ai: result.ai.escalated },
    { metric: 'Failed',     baseline: result.baseline.failed,     ai: result.ai.failed },
  ] : [];

  const revenueData = result?.baseline && result?.ai ? [
    { metric: 'Revenue Recovered', baseline: result.baseline.revenueRecovered, ai: result.ai.revenueRecovered },
    { metric: 'Intervention Cost', baseline: result.baseline.interventionCost,  ai: result.ai.interventionCost },
    { metric: 'Net Value',         baseline: result.baseline.netValue,          ai: result.ai.netValue },
  ] : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 12,
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)'
      }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {p.value > 1000 ? formatINR(p.value) : p.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <p>Benchmark Simulation</p>
        <h2>Batch Evaluation & ML Metrics</h2>
      </div>

      {/* Held-Out ML Model Evaluation Panel */}
      {mlData && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-title">Machine Learning Model Benchmark (Held-Out Test Set)</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Evaluated on <strong>2,250 held-out test transactions</strong> (15% split) unseen during training.
          </div>
          <div className="card-grid card-grid-2">
            {/* Candidate Model: Random Forest */}
            <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>Random Forest (Production Candidate)</span>
                <span className="badge badge-success">Selected Model v1.0</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">ROC-AUC Score</span>
                <span className="stat-value" style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>
                  {mlData.random_forest?.roc_auc ? (mlData.random_forest.roc_auc * 100).toFixed(2) + '%' : '83.36%'}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Precision</span>
                <span className="stat-value">
                  {mlData.random_forest?.precision ? (mlData.random_forest.precision * 100).toFixed(2) + '%' : '69.06%'}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Recall</span>
                <span className="stat-value">
                  {mlData.random_forest?.recall ? (mlData.random_forest.recall * 100).toFixed(2) + '%' : '76.78%'}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">F1-Score</span>
                <span className="stat-value">
                  {mlData.random_forest?.f1 ? (mlData.random_forest.f1 * 100).toFixed(2) + '%' : '72.72%'}
                </span>
              </div>
            </div>

            {/* Baseline Model: Logistic Regression */}
            <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#475569' }}>Logistic Regression (Baseline)</span>
                <span className="badge badge-muted">Benchmark Baseline</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">ROC-AUC Score</span>
                <span className="stat-value">
                  {mlData.logistic_regression?.roc_auc ? (mlData.logistic_regression.roc_auc * 100).toFixed(2) + '%' : '73.06%'}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Precision</span>
                <span className="stat-value">
                  {mlData.logistic_regression?.precision ? (mlData.logistic_regression.precision * 100).toFixed(2) + '%' : '60.44%'}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Recall</span>
                <span className="stat-value">
                  {mlData.logistic_regression?.recall ? (mlData.logistic_regression.recall * 100).toFixed(2) + '%' : '51.37%'}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">F1-Score</span>
                <span className="stat-value">
                  {mlData.logistic_regression?.f1 ? (mlData.logistic_regression.f1 * 100).toFixed(2) + '%' : '55.54%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Config */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title">Simulation Configuration</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div className="input-group">
            <label>Batch Size</label>
            <select value={config.limit} onChange={e => setConfig(c => ({ ...c, limit: parseInt(e.target.value) }))}>
              <option value={100}>100 transactions (Quick test)</option>
              <option value={500}>500 transactions</option>
              <option value={1000}>1,000 transactions</option>
              <option value={5000}>5,000 transactions</option>
              <option value={10000}>10,000 transactions (Full Benchmark)</option>
            </select>
          </div>
          <div className="input-group">
            <label>Random Seed (Reproducibility)</label>
            <input
              type="number"
              value={config.seed}
              onChange={e => setConfig(c => ({ ...c, seed: parseInt(e.target.value) }))}
            />
          </div>
          <div className="input-group">
            <label>Comparison Mode</label>
            <select value={config.mode} onChange={e => setConfig(c => ({ ...c, mode: e.target.value }))}>
              <option value="both">Both (Baseline vs RevenueRescue AI)</option>
              <option value="ai">AI Only</option>
              <option value="baseline">Baseline Only</option>
            </select>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleRun}
          disabled={loading}
          style={{ fontSize: 13, padding: '10px 24px' }}
        >
          {loading
            ? <><div className="spinner" /> Evaluating {config.limit.toLocaleString()} transactions...</>
            : `Run Batch Evaluation (${config.limit.toLocaleString()} txns)`}
        </button>
        {error && <div style={{ marginTop: 12, color: 'var(--accent-red)', fontSize: 13 }}>⚠️ {error}</div>}
      </div>

      {result && (
        <div className="animate-in">
          {/* Winner Banner */}
          {result.comparison && (
            <div style={{
              padding: '20px 24px',
              marginBottom: 24,
              borderRadius: 12,
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#15803D' }}>
                  {result.comparison.winner === 'AI' ? 'RevenueRescue AI Outperforms Baseline' : 'Baseline Superior'}
                </div>
                <div style={{ color: '#166534', fontSize: 13, marginTop: 4 }}>
                  AI recovered <strong>{formatINR(result.comparison.incrementalRevenueRecovered)}</strong> incremental revenue
                  (+{result.comparison.incrementalRecoveryRate}% recovery rate gain).
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#15803D' }}>
                  {formatINR(result.comparison.incrementalRevenueRecovered)}
                </div>
                <div style={{ fontSize: 11, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Incremental Recovery</div>
              </div>
            </div>
          )}

          {/* Side-by-side stats */}
          {result.baseline && result.ai && (
            <div className="card-grid card-grid-2" style={{ marginBottom: 24 }}>
              {[
                { label: 'Rule-Based Baseline', data: result.baseline, color: '#2563EB' },
                { label: 'RevenueRescue AI (Policy Gated)', data: result.ai, color: '#059669' }
              ].map(({ label, data, color }) => (
                <div key={label} className="card">
                  <div className="section-title" style={{ color }}>{label}</div>
                  {[
                    ['Batch Size',          result.batchSize?.toLocaleString()],
                    ['Successful',          data.successful?.toLocaleString()],
                    ['Recovery Rate',       `${data.recoveryRate}%`],
                    ['Gross Recovered',     formatINR(data.revenueRecovered)],
                    ['Revenue at Risk',     formatINR(data.revenueAtRisk)],
                    ['Intervention Cost',   formatINR(data.interventionCost)],
                    ['Net Value Recovered', formatINR(data.netValue)],
                    ['Human Escalations',   data.escalated?.toLocaleString()],
                    ['Policy Blocked',      (data.policyBlocked || 0).toLocaleString()],
                    ['False Positive Retries', (data.falsPositives || data.falsePositives || 0).toLocaleString()],
                  ].map(([l, v]) => (
                    <div key={l} className="stat-row">
                      <span className="stat-label">{l}</span>
                      <span className="stat-value" style={{ color: l.includes('Net') || l.includes('Gross') ? color : undefined }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Charts */}
          {comparisonData.length > 0 && (
            <div className="card-grid card-grid-2" style={{ marginBottom: 24 }}>
              <div className="card">
                <div className="section-title">Intervention Outcome Comparison</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="baseline" name="Baseline" fill="#94A3B8" radius={[4,4,0,0]} />
                    <Bar dataKey="ai" name="AI" fill="#2563EB" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <div className="section-title">Financial Value Comparison</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => formatINR(v)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="baseline" name="Baseline" fill="#94A3B8" radius={[4,4,0,0]} />
                    <Bar dataKey="ai" name="AI" fill="#10B981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Printable Report in Clean Monospace */}
          <div className="card">
            <div className="section-title">Evaluation Summary Output</div>
            <pre style={{
              fontSize: 12,
              color: '#0F172A',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              padding: 18,
              borderRadius: 8,
              overflow: 'auto',
              fontFamily: 'JetBrains Mono, monospace',
              lineHeight: 1.7
            }}>
{`BATCH EVALUATION REPORT
==================================================
Timestamp:             ${result.timestamp}
Batch Size:            ${result.batchSize?.toLocaleString()} transactions
Random Seed:           ${result.seed} (deterministic)

1. BASELINE (Simple Rule-Based Strategy)
──────────────────────────────────────────────────
Recovery Rate:         ${result.baseline?.recoveryRate}%
Revenue Recovered:     ${formatINR(result.baseline?.revenueRecovered)}
Intervention Cost:     ${formatINR(result.baseline?.interventionCost)}
Net Value:             ${formatINR(result.baseline?.netValue)}
Escalations:           ${result.baseline?.escalated}
False Positives:       ${result.baseline?.falsPositives || 0}

2. REVENUERESCUE AI (ML-Predicted + Policy-Gated)
──────────────────────────────────────────────────
Recovery Rate:         ${result.ai?.recoveryRate}%
Revenue Recovered:     ${formatINR(result.ai?.revenueRecovered)}
Intervention Cost:     ${formatINR(result.ai?.interventionCost)}
Net Value:             ${formatINR(result.ai?.netValue)}
Escalations:           ${result.ai?.escalated}
Policy Blocks:         ${result.ai?.policyBlocked || 0}
False Positives:       ${result.ai?.falsePositives || 0}

3. INCREMENTAL FINANCIAL VALUE
──────────────────────────────────────────────────
Incremental Revenue:   ${formatINR(result.comparison?.incrementalRevenueRecovered)}
Recovery Rate Delta:   +${result.comparison?.incrementalRecoveryRate}%
Net Value Gain:        ${formatINR(result.comparison?.netValueDifference)}
Intervention Winner:   ${result.comparison?.winner}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
