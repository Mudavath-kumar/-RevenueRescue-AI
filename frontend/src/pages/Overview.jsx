import { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { getDashboardMetrics } from '../api';
import { formatINR } from '../components/utils';

const COLORS = ['#2563EB', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4', '#F97316'];

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
          {p.name}: {typeof p.value === 'number' && p.value > 1000 ? formatINR(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Overview({ onNavigate }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardMetrics()
      .then(r => setMetrics(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /><span>Loading metrics...</span></div>;
  if (!metrics) return <div className="empty-state"><div className="icon">⚠️</div><p>Could not load metrics. Is the backend running?</p></div>;

  const { summary, funnel, dailyRecovery, failureBreakdown } = metrics;

  const primaryKPIs = [
    { label: 'Revenue at Risk',    value: formatINR(summary.revenueAtRisk),    color: 'red',    sub: `${summary.failedTransactions.toLocaleString()} failed transactions` },
    { label: 'Revenue Recovered',  value: formatINR(summary.revenueRecovered),  color: 'green',  sub: `${summary.recoveredTransactions.toLocaleString()} transactions recovered` },
    { label: 'Recovery Rate',      value: `${summary.recoveryRate}%`,           color: 'blue',   sub: 'Of eligible at-risk transactions' },
    { label: 'Net Value Created',  value: formatINR(summary.netRecovery),       color: 'green',  sub: `After ${formatINR(summary.interventionCost)} intervention cost` },
  ];

  const operationalKPIs = [
    { label: 'Successful Recoveries', value: summary.successfulInterventions?.toLocaleString() || '0', color: 'green', sub: 'Verified payments' },
    { label: 'Failed Interventions',  value: summary.failedInterventions?.toLocaleString() || '0',  color: 'red',   sub: 'Stopped per policy limits' },
    { label: 'Human Escalations',     value: summary.escalatedTransactions?.toLocaleString() || '0', color: 'yellow',sub: 'Routed to ops team' },
    { label: 'Unresolved Exceptions', value: summary.unresolvedExceptions?.toLocaleString() || '0',  color: 'yellow',sub: `${summary.blockedTransactions} policy blocked` },
  ];

  const funnelData = [
    { stage: 'At Risk', count: funnel.atRisk },
    { stage: 'Attempted', count: funnel.attempted },
    { stage: 'Recovered', count: funnel.recovered }
  ];

  const failureData = (failureBreakdown || []).map(f => ({
    name: f._id?.replace(/_/g, ' '),
    value: f.count
  }));

  return (
    <div className="animate-in">
      <div className="page-header">
        <p>Recovery Intelligence</p>
        <h2>Platform Overview</h2>
      </div>

      {/* Primary Financial KPIs */}
      <div className="card-grid card-grid-4" style={{ marginBottom: 16 }}>
        {primaryKPIs.map((k, i) => (
          <div key={i} className={`kpi-card ${k.color}`}>
            <div className="kpi-label">{k.label}</div>
            <div className={`kpi-value ${k.color}`}>{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Operational Interventions KPIs */}
      <div className="card-grid card-grid-4" style={{ marginBottom: 24 }}>
        {operationalKPIs.map((k, i) => (
          <div key={i} className={`kpi-card ${k.color}`}>
            <div className="kpi-label">{k.label}</div>
            <div className={`kpi-value ${k.color}`}>{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="card-grid card-grid-2" style={{ marginBottom: 24 }}>
        {/* Revenue Trend */}
        <div className="card">
          <div className="section-title">Recovery Trend (Last 7 Days)</div>
          {dailyRecovery?.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={dailyRecovery}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="_id" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => formatINR(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="recovered" name="Recovered" stroke="#2563EB" fill="url(#grad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 32 }}>
              <p>Run some recoveries to see the trend</p>
            </div>
          )}
        </div>

        {/* Failure Breakdown */}
        <div className="card">
          <div className="section-title">Failure Reason Distribution</div>
          {failureData.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={failureData} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={3} dataKey="value">
                  {failureData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 32 }}><p>No data yet — seed the database first</p></div>
          )}
        </div>
      </div>

      <div className="card-grid card-grid-2">
        {/* Recovery Funnel */}
        <div className="card">
          <div className="section-title">Recovery Funnel</div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis dataKey="stage" type="category" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Transactions" radius={[0, 6, 6, 0]}>
                {funnelData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats */}
        <div className="card">
          <div className="section-title">Financial Summary</div>
          {[
            ['Total Transactions',     summary.totalTransactions?.toLocaleString()],
            ['At-Risk Revenue',        formatINR(summary.revenueAtRisk)],
            ['Gross Recovered',        formatINR(summary.revenueRecovered)],
            ['Intervention Costs',     formatINR(summary.interventionCost)],
            ['Net Revenue Recovered',  formatINR(summary.netRecovery)],
            ['Interventions Attempted',summary.recoveryAttempts?.toLocaleString()],
          ].map(([label, val]) => (
            <div key={label} className="stat-row">
              <span className="stat-label">{label}</span>
              <span className="stat-value">{val}</span>
            </div>
          ))}
          <button
            className="btn btn-primary"
            style={{ marginTop: 16, width: '100%' }}
            onClick={() => onNavigate('batch')}
          >
            Run Batch Evaluation
          </button>
        </div>
      </div>
    </div>
  );
}
