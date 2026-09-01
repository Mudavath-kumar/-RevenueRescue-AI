import { useState } from 'react';

const OPERATIONAL_STEPS = [
  {
    step: '01',
    title: 'Signal Ingestion & Failure Taxonomy',
    desc: 'Failed payment webhooks are ingested in real time across UPI, Cards, Netbanking, and Wallets. The engine parses raw gateway error codes into structured root causes (Bank Timeouts, Network Drops, Insufficient Funds, Expired Methods).',
    badge: 'Real-Time Ingestion',
    target: 'transactions'
  },
  {
    step: '02',
    title: 'Machine Learning Recovery Scoring',
    desc: 'Our production Random Forest classifier (83.36% ROC-AUC on 2,250 held-out test transactions) evaluates 9 behavioral and transactional signals to predict the probability of successful recovery.',
    badge: '83.36% ROC-AUC',
    target: 'batch'
  },
  {
    step: '03',
    title: 'AI Agent Contextual Reasoning',
    desc: 'The AI Agent autonomously inspects customer lifetime success rates, prior recovery history, and error persistence to formulate a recommended recovery action (RETRY_PAYMENT, SEND_NOTIFICATION, or ESCALATE_TO_HUMAN).',
    badge: 'Gemini AI Agent',
    target: 'ai_decision'
  },
  {
    step: '04',
    title: 'Deterministic Policy Safety Gate',
    desc: 'Before any financial action executes, the deterministic policy engine verifies hard bounds: max autonomous amount (₹5,000), max retry ceiling (2 attempts), and 48-hour recovery window. The AI cannot bypass these rules.',
    badge: 'Hard Safety Gate',
    target: 'ai_decision'
  },
  {
    step: '05',
    title: 'Closed-Loop Execution & Razorpay Checkout',
    desc: 'Approved actions are executed via the deterministic Payment Simulator or live Razorpay Standard Web Checkout with cryptographic HMAC-SHA256 signature verification and double-charge idempotency guards.',
    badge: 'HMAC-SHA256 Verified',
    target: 'ai_decision'
  },
  {
    step: '06',
    title: 'Human Triage & Immutable Audit Trail',
    desc: 'High-value transactions (>₹5,000) or low-probability cases route to the Exceptions Queue for 1-click human operator approval. Every action across all actors is permanently logged in an append-only audit trail.',
    badge: 'Append-Only Ledger',
    target: 'exceptions'
  }
];

const CAPABILITIES = [
  {
    id: 'decision',
    title: 'Autonomous Decision Engine',
    desc: 'Multi-stage decision pipeline combining Random Forest ML inference, Gemini tool-calling, and deterministic policy gating.',
    target: 'ai_decision',
    tag: 'Core Engine'
  },
  {
    id: 'batch',
    title: '10,000-Txn Batch Simulator',
    desc: 'Run reproducible, seeded batch evaluations directly comparing AI Recovery vs Baseline rule retries to measure exact incremental ROI.',
    target: 'batch',
    tag: 'Quantitative Benchmark'
  },
  {
    id: 'explorer',
    title: 'Transaction Explorer',
    desc: 'Search, filter, and inspect at-risk transactions with 6 multi-dimensional filters across status, method, and failure taxonomy.',
    target: 'transactions',
    tag: 'Ledger Intelligence'
  },
  {
    id: 'exceptions',
    title: 'Exceptions & Human Triage',
    desc: 'Human-in-the-Loop workflows for high-value payments exceeding ₹5,000 and policy-blocked retries with 1-click resolution.',
    target: 'exceptions',
    tag: 'Human-in-the-Loop'
  },
  {
    id: 'audit',
    title: 'Immutable Audit Trail',
    desc: 'Cryptographically verifiable chronological event history tracking actor decisions, tool calls, policy checks, and recovered funds.',
    target: 'audit',
    tag: 'Compliance & Safety'
  },
  {
    id: 'copilot',
    title: 'RescueCopilot AI Assistant',
    desc: 'Interactive natural language assistant with real-time ledger context answering operator questions on policies, metrics, and transactions.',
    target: 'ai_decision',
    tag: 'Natural Language AI'
  }
];

