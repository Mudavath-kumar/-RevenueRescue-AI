import { useState, useEffect } from 'react';
import { getExceptions } from '../api';

const NavIcons = {
  home: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  overview: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  transactions: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  ai_decision: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  audit: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  exceptions: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  batch: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2v7.31" />
      <path d="M14 9.3V2" />
      <path d="M8.5 2h7" />
      <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
      <path d="M5.52 16h12.96" />
    </svg>
  ),
};

const NAV_TABS = [
  { id: 'home',         label: 'Home' },
  { id: 'overview',     label: 'Overview' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'ai_decision',  label: 'Decision Engine' },
  { id: 'audit',        label: 'Audit Trail' },
  { id: 'exceptions',   label: 'Exceptions' },
  { id: 'batch',        label: 'Batch Simulator' },
];

export default function HeaderNav({ activePage, onNavigate }) {
  const [exceptionCount, setExceptionCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    getExceptions()
      .then(res => {
        if (res.data && res.data.count) {
          setExceptionCount(res.data.count);
        }
      })
      .catch(() => {});
  }, [activePage]);

  const handleNavClick = (tabId) => {
    onNavigate(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="top-nav-bar">
        <div className="top-nav-container">
          {/* Left: Custom Geometric Brand Mark */}
          <div className="brand-cluster" onClick={() => handleNavClick('home')}>
            <div className="brand-logo-mark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="navBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"
                  fill="url(#navBrandGrad)"
                />
                <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
              </svg>
            </div>
            <div className="brand-text">
              <span className="brand-name">RescueFlow</span>
              <span className="brand-badge">Autonomous AI</span>
            </div>
          </div>

          {/* Center: Desktop Navigation Pill Cluster with Vector Icons */}
          <nav className="nav-pill-cluster desktop-nav">
            {NAV_TABS.map((tab) => {
              const isActive = activePage === tab.id;
              return (
                <button
                  key={tab.id}
                  className={`nav-pill-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleNavClick(tab.id)}
                >
                  <span className="nav-icon-wrapper">{NavIcons[tab.id]}</span>
                  <span>{tab.label}</span>
                  {tab.id === 'exceptions' && exceptionCount > 0 && (
                    <span className="nav-alert-pill">{exceptionCount}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Live Engine Beacon & Launch Button */}
          <div className="nav-utilities">
            <div className="status-indicator-pill header-status-desktop">
              <span className="pulse-dot" />
              <span className="status-label">Engine Active</span>
            </div>

            <button
              className="btn btn-primary btn-sm nav-cta-btn header-cta-desktop"
              onClick={() => handleNavClick('ai_decision')}
            >
              Launch Engine
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Navigation Menu */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer animate-in">
            <div className="mobile-nav-grid">
              {NAV_TABS.map((tab) => {
                const isActive = activePage === tab.id;
                return (
                  <button
                    key={tab.id}
                    className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(tab.id)}
                  >
                    <span className="mobile-nav-icon">{NavIcons[tab.id]}</span>
                    <span className="mobile-nav-label">{tab.label}</span>
                    {tab.id === 'exceptions' && exceptionCount > 0 && (
                      <span className="nav-alert-pill">{exceptionCount}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Action Bar inside Drawer */}
            <div className="mobile-drawer-footer">
              <div className="status-indicator-pill" style={{ justifyContent: 'center' }}>
                <span className="pulse-dot" />
                <span className="status-label">Engine Active (10k Ledger Sync)</span>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
                onClick={() => handleNavClick('ai_decision')}
              >
                Launch Recovery Engine →
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
