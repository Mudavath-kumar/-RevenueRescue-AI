import { useState, useEffect } from 'react';
import { getExceptions } from '../api';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

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
  const { user, logout, isAuthenticated } = useAuth();
  const [exceptionCount, setExceptionCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

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
          {/* Left: Custom Brand Mark with uploaded logo */}
          <div className="brand-cluster" onClick={() => handleNavClick('home')}>
            <div className="brand-logo-mark" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
              <img
                src="/logo.png"
                alt="RescueFlow Logo"
                style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6 }}
              />
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

          {/* Right: Auth Profile + Live Engine Beacon */}
          <div className="nav-utilities">
            <div className="status-indicator-pill header-status-desktop">
              <span className="pulse-dot" />
              <span className="status-label">Engine Active</span>
            </div>

            {/* Auth Actions on Desktop */}
            {isAuthenticated ? (
              <div className="user-profile-cluster header-auth-desktop">
                <div className="user-avatar-badge" title={user.email}>
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'ME'}
                </div>
                <div className="user-details-mini">
                  <span className="user-name-text">{user.name || 'Merchant'}</span>
                  <span className="user-role-text">{user.role || 'merchant'}</span>
                </div>
                <button
                  className="btn-user-logout"
                  onClick={logout}
                  title="Sign Out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                className="btn btn-outline btn-sm header-auth-desktop"
                onClick={() => setAuthModalOpen(true)}
              >
                Sign In
              </button>
            )}

            <button
              className="btn btn-primary btn-sm nav-cta-btn header-cta-desktop"
              onClick={() => handleNavClick('ai_decision')}
            >
              Launch Engine
            </button>

            {/* Modern Animated Toggle Button */}
            <button
              className={`modern-menu-toggle ${mobileMenuOpen ? 'is-open' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              <div className="toggle-morph-icon">
                <span className="morph-bar bar-1" />
                <span className="morph-bar bar-2" />
              </div>
              <span className="toggle-chip-text">
                {mobileMenuOpen ? 'Close' : 'Menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Modern Cool Floating Glassmorphic Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="modern-nav-drawer animate-drawer-slide">
            {/* User Profile in Drawer if Logged In */}
            {isAuthenticated ? (
              <div className="modern-drawer-user-card">
                <div className="modern-avatar-badge">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'ME'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>
                      {user.email}
                    </span>
                    <span>•</span>
                    <span className="modern-role-pill">{user.role}</span>
                  </div>
                </div>
                <button
                  className="modern-drawer-signout-btn"
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                className="modern-drawer-auth-btn"
                onClick={() => { setMobileMenuOpen(false); setAuthModalOpen(true); }}
              >
                <span>Sign In / Create Account</span>
                <span className="drawer-auth-arrow">→</span>
              </button>
            )}

            {/* Navigation Grid of Modern Tactile Cards */}
            <div className="modern-drawer-nav-grid">
              {NAV_TABS.map((tab) => {
                const isActive = activePage === tab.id;
                return (
                  <button
                    key={tab.id}
                    className={`modern-drawer-tile ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(tab.id)}
                  >
                    <div className="drawer-tile-icon-box">
                      {NavIcons[tab.id]}
                    </div>
                    <span className="drawer-tile-label">{tab.label}</span>
                    {tab.id === 'exceptions' && exceptionCount > 0 && (
                      <span className="drawer-alert-badge">{exceptionCount}</span>
                    )}
                    <span className="drawer-tile-chevron">›</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Action Bar inside Drawer */}
            <div className="modern-drawer-footer">
              <div className="modern-drawer-status-pill">
                <span className="pulse-dot" />
                <span style={{ fontWeight: 700, fontSize: 11.5, color: '#059669' }}>Engine Active</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>• 10k Ledger Telemetry</span>
              </div>
              <button
                className="btn hero-primary-btn modern-drawer-cta-btn"
                onClick={() => handleNavClick('ai_decision')}
              >
                <span>Launch Recovery Engine</span>
                <span className="btn-arrow">→</span>
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

      {/* Auth Modal (Sign In / Sign Up) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}
