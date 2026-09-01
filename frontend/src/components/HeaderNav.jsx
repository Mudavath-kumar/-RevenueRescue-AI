import { useState, useEffect } from 'react';
import { getExceptions } from '../api';

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
    <header className="top-nav-bar">
      <div className="top-nav-container">
        {/* Left: Custom Geometric Brand Mark */}
        <div className="brand-cluster" onClick={() => onNavigate('home')}>
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

        {/* Center: Desktop Navigation Pill Cluster */}
        <nav className="nav-pill-cluster desktop-nav">
          {NAV_TABS.map((tab) => {
            const isActive = activePage === tab.id;
            return (
              <button
                key={tab.id}
                className={`nav-pill-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(tab.id)}
              >
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
          <div className="status-indicator-pill">
            <span className="pulse-dot" />
            <span className="status-label">Engine Active</span>
          </div>

          <button
            className="btn btn-primary btn-sm nav-cta-btn"
            onClick={() => onNavigate('ai_decision')}
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
                  <span className="mobile-nav-glyph">◆</span>
                  <span className="mobile-nav-label">{tab.label}</span>
                  {tab.id === 'exceptions' && exceptionCount > 0 && (
                    <span className="nav-alert-pill">{exceptionCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
