import { useState, useEffect, useRef } from 'react';

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

const FAILURE_TAXONOMY = [
  {
    code: 'TEMPORARY_BANK_FAILURE',
    name: 'Temporary Bank Timeout',
    trigger: 'Issuer / NPCI Gateway 504 Gateway Timeout',
    action: 'Autonomous Background Retry via Alternative Route',
    channel: 'Direct Gateway Switch',
    tagColor: 'blue',
    recoveryRate: '~78%'
  },
  {
    code: 'INSUFFICIENT_FUNDS',
    name: 'Insufficient Balance',
    trigger: 'Debit decline code 102 (low available balance)',
    action: 'Smart Scheduled WhatsApp / SMS Recovery Link',
    channel: 'WhatsApp & SMS',
    tagColor: 'green',
    recoveryRate: '~54%'
  },
  {
    code: 'NETWORK_FAILURE',
    name: '3D Secure / Network Drop',
    trigger: 'Client session lost during OTP verification (401)',
    action: '1-Click Resilient Razorpay Web Checkout Link',
    channel: 'Razorpay Hosted Checkout',
    tagColor: 'yellow',
    recoveryRate: '~82%'
  },
  {
    code: 'EXPIRED_PAYMENT_METHOD',
    name: 'Expired Instrument',
    trigger: 'Expired card validity or deleted UPI handle',
    action: 'Payment Method Switch Prompt without Cart Abandonment',
    channel: 'Direct Dynamic Form',
    tagColor: 'purple',
    recoveryRate: '~65%'
  },
  {
    code: 'HIGH_VALUE_THRESHOLD',
    name: 'High-Ticket Transaction (> ₹5,000)',
    trigger: 'Policy trigger exceeding autonomous spending ceiling',
    action: 'Escalated to Human Triage Exception Queue for Review',
    channel: 'Human Operator Queue',
    tagColor: 'blue',
    recoveryRate: '~91%'
  }
];

const POLICY_GUARDRAILS = [
  {
    id: 'amount_cap',
    title: 'Autonomous Amount Cap',
    desc: 'Any single transaction exceeding ₹5,000 is automatically blocked from autonomous execution and escalated to human operators.',
    limit: 'Max ₹5,000 / Txn',
    icon: '₹'
  },
  {
    id: 'retry_ceiling',
    title: 'Hard Retry Ceiling',
    desc: 'Strict upper limit of 2 retry attempts per failed transaction to eliminate runaway processing costs and prevent customer annoyance.',
    limit: 'Max 2 Retries',
    icon: '⚡'
  },
  {
    id: 'time_window',
    title: '48-Hour Recovery Horizon',
    desc: 'Interventions are strictly barred after 48 hours to comply with RBI chargeback rules and prevent stale authorization attempts.',
    limit: '48 Hours Max',
    icon: '⏱'
  },
  {
    id: 'ml_threshold',
    title: 'ML Confidence Floor',
    desc: 'Random Forest model must predict recovery probability ≥ 40% before any financial intervention is authorized by the policy engine.',
    limit: '≥ 40% Probability',
    icon: '✦'
  }
];

const COMPARISON_ROWS = [
  {
    metric: 'Recovery Decision Logic',
    dumb: 'Blind unconditional retry on all failures',
    ai: 'Multi-signal ML scoring (83.36% ROC-AUC) + AI Agent'
  },
  {
    metric: 'Financial Cost Awareness',
    dumb: 'Burns ₹25 fee on every failed attempt with zero yield',
    ai: 'Intervenes only when expected value > intervention cost'
  },
  {
    metric: 'Safety & Spending Guardrails',
    dumb: 'None — can trigger infinite retry loops',
    ai: 'Hard deterministic policy gate (₹5k cap, 2 retries, 48h limit)'
  },
  {
    metric: 'High-Ticket & Edge Handling',
    dumb: 'Treats ₹50,000 payment identically to ₹50',
    ai: 'Autonomous Human Triage escalation for high-value VIP orders'
  },
  {
    metric: 'Auditability & Compliance',
    dumb: 'Scattered logs across gateway dashboard',
    ai: 'Immutable, append-only chronological event ledger'
  }
];

