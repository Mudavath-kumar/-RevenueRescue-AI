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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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
