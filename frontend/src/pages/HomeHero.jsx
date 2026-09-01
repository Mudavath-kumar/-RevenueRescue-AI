import { useState } from 'react';

export default function HomeHero({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="landing-hero-container">
      {/* Background Video with Enhanced Clarity & Reduced Fade */}
      <div className="hero-video-wrapper">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="hero-background-video"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4"
        />
        <div className="hero-video-overlay" />
      </div>

      {/* Hero Interactive Foreground Content */}
      <div className="hero-content-wrapper">
        {/* 1. Top Innovation Badge */}
        <div className="hero-badge animate-in">
          <span className="hero-badge-sparkle">✦</span>
          <span>Now with Gemini 2.5 & 83.36% ML Model</span>
          <span className="hero-badge-pill">v2.0</span>
        </div>

        {/* 2. Editorial Headline with Instrument Serif Italic */}
        <h1 className="hero-headline animate-in">
          The Future of <span className="italic-serif">Smarter</span> Revenue Recovery
        </h1>

        {/* 3. Subheadline */}
        <p className="hero-subheadline animate-in">
          Automate payment failure recovery with intelligent AI agents that diagnose root causes, 
          predict recovery probabilities, and execute policy-gated interventions—winning back revenue automatically.
        </p>

        {/* 4. Action Buttons */}
        <div className="hero-cta-group animate-in">
          <button
            className="btn hero-primary-btn"
            onClick={() => onNavigate('ai_decision')}
          >
            <span>Launch Recovery Engine</span>
            <span className="btn-arrow">→</span>
          </button>

          <button
            className="hero-demo-btn"
            onClick={() => onNavigate('batch')}
            title="Explore Batch Simulation Demo"
          >
            <div className="hero-play-circle">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3L19 12L5 21V3Z" />
              </svg>
            </div>
            <span>Watch 10k Batch Demo</span>
          </button>
        </div>

        {/* 5. Custom Coded Live Dashboard Preview (NOT an image) */}
        <div className="hero-dashboard-preview-wrapper animate-in" onClick={() => onNavigate('overview')}>
          <div className="hero-dashboard-glass-container">
            {/* Top Bar */}
            <div className="dash-top-bar">
              <div className="dash-brand">
                <div className="dash-logo-sq">R</div>
                <span className="dash-title">RescueFlow</span>
                <span className="dash-chevron">›</span>
                <span className="dash-crumb">Merchant Production Ledger</span>
              </div>

              <div className="dash-search-box">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="search-icon-svg">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21L16.65 16.65" />
                </svg>
                <span className="search-placeholder">Search TXN001741 or Customer...</span>
                <span className="search-kbd">⌘K</span>
              </div>

              <div className="dash-top-actions">
                <div className="dash-status-pill">
                  <span className="pulse-dot" />
                  <span>Engine Active</span>
                </div>
                <div className="dash-avatar">MK</div>
              </div>
            </div>

            {/* Dashboard Inner Canvas */}
            <div className="dash-body">
              {/* Mini Sidebar */}
              <div className="dash-sidebar">
                <div className="dash-sidebar-section">NAVIGATION</div>
                <button
                  className={`dash-side-btn ${activeTab === 'Overview' ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setActiveTab('Overview'); onNavigate('overview'); }}
                >
                  <span className="side-dot-glyph">◆</span>
                  <span>Overview</span>
                </button>
                <button
                  className={`dash-side-btn ${activeTab === 'Decision Engine' ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setActiveTab('Decision Engine'); onNavigate('ai_decision'); }}
                >
                  <span className="side-dot-glyph">⚡</span>
                  <span>Decision Engine</span>
                </button>
                <button
                  className={`dash-side-btn ${activeTab === 'Transactions' ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setActiveTab('Transactions'); onNavigate('transactions'); }}
                >
                  <span className="side-dot-glyph">■</span>
                  <span>Transactions</span>
                </button>
                <button
                  className={`dash-side-btn ${activeTab === 'Exceptions' ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setActiveTab('Exceptions'); onNavigate('exceptions'); }}
                >
                  <span className="side-dot-glyph">▲</span>
                  <span>Exceptions</span>
                  <span className="dash-badge-count">12</span>
                </button>
                <button
                  className={`dash-side-btn ${activeTab === 'Batch' ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setActiveTab('Batch'); onNavigate('batch'); }}
                >
                  <span className="side-dot-glyph">●</span>
                  <span>Batch Simulator</span>
                </button>

                <div className="dash-sidebar-section" style={{ marginTop: 12 }}>FINANCIAL SAFETY</div>
                <div className="dash-guardrail-item">
                  <span className="guard-dot green" />
                  <span>Policy Gate Active</span>
                </div>
                <div className="dash-guardrail-item">
                  <span className="guard-dot blue" />
                  <span>Razorpay Testnet</span>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="dash-main-canvas">
                {/* Greeting & Action Pills */}
                <div className="dash-header-row">
                  <div>
                    <h3 className="dash-greeting">Live Recovery Intelligence</h3>
                    <p className="dash-subtext">Autonomous recovery telemetry across 10,000 merchant transactions</p>
                  </div>

                  <div className="dash-action-pills">
                    <button className="dash-pill-btn primary" onClick={(e) => { e.stopPropagation(); onNavigate('ai_decision'); }}>
                      Run AI Agent
                    </button>
                    <button className="dash-pill-btn" onClick={(e) => { e.stopPropagation(); onNavigate('batch'); }}>
                      Batch Test
                    </button>
                    <button className="dash-pill-btn" onClick={(e) => { e.stopPropagation(); onNavigate('exceptions'); }}>
                      Triage (12)
                    </button>
                  </div>
                </div>

                {/* 2 Equal-Width Side-by-Side Cards */}
                <div className="dash-cards-grid">
                  {/* Card 1: Recovered Balance Card with Handcrafted SVG Curve */}
                  <div className="dash-card">
                    <div className="dash-card-header">
                      <span className="dash-card-label">RECOVERED REVENUE</span>
                      <span className="badge badge-success">Live Sync</span>
                    </div>
                    <div className="dash-balance-val">
                      ₹84,50,190<span className="dash-cents">.32</span>
                    </div>
                    <div className="dash-stat-pills">
                      <span className="stat-pill-green">▲ +₹18.4L this week</span>
                      <span className="stat-pill-neutral">83.36% ML Accuracy</span>
                    </div>

                    {/* Handcrafted Cubic Bézier SVG Area Chart */}
                    <div className="dash-svg-chart">
                      <svg viewBox="0 0 400 90" className="dash-curve-svg" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="heroAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Area Fill */}
                        <path
                          d="M0,75 C60,68 100,80 150,45 C200,10 260,55 310,25 C350,2 380,18 400,12 L400,90 L0,90 Z"
                          fill="url(#heroAreaGrad)"
                        />
                        {/* Stroke Line */}
                        <path
                          d="M0,75 C60,68 100,80 150,45 C200,10 260,55 310,25 C350,2 380,18 400,12"
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        {/* Milestone Nodes */}
                        <circle cx="150" cy="45" r="3.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                        <circle cx="310" cy="25" r="3.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                        <circle cx="400" cy="12" r="4" fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>

                  {/* Card 2: Deterministic Policy Engine Guardrails */}
                  <div className="dash-card">
                    <div className="dash-card-header">
                      <span className="dash-card-label">POLICY SAFETY GATE</span>
                      <span className="badge badge-info">Deterministic</span>
                    </div>
                    <div className="dash-policy-list">
                      <div className="dash-policy-row">
                        <div className="policy-icon-glyph">◆</div>
                        <div className="policy-info">
                          <span className="policy-name">Max Autonomous Limit</span>
                          <span className="policy-sub">Amounts {'>'} ₹5,000 route to human</span>
                        </div>
                        <span className="policy-val">₹5,000</span>
                      </div>

                      <div className="dash-policy-row">
                        <div className="policy-icon-glyph">◆</div>
                        <div className="policy-info">
                          <span className="policy-name">Max Retries Allowed</span>
                          <span className="policy-sub">Prevents customer fatigue</span>
                        </div>
                        <span className="policy-val">2 Retries</span>
                      </div>

                      <div className="dash-policy-row">
                        <div className="policy-icon-glyph">◆</div>
                        <div className="policy-info">
                          <span className="policy-name">Recovery Window</span>
                          <span className="policy-sub">Valid payment age limit</span>
                        </div>
                        <span className="policy-val">48 Hours</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Live Interventions Table */}
                <div className="dash-table-card">
                  <div className="dash-table-header">
                    <span className="dash-card-label">RECENT CLOSED-LOOP INTERVENTIONS</span>
                    <span className="dash-table-link">Open Decision Engine ›</span>
                  </div>
                  <table className="dash-mini-table">
                    <thead>
                      <tr>
                        <th>TXN ID</th>
                        <th>Method</th>
                        <th>Failure Root Cause</th>
                        <th>Amount</th>
                        <th>ML Score</th>
                        <th>Outcome</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>TXN001741</code></td>
                        <td><span className="badge badge-info">UPI</span></td>
                        <td>Temporary Bank Timeout</td>
                        <td><strong>₹2,314</strong></td>
                        <td><span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>74.7%</span></td>
                        <td><span className="badge badge-success">Recovered</span></td>
                      </tr>
                      <tr>
                        <td><code>TXN000042</code></td>
                        <td><span className="badge badge-info">CARD</span></td>
                        <td>Network Degradation</td>
                        <td><strong>₹8,450</strong></td>
                        <td><span style={{ color: 'var(--accent-yellow)', fontWeight: 700 }}>62.1%</span></td>
                        <td><span className="badge badge-warning">Escalated ({'>'}₹5k)</span></td>
                      </tr>
                      <tr>
                        <td><code>TXN000108</code></td>
                        <td><span className="badge badge-info">NETBANKING</span></td>
                        <td>Payment Gateway Flapping</td>
                        <td><strong>₹4,120</strong></td>
                        <td><span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>81.2%</span></td>
                        <td><span className="badge badge-success">Recovered</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
