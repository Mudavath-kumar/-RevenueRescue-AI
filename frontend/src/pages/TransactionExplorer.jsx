import { useEffect, useState } from 'react';
import { getTransactions } from '../api';
import { formatINR, formatDate, statusBadge, failureLabel, ProbBar } from '../components/utils';

const STATUSES  = ['', 'FAILED', 'RECOVERED', 'ESCALATED', 'BLOCKED', 'PENDING'];
const METHODS   = ['', 'UPI', 'CARD', 'NETBANKING', 'WALLET'];
const REASONS   = ['', 'TEMPORARY_BANK_FAILURE', 'NETWORK_FAILURE', 'INSUFFICIENT_FUNDS',
                   'EXPIRED_PAYMENT_METHOD', 'PAYMENT_METHOD_ISSUE', 'REPEATED_FAILURE', 'UNKNOWN'];

export default function TransactionExplorer({ onNavigate, setSelectedTxnId }) {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', paymentMethod: '', failureReason: '', search: '' });

  const load = (p = 1, f = filters) => {
    setLoading(true);
    getTransactions({ ...f, page: p, limit: 50 })
      .then(r => { setTransactions(r.data.transactions); setTotal(r.data.total); setPage(p); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

  const applyFilter = () => load(1);

  const handleRowClick = (txnId) => {
    setSelectedTxnId(txnId);
    onNavigate('ai_decision', txnId);
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <p>Ledger Intelligence</p>
        <h2>Transaction Explorer</h2>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 12 }}>
          <div className="input-group">
            <label>Search</label>
            <input
              placeholder="TXN ID or Customer ID..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
          <div className="input-group">
            <label>Status</label>
            <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Payment Method</label>
            <select value={filters.paymentMethod} onChange={e => setFilters(f => ({ ...f, paymentMethod: e.target.value }))}>
              {METHODS.map(m => <option key={m} value={m}>{m || 'All Methods'}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Failure Reason</label>
            <select value={filters.failureReason} onChange={e => setFilters(f => ({ ...f, failureReason: e.target.value }))}>
              {REASONS.map(r => <option key={r} value={r}>{r ? failureLabel(r) : 'All Reasons'}</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={applyFilter}>🔍 Apply Filters</button>
        <button className="btn btn-outline btn-sm" style={{ marginLeft: 8 }} onClick={() => { setFilters({ status: '', paymentMethod: '', failureReason: '', search: '' }); load(1, {}); }}>✕ Clear</button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Failure Reason</th>
                <th>Recovery Prob.</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}><div className="loader"><div className="spinner" />Loading...</div></td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><p>No transactions found</p></div></td></tr>
              ) : transactions.map(t => (
                <tr key={t.transactionId} onClick={() => handleRowClick(t.transactionId)} title="Click to view AI Decision">
                  <td><code style={{ color: 'var(--accent-blue)', fontSize: 12 }}>{t.transactionId}</code></td>
                  <td className="muted">{t.customerId}</td>
                  <td style={{ fontWeight: 700 }}>{formatINR(t.amount)}</td>
                  <td><span className="badge badge-info">{t.paymentMethod}</span></td>
                  <td className="muted" style={{ fontSize: 11 }}>{failureLabel(t.failureReason)}</td>
                  <td>
                    {t.recoveryProbability != null
                      ? <ProbBar prob={t.recoveryProbability} />
                      : <span className="muted">—</span>}
                  </td>
                  <td><span className={`badge ${statusBadge(t.status)}`}>{t.status}</span></td>
                  <td className="muted" style={{ fontSize: 11 }}>{formatDate(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>Showing {transactions.length} of {total.toLocaleString()}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={() => load(page - 1)} disabled={page <= 1}>‹ Prev</button>
            <span style={{ padding: '5px 12px', background: 'var(--bg-secondary)', borderRadius: 6 }}>Page {page}</span>
            <button className="btn btn-outline btn-sm" onClick={() => load(page + 1)} disabled={transactions.length < 50}>Next ›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
