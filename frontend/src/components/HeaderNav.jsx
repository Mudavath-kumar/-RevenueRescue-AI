import { useState, useEffect } from 'react';
import { getExceptions } from '../api';

const NAV_TABS = [
  { id: 'overview',     label: 'Overview' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'ai_decision',  label: 'Decision Engine' },
  { id: 'audit',        label: 'Audit Trail' },
  { id: 'exceptions',   label: 'Exceptions' },
  { id: 'batch',        label: 'Batch Simulator' },
];

export default function HeaderNav({ activePage, onNavigate, onQuickSearch }) {
  const [exceptionCount, setExceptionCount] = useState(0);

  useEffect(() => {
    getExceptions()
      .then(res => {
        if (res.data && res.data.count) {
          setExceptionCount(res.data.count);
        }
      })
      .catch(() => {});
  }, [activePage]);

  return (
    <header className="top-nav-bar">
      <div className="top-nav-container">
        {/* Left: Custom Geometric Brand Mark */}
        <div className="brand-cluster" onClick={() => onNavigate('overview')}>
          <div className="brand-logo-mark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">RescueFlow</span>
            <span className="brand-badge">Autonomous</span>
          </div>
        </div>

        {/* Center: Sleek Segmented Navigation Pills */}
        <nav className="nav-pill-cluster">
          {NAV_TABS.map((tab) => {
            const isActive = activePage === tab.id;
            return (
              <button
                key={tab.id}
                className={`nav-pill-btn ${isActive ? 'active' : ''}`}
                onClick={() => onNavigate(tab.id)}
              >
                <span>{tab.label}</span>
                {tab.id === 'exceptions' && exceptionCount > 0 && (
                  <span className="nav-alert-pill">{exceptionCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Live Engine Beacon & Environment */}
        <div className="nav-utilities">
          <div className="status-indicator-pill">
            <span className="pulse-dot" />
            <span className="status-label">Engine Active</span>
          </div>

          <div className="env-badge">
            Razorpay Testnet
          </div>
        </div>
      </div>
    </header>
  );
}
