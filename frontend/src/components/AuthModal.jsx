import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, signup } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('merchant');
  const [companyName, setCompanyName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signup({ name, email, password, role, companyName });
        setSuccessMsg('Account created successfully! Welcome to RescueFlow.');
      } else {
        await login(email, password);
        setSuccessMsg('Welcome back!');
      }
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Authentication failed. Please check credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('merchant@rescueflow.ai');
    setPassword('RescueFlow2026!');
    setName('Demo Merchant');
    setCompanyName('FinTech Ventures Pvt Ltd');
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div className="auth-modal-card animate-scale" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="auth-close-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {/* Modal Header */}
        <div className="auth-header">
          <div className="brand-logo-mark" style={{ margin: '0 auto 12px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="authBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
              <path
                d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"
                fill="url(#authBrandGrad)"
              />
              <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
            </svg>
          </div>
          <h2 className="auth-title">
            {isSignUp ? (
              <>Create your <span className="italic-serif">Merchant</span> account</>
            ) : (
              <>Welcome back to <span className="italic-serif">RescueFlow</span></>
            )}
          </h2>
          <p className="auth-subtitle">
            {isSignUp
              ? 'Securely manage your autonomous payment recovery policies and audit ledgers.'
              : 'Sign in to access your production recovery intelligence and AI agents.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => { setIsSignUp(false); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => { setIsSignUp(true); setError(''); }}
          >
            Create Account
          </button>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="auth-alert error animate-in">
            <span style={{ fontSize: 14 }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-alert success animate-in">
            <span style={{ fontSize: 14 }}>✓</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <>
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kumar Mudavath"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Company / Merchant Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Payments Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="merchant">Merchant (Store / Platform Owner)</option>
                  <option value="operator">Recovery Operator (Human Triage)</option>
                  <option value="admin">Compliance & Security Admin</option>
                </select>
              </div>
            </>
          )}

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px' }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                <span>Authenticating with MongoDB...</span>
              </span>
            ) : isSignUp ? (
              'Create Merchant Account →'
            ) : (
              'Sign In to Dashboard →'
            )}
          </button>
        </form>

        {/* Quick Demo Helper */}
        {!isSignUp && (
          <div className="auth-demo-helper">
            <button
              type="button"
              className="auth-quick-fill-btn"
              onClick={fillDemoCredentials}
            >
              ✦ Fill Demo Credentials
            </button>
          </div>
        )}

        <div className="auth-footer">
          <span>Protected by bcrypt password hashing & JWT tokens in MongoDB.</span>
        </div>
      </div>
    </div>
  );
}