export default function HomeHero({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [monthlyFailedGmv, setMonthlyFailedGmv] = useState(25); // In Lakhs
  const [avgTicket, setAvgTicket] = useState(2500); // In Rupees
  const [videoOpacity, setVideoOpacity] = useState(0);
  const videoRef = useRef(null);

  // Live ROI Calculations
  const gmvRupees = monthlyFailedGmv * 100000;
  const estimatedRecovered = Math.round(gmvRupees * 0.742); // 74.2% AI recovery
  const dumbRecovered = Math.round(gmvRupees * 0.385); // 38.5% baseline
  const incrementalRevenue = estimatedRecovered - dumbRecovered;
  const annualIncremental = incrementalRevenue * 12;
  const savedInterventionFees = Math.round((gmvRupees / avgTicket) * 0.45 * 25); // fees saved from not retrying hopeless txns

  // Custom Fade-In / Fade-Out Video Looping with requestAnimationFrame
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animationFrameId;
    const fadeDuration = 0.5; // 0.5s fade in / fade out

    const checkTime = () => {
      if (video.duration) {
        const { currentTime, duration } = video;
        if (currentTime < fadeDuration) {
          // Fade in over 0.5s at the start (0 to 1)
          setVideoOpacity(Math.min(1, currentTime / fadeDuration));
        } else if (currentTime > duration - fadeDuration) {
          // Fade out over 0.5s before the end (1 to 0)
          const remaining = duration - currentTime;
          setVideoOpacity(Math.max(0, remaining / fadeDuration));
        } else {
          setVideoOpacity(1);
        }
      }
      animationFrameId = requestAnimationFrame(checkTime);
    };

    const handleEnded = () => {
      setVideoOpacity(0);
      setTimeout(() => {
        if (video) {
          video.currentTime = 0;
          video.play().catch(() => {});
        }
      }, 100);
    };

    video.addEventListener('ended', handleEnded);
    animationFrameId = requestAnimationFrame(checkTime);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (video) {
        video.removeEventListener('ended', handleEnded);
      }
    };
  }, []);

  return (
    <div className="landing-hero-container">
      {/* Cinematic Looping Video Background with Custom Fade Transitions */}
      <div
        className="hero-video-wrapper"
        style={{
          position: 'absolute',
          top: '300px',
          inset: 'auto 0 0 0',
          width: '100%',
          height: 'calc(100% - 300px)',
          overflow: 'hidden',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="hero-background-video"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: videoOpacity,
            transition: 'opacity 0.1s linear'
          }}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4"
        />
        {/* Gradient overlays: from-background via-transparent to-background */}
        <div className="hero-video-gradient-overlay" />
      </div>

      {/* Hero Interactive Foreground Content */}
      <div className="hero-content-wrapper">
        {/* 1. Top Innovation Badge */}
        <div className="hero-badge animate-fade-rise">
          <span className="hero-badge-sparkle">✦</span>
          <span>Now with Gemini 2.5 & 83.36% ML Model</span>
          <span className="hero-badge-pill">v2.0</span>
        </div>

        {/* 2. Editorial Headline with Instrument Serif Italic */}
        <h1 className="hero-headline animate-fade-rise">
          The Future of <span className="italic-serif">Smarter</span> Revenue Recovery
        </h1>

        {/* 3. Subheadline */}
        <p className="hero-subheadline animate-fade-rise-delay">
          Automate payment failure recovery with intelligent AI agents that diagnose root causes, 
          predict recovery probabilities, and execute policy-gated interventions—winning back revenue automatically.
        </p>

        {/* 4. Action Buttons */}
        <div className="hero-cta-group animate-fade-rise-delay-2">
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
                <div className="dash-logo-sq" style={{ background: 'transparent', padding: 0 }}>
                  <img src="/logo.png" alt="RescueFlow" style={{ width: 20, height: 20, objectFit: 'contain', borderRadius: 4 }} />
                </div>
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
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                  <span>Overview</span>
                </button>
                <button
                  className={`dash-side-btn ${activeTab === 'Decision Engine' ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setActiveTab('Decision Engine'); onNavigate('ai_decision'); }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 2v4" /><path d="M12 18v4" />
                    <path d="M4.93 4.93l2.83 2.83" /><path d="M16.24 16.24l2.83 2.83" />
                    <path d="M2 12h4" /><path d="M18 12h4" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>Decision Engine</span>
                </button>
                <button
                  className={`dash-side-btn ${activeTab === 'Transactions' ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setActiveTab('Transactions'); onNavigate('transactions'); }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                  <span>Transactions</span>
                </button>
                <button
                  className={`dash-side-btn ${activeTab === 'Exceptions' ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setActiveTab('Exceptions'); onNavigate('exceptions'); }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>Exceptions</span>
                  <span className="dash-badge-count">12</span>
                </button>
                <button
                  className={`dash-side-btn ${activeTab === 'Batch' ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setActiveTab('Batch'); onNavigate('batch'); }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M10 2v7.31" /><path d="M14 9.3V2" />
                    <path d="M8.5 2h7" /><path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
                    <path d="M5.52 16h12.96" />
                  </svg>
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


        {/* ── Section 5: Interactive Revenue Recovery ROI Calculator ── */}
        <div className="home-section-container">
          <div className="home-section-header">
            <div className="section-eyebrow">Financial Impact Simulator</div>
            <h2 className="home-section-title">
              Estimate Your <span className="italic-serif">Recovered Revenue</span>
            </h2>
            <p className="home-section-subtitle">
              Calculate the incremental rupees won back and payment gateway fees saved each month using AI-gated recovery.
            </p>
          </div>

          <div className="home-calc-card">
            <div className="calc-controls">
              <div className="calc-slider-group">
                <div className="calc-slider-header">
                  <span>Monthly Failed GMV Volume</span>
                  <span className="calc-slider-val">₹{monthlyFailedGmv} Lakhs</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={monthlyFailedGmv}
                  onChange={(e) => setMonthlyFailedGmv(Number(e.target.value))}
                  className="calc-range-input"
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Total monthly revenue lost to failed checkout attempts (₹5L - ₹2 Cr)
                </span>
              </div>

              <div className="calc-slider-group">
                <div className="calc-slider-header">
                  <span>Average Transaction Order Value</span>
                  <span className="calc-slider-val">₹{avgTicket.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="15000"
                  step="500"
                  value={avgTicket}
                  onChange={(e) => setAvgTicket(Number(e.target.value))}
                  className="calc-range-input"
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Basket size across UPI, credit cards, and netbanking
                </span>
              </div>
            </div>

            <div className="calc-results-box">
              <div className="calc-res-row">
                <span className="calc-res-label">Monthly AI Recovered Revenue</span>
                <span className="calc-res-num highlight">₹{(estimatedRecovered / 100000).toFixed(2)} Lakhs</span>
              </div>
              <div className="calc-res-row">
                <span className="calc-res-label">Baseline Dumb Retries Yield</span>
                <span className="calc-res-num">₹{(dumbRecovered / 100000).toFixed(2)} Lakhs</span>
              </div>
              <div className="calc-res-row">
                <span className="calc-res-label">Net Incremental Revenue Won</span>
                <span className="calc-res-num" style={{ color: '#60A5FA' }}>+₹{(incrementalRevenue / 100000).toFixed(2)} L/mo</span>
              </div>
              <div className="calc-res-row">
                <span className="calc-res-label">Wasted Gateway Fees Saved</span>
                <span className="calc-res-num">₹{savedInterventionFees.toLocaleString()}/mo</span>
              </div>
              <div className="calc-res-row">
                <span className="calc-res-label">Annual Enterprise ROI Gain</span>
                <span className="calc-res-num" style={{ color: '#34D399', fontSize: 18 }}>₹{(annualIncremental / 100000).toFixed(2)} Lakhs/yr</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 6: Failure Taxonomy & Recovery Matrix ─────────── */}
        <div className="home-section-container">
          <div className="home-section-header">
            <div className="section-eyebrow">Failure Taxonomy & Intelligence</div>
            <h2 className="home-section-title">
              Root Causes & <span className="italic-serif">Autonomous Actions</span>
            </h2>
            <p className="home-section-subtitle">
              How RescueFlow intelligently diagnoses raw gateway error codes and dispatches optimal recovery workflows.
            </p>
          </div>

          <div className="home-table-card">
            <table className="home-pro-table">
              <thead>
                <tr>
                  <th>Failure Classification</th>
                  <th>Root Cause Trigger</th>
                  <th>Autonomous Action Strategy</th>
                  <th>Recovery Channel</th>
                  <th>Historical Yield</th>
                </tr>
              </thead>
              <tbody>
                {FAILURE_TAXONOMY.map((row) => (
                  <tr key={row.code}>
                    <td>
                      <span className={`table-tag ${row.tagColor}`}>{row.name}</span>
                    </td>
                    <td><span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{row.trigger}</span></td>
                    <td><strong style={{ color: 'var(--text-primary)', fontSize: 12 }}>{row.action}</strong></td>
                    <td><span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{row.channel}</span></td>
                    <td><strong style={{ color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>{row.recoveryRate}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Section 7: Deterministic Policy Safety Gates ─────────── */}
        <div className="home-section-container">
          <div className="home-section-header">
            <div className="section-eyebrow">Zero Financial Hallucination</div>
            <h2 className="home-section-title">
              Deterministic <span className="italic-serif">Policy Safety Gates</span>
            </h2>
            <p className="home-section-subtitle">
              The AI Agent is strictly bound by hardcode deterministic constraints. Safety rules always overrule the LLM.
            </p>
          </div>

          <div className="guardrail-cards-grid">
            {POLICY_GUARDRAILS.map((guard) => (
              <div key={guard.id} className="guardrail-card">
                <div className="guardrail-icon-sq">{guard.icon}</div>
                <h4 className="guardrail-heading">{guard.title}</h4>
                <p className="guardrail-desc">{guard.desc}</p>
                <span className="guardrail-limit">{guard.limit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 8: AI Precision vs Dumb Retries Comparison ─────── */}
        <div className="home-section-container">
          <div className="home-section-header">
            <div className="section-eyebrow">Quantitative Superiority</div>
            <h2 className="home-section-title">
              AI Precision vs <span className="italic-serif">Naive Dumb Retries</span>
            </h2>
            <p className="home-section-subtitle">
              Why traditional blind retries burn merchant capital and how machine learning optimizes net recovered profit.
            </p>
          </div>

          <div className="home-table-card">
            <table className="home-pro-table">
              <thead>
                <tr>
                  <th style={{ width: '28%' }}>Dimension</th>
                  <th style={{ width: '36%', color: 'var(--accent-red)' }}>Traditional Dumb Retries</th>
                  <th style={{ width: '36%', color: 'var(--accent-blue)' }}>RescueFlow AI Recovery Engine</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx}>
                    <td><strong style={{ color: 'var(--text-primary)' }}>{row.metric}</strong></td>
                    <td style={{ color: '#E11D48', fontSize: 12 }}>✕ {row.dumb}</td>
                    <td style={{ color: 'var(--text-primary)', fontSize: 12 }}>
                      <strong style={{ color: 'var(--accent-green)', marginRight: 4 }}>✓</strong> {row.ai}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Section 9: Bottom Launch CTA Banner ─────────────────────── */}
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