export default function HomeHero({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="landing-hero-container">
      {/* Background Video with Enhanced Clarity */}
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
                        <path
                          d="M0,75 C60,68 100,80 150,45 C200,10 260,55 310,25 C350,2 380,18 400,12 L400,90 L0,90 Z"
                          fill="url(#heroAreaGrad)"
                        />
                        <path
                          d="M0,75 C60,68 100,80 150,45 C200,10 260,55 310,25 C350,2 380,18 400,12"
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
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

        {/* ── Section 2: Trust & Architecture Metrics Bar ───────────── */}
        <div className="home-stats-strip">
          <div className="home-stat-box">
            <div className="home-stat-number">83.36%</div>
            <div className="home-stat-label">Held-Out ML ROC-AUC</div>
            <div className="home-stat-sub">Random Forest on 2,250 test samples</div>
          </div>
          <div className="home-stat-box">
            <div className="home-stat-number">10,000+</div>
            <div className="home-stat-label">Live Production Records</div>
            <div className="home-stat-sub">Across 2,000 unique customer profiles</div>
          </div>
          <div className="home-stat-box">
            <div className="home-stat-number">₹5.11+ Cr</div>
            <div className="home-stat-label">At-Risk Revenue Analyzed</div>
            <div className="home-stat-sub">Across UPI, Cards, Netbanking, Mandates</div>
          </div>
          <div className="home-stat-box">
            <div className="home-stat-number">100%</div>
            <div className="home-stat-label">Deterministic Safety</div>
            <div className="home-stat-sub">Policy Gate blocks unbounded spending</div>
          </div>
        </div>

        {/* ── Section 3: How to Use the Platform (6-Step Architecture Loop) ── */}
        <div className="home-section-container">
          <div className="home-section-header">
            <div className="section-eyebrow">End-to-End Architecture</div>
            <h2 className="home-section-title">
              How to <span className="italic-serif">Operate</span> RescueFlow
            </h2>
            <p className="home-section-subtitle">
              From payment failure detection to verified fund recovery, explore the 6-stage closed-loop pipeline.
            </p>
          </div>

          <div className="home-steps-grid">
            {OPERATIONAL_STEPS.map((item) => (
              <div
                key={item.step}
                className="home-step-card"
                onClick={() => onNavigate(item.target)}
                title={`Click to explore ${item.title}`}
              >
                <div className="home-step-top">
                  <span className="home-step-num">{item.step}</span>
                  <span className="badge badge-info">{item.badge}</span>
                </div>
                <h3 className="home-step-heading">{item.title}</h3>
                <p className="home-step-body">{item.desc}</p>
                <div className="home-step-footer">
                  <span className="step-explore-link">Explore Feature ›</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 4: Interactive Capabilities Suite ───────────── */}
        <div className="home-section-container">
          <div className="home-section-header">
            <div className="section-eyebrow">Engine Features</div>
            <h2 className="home-section-title">
              Core Platform <span className="italic-serif">Capabilities</span>
            </h2>
            <p className="home-section-subtitle">
              Every tool engineered to win back revenue while maintaining compliance, deterministic safety, and an immutable audit trail.
            </p>
          </div>

          <div className="home-capabilities-grid">
            {CAPABILITIES.map((cap) => (
              <div
                key={cap.id}
                className="capability-card"
                onClick={() => onNavigate(cap.target)}
              >
                <div className="cap-tag">{cap.tag}</div>
                <h3 className="cap-title">{cap.title}</h3>
                <p className="cap-desc">{cap.desc}</p>
                <div className="cap-cta">
                  <span>Open Tool</span>
                  <span className="cap-arrow">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 5: Guided 5-Minute Demo Tour ───────────────────── */}
        <div className="home-tour-card">
          <div className="tour-content">
            <div className="section-eyebrow" style={{ color: '#93C5FD' }}>Judge & Evaluator Guide</div>
            <h2 className="tour-title">5-Minute Live Interactive Demo Script</h2>
            <p className="tour-subtitle">
              Follow this sequence to test and evaluate all features across the platform in under 5 minutes:
            </p>

            <div className="tour-steps-list">
              <div className="tour-step-item" onClick={() => onNavigate('overview')}>
                <span className="tour-step-index">1</span>
                <div>
                  <strong>Platform Overview:</strong> Inspect live KPIs (₹5.11+ Cr at risk), 7-day trends, and operational funnel.
                </div>
              </div>

              <div className="tour-step-item" onClick={() => onNavigate('transactions')}>
                <span className="tour-step-index">2</span>
                <div>
                  <strong>Transaction Explorer:</strong> Filter by failure root cause (Bank Failure) and select <code>TXN001741</code>.
                </div>
              </div>

              <div className="tour-step-item" onClick={() => onNavigate('ai_decision')}>
                <span className="tour-step-index">3</span>
                <div>
                  <strong>Decision Engine:</strong> Analyze <code>TXN001741</code>, verify 74.7% ML prediction, and click <em>Run AI Recovery Agent</em>.
                </div>
              </div>

              <div className="tour-step-item" onClick={() => onNavigate('exceptions')}>
                <span className="tour-step-index">4</span>
                <div>
                  <strong>Human Triage Queue:</strong> Review payments {'>'} ₹5,000 and click <em>Approve</em> for 1-click operator resolution.
                </div>
              </div>

              <div className="tour-step-item" onClick={() => onNavigate('batch')}>
                <span className="tour-step-index">5</span>
                <div>
                  <strong>10k Batch Benchmark:</strong> Run 10,000 transactions comparing AI vs Baseline to measure exact incremental rupees won back.
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                className="btn hero-primary-btn"
                style={{ background: '#FFFFFF', color: '#0F172A' }}
                onClick={() => onNavigate('overview')}
              >
                Start Guided Tour →
              </button>
              <button
                className="btn btn-outline"
                style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.3)', color: '#FFFFFF' }}
                onClick={() => onNavigate('batch')}
              >
                Run Batch Benchmark
              </button>
            </div>
          </div>
        </div>

        {/* ── Section 6: Bottom Launch CTA Banner ─────────────────────── */}
        <div className="home-bottom-banner">
          <h2 className="bottom-banner-title">
            Ready to win back <span className="italic-serif">slipping revenue</span>?
          </h2>
          <p className="bottom-banner-sub">
            Explore the full autonomous recovery engine live with Razorpay Testnet and real machine learning telemetry.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn hero-primary-btn" onClick={() => onNavigate('ai_decision')}>
              Launch Recovery Engine →
            </button>
            <button className="hero-demo-btn" onClick={() => onNavigate('overview')}>
              Open Platform Overview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
