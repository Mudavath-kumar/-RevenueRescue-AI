# RevenueRescue AI — Autonomous Payment Recovery Platform

> **Detect → Diagnose → Predict → Decide → Gate → Recover → Verify → Measure → Audit**
>
> An intelligent, policy-gated revenue recovery engine engineered for merchants and payment aggregators. Built to autonomously diagnose payment failures, predict recovery probabilities with Machine Learning, synthesize optimal recovery strategies using an AI Agent, enforce deterministic safety policies, and verify recoveries via Razorpay Test Checkout.

---

## 📌 Executive Summary & Problem Context

In modern digital commerce and SaaS ecosystems, payment failures represent one of the single largest sources of revenue leakage:
- **10% to 25%** of recurring and one-time payment attempts in emerging markets fail due to temporary bank downtimes, network timeouts, authentication drops, or momentary balance shortages.
- **Naïve, blind retries** cause merchant penalty fees from card networks, trigger bank anti-abuse throttles, customer fatigue, and high chargeback/dispute rates.
- **Manual intervention** is too slow to recover abandoned carts and time-sensitive subscriptions before the transaction window expires.

**RevenueRescue AI** solves this with a **closed-loop autonomous recovery system**:
1. It ingests failed transaction telemetry in real time.
2. An **ML Random Forest Classifier (83.36% ROC-AUC)** predicts the statistical probability of recovery.
3. A **Google Gemini AI Agent** analyzes customer lifetime value, historical habits, and failure patterns to propose bounded recovery actions.
4. A **Deterministic Policy Gate** acts as an air-gapped safety firewall to prevent over-retries, enforce RBI cooldown compliance, and route high-value edge cases to human operators.
5. Recoveries are verified against real **Razorpay Standard Checkout** orders with cryptographically verified HMAC-SHA256 signatures.
6. Every step is immutably recorded in an append-only audit trail and measured against baseline benchmarks across **10,000+ transactions**.

---

## 🏆 Razorpay Hackathon & Internship Compliance Matrix

| Evaluation Criterion | Implementation in RevenueRescue AI | Status |
|---|---|:---:|
| **Detect Revenue at Risk** | Real-time ledger analysis quantifying ₹5.11+ Crore at risk across 10,000+ seeded transactions. | ✅ Built & Verified |
| **Diagnose Root Cause** | Instant classification across failure taxonomy (`TEMPORARY_BANK_FAILURE`, `NETWORK_FAILURE`, `INSUFFICIENT_FUNDS`, etc.). | ✅ Built & Verified |
| **ML Recovery Prediction** | Production Random Forest classifier trained on 15,000 samples ($83.36\%$ ROC-AUC on 2,250 held-out test transactions). | ✅ Built & Verified |
| **AI Agent Reasoning** | Structured decision support recommending `RETRY_PAYMENT`, `SEND_NOTIFICATION`, or `ESCALATE_TO_HUMAN`. | ✅ Built & Verified |
| **Deterministic Policy Gate** | Hard invariant bounds: `MAX_RETRIES=2`, `MAX_AMOUNT=₹5,000`, `MAX_WINDOW=48h`, `MIN_PROB=40%`. AI cannot bypass. | ✅ Built & Verified |
| **Measured Money Recovered** | 10,000-Transaction Batch Simulator directly measuring incremental ₹ recovered and net ROI vs Baseline. | ✅ Built & Verified |
| **Compliant Escalation** | High-value and policy-blocked transactions routed to human triage queue with 1-click resolution. | ✅ Built & Verified |
| **Immutable Audit Trail** | Append-only event log tracking every actor (`AI_AGENT`, `POLICY_ENGINE`, `PAYMENT_SIMULATOR`, `HUMAN`). | ✅ Built & Verified |
| **Razorpay Integration** | Official Standard Web Checkout modal with HMAC-SHA256 signature verification. | ✅ Built & Verified |
| **Interactive AI Copilot** | Floating natural language assistant answering operator questions with real-time ledger context. | ✅ Built & Verified |
| **Visual Pipeline Trace** | 5-stage real-time execution trace visualizer (Signals → ML → Agent → Policy → Closed-Loop Result). | ✅ Built & Verified |
| **Security & Auth** | Full-stack JWT auth, bcryptjs password hashing (10 salt rounds), enterprise HTTP security headers. | ✅ Built & Verified |

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      RescueFlow UI (React 18 + Vite)                        │
│   (Overview Dashboard, Transactions, AI Decision Engine, Audit, Copilot)    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST APIs / JSON Web Tokens
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Express.js Backend API                             │
│       (Routes: /api/recovery, /api/agent, /api/razorpay, /api/auth)         │
└───┬──────────────────────────┬──────────────────────────┬───────────────────┘
    │                          │                          │
    ▼                          ▼                          ▼
┌──────────────────────┐   ┌──────────────────────┐   ┌───────────────────────┐
│   FastAPI ML Svc     │   │   Policy Engine      │   │   Razorpay Node SDK   │
│ Random Forest (v1.0) │   │ (Deterministic Gate) │   │   Orders & Signatures │
└──────────────────────┘   └──────────────────────┘   └───────────────────────┘
    │                          │                          │
    └──────────────────────────┼──────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MongoDB Atlas Database                             │
│            (Transactions, Customers, AuditEvents, User Accounts)           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 End-to-End Recovery Workflow

```
[Failed Transaction] 
         │
         ▼
 1. INGEST & DETECT  ──► Ingest webhook / ledger event; flags failed status
         │
         ▼
 2. DIAGNOSE TAXONOMY ─► Categorize failure code (Bank / Network / Auth / Funds)
         │
         ▼
 3. ML INFERENCE      ──► 9-Feature vector passed to Random Forest -> P(Recovery)
         │
         ▼
 4. AGENT REASONING   ──► Gemini LLM reasons over customer tier, channel, & timing
         │
         ▼
 5. POLICY GATE       ──► Hard deterministic checks (Retries <= 2, Amount <= 5k, etc.)
         │
         ├─────────────────────────────┬─────────────────────────────┐
         ▼                             ▼                             ▼
    [APPROVED]                    [HIGH VALUE]                [UNSAFE / BLOCKED]
         │                             │                             │
 6. RECOVERY EXECUTION                 │                             │
    (Smart Retry / Razorpay Test)       ▼                             ▼
         │                      ROUTE TO HUMAN                TERMINATE RETRIES
         ▼                     EXCEPTION QUEUE                (Prevent Customer Spam)
 7. CRYPTO VERIFICATION                │
    (HMAC-SHA256 Match)                ▼
         │                     OPERATOR APPROVAL
         ▼
 8. AUDIT & RECONCILE ──► Append-only log + Incremental financial ROI update
```

### Detailed Lifecycle Stages:
1. **Detect**: Ingests failed payment events from webhooks or the transaction ledger, extracting transaction metadata, amount, customer ID, and gateway error payloads.
2. **Diagnose**: Classifies error codes into actionable categories (`TEMPORARY_BANK_FAILURE`, `NETWORK_FAILURE`, `INSUFFICIENT_FUNDS`, `AUTHENTICATION_ERROR`, `CUSTOMER_ABORTED`).
3. **Predict**: Extracts a 9-feature telemetry vector and submits it to the Python ML microservice, generating an inference score $P(\text{Recovery}) \in [0.0, 1.0]$.
4. **Reason**: The Gemini-powered AI agent evaluates multi-dimensional signals—customer lifetime value, historical payment channel success rates, and optimal cooldown windows—and formulates a structured intervention proposal.
5. **Gate (Deterministic Policy Firewall)**: The proposal is validated against non-negotiable rules. The AI has **zero financial execution authority**; if a proposed action violates any boundary, the policy engine blocks or escalates it.
6. **Execute**:
   - **Automated**: For approved transactions, executes simulated retry or creates a live Razorpay order.
   - **Escalated**: Transactions over ₹5,000 or edge cases route to the Human Exception Queue.
   - **Blocked**: Transactions with high retry counts or non-recoverable error codes are halted to prevent customer harassment.
7. **Verify**: When Razorpay checkout is used, the backend calculates an HMAC-SHA256 hash using the merchant secret key to verify payment authenticity.
8. **Audit & Measure**: The result is immutably logged to MongoDB with actor attribution (`AI_AGENT`, `POLICY_ENGINE`, `OPERATOR`) and factored into real-time ROI metrics.

---

## 📊 Machine Learning Model Benchmarks

The recovery probability engine was trained and evaluated on **15,000 real-world synthetic transaction records across 2,000 unique customer profiles**.

### Held-Out Test Set Results (2,250 samples — 15% unseen partition):

| Evaluation Metric | Logistic Regression (Baseline) | Random Forest (Production Candidate v1.0) | Relative Improvement |
|---|:---:|:---:|:---:|
| **ROC-AUC** | 73.06% | **83.36%** | **+10.3%** |
| **Precision** | 60.44% | **69.06%** | **+8.6%** |
| **Recall** | 51.37% | **76.78%** | **+25.4%** |
| **F1-Score** | 55.54% | **72.72%** | **+17.2%** |

### Feature Importance & Vector Breakdown:
The ML model consumes 9 distinct features engineered from transaction and customer behavior:
1. `amount`: Transaction value in INR.
2. `payment_method_enc`: Encoded payment rail (UPI, Card, Netbanking, Wallet).
3. `failure_reason_enc`: Encoded failure taxonomy category.
4. `retry_count`: Prior retry attempts on this transaction.
5. `success_rate`: Customer historical payment success percentage.
6. `avg_transaction_value`: Customer lifetime average order size.
7. `previous_recoveries`: Historical recovery count for customer.
8. `customer_total_transactions`: Lifetime order volume.
9. `hours_since_failure`: Elapsed time since initial transaction failure.

---

## 🛡️ Deterministic Safety & Policy Firewall

To eliminate AI hallucination risks in financial workflows, RevenueRescue AI employs an air-gapped deterministic policy engine:

| Invariant Rule | Boundary Threshold | System Action if Violated | Rationale |
|---|:---:|---|---|
| **Maximum Retries** | $\le 2$ attempts | **Blocked** (`MAX_RETRIES_EXCEEDED`) | Prevents customer spam, card association fines, and merchant fees. |
| **Autonomous Amount Ceiling** | $\le ₹5,000$ | **Escalated** (`HIGH_VALUE_TRANSACTION`) | High-value payments require human operator sign-off. |
| **Maximum Recovery Window** | $\le 48$ hours | **Expired** (`WINDOW_EXPIRED`) | Stale recovery attempts have diminishing returns and confuse customers. |
| **Minimum ML Probability** | $\ge 40\%$ | **Blocked** (`LOW_PROBABILITY`) | Avoids wasting API calls and fees on unlikely recoveries. |
| **Terminal Error Blocking** | Specific codes | **Terminated** (`FRAUD_SUSPECTED`, etc.) | Card stolen/fraud errors are never retried under any circumstance. |

---

## 💻 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend UI** | React 18, Vite 8, Recharts | Fast, responsive single-page application with modern glassmorphism. |
| **Styling & Design** | Pure Vanilla CSS Design System | Custom tokens, dark/light mode accents, responsive breakpoints, zero heavy UI bloat. |
| **Backend API** | Node.js, Express.js, Mongoose | RESTful API server, policy engine execution, and session management. |
| **Authentication** | JWT (JSON Web Tokens) & BcryptJS | Secure password hashing (10 salt rounds) and token-based role verification. |
| **Payment Gateway** | Razorpay Node SDK & Checkout.js | Test Mode order creation and HMAC-SHA256 signature verification. |
| **AI Orchestration** | Google Gemini Flash API | Contextual reasoning over customer telemetry and recovery strategy proposal. |
| **Machine Learning** | Python, FastAPI, scikit-learn, Pandas | Production Random Forest model serving real-time probability inferences. |
| **Database** | MongoDB Atlas | Cloud document database storing 10,000+ transactions, customer ledgers, and audit logs. |
| **Security & Headers** | Helmet.js, Vercel Edge Headers | HSTS, Content Security Policy, X-Frame-Options (DENY), nosniff protection. |

---

## 📂 Project Structure

```
revenue-rescue-ai/
├── backend/                  # Node.js / Express API Server
│   ├── middleware/           # JWT auth & role validation middleware
│   ├── models/               # Mongoose schemas (Transaction, Customer, AuditEvent, User)
│   ├── routes/               # API endpoints (recovery, agent, razorpay, copilot, auth)
│   ├── services/             # Policy engine, ML client, Gemini AI agent
│   ├── scripts/              # Seed scripts (10,000+ benchmark transactions)
│   ├── package.json
│   └── server.js             # Express application entry point
├── frontend/                 # React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/       # HeaderNav, AuthModal, RescueCopilot, RazorpayCheckoutModal
│   │   ├── pages/            # HomeHero, Overview, Transactions, AIDecisionView, Exceptions, AuditTrail, BatchEvaluation
│   │   ├── context/          # AuthContext for authentication state
│   │   ├── index.css         # Complete vanilla CSS design system
│   │   └── App.jsx           # Application router and state management
│   ├── vercel.json           # Vercel deployment config with enterprise security headers
│   ├── package.json
│   └── vite.config.js
├── ml-service/               # Python / FastAPI Machine Learning Microservice
│   ├── models/               # Serialized Random Forest model & label encoders (.joblib)
│   ├── training/             # Data synthesis, feature engineering, and model training scripts
│   ├── main.py               # FastAPI inference endpoints
│   └── requirements.txt
├── docs/                     # Technical specifications & architecture decision records
│   ├── architecture.md
│   ├── decisions.md
│   └── evaluation.md
├── render.yaml               # Infrastructure-as-Code blueprint for cloud deployment
├── start-all.bat             # 1-click Windows development environment launcher
└── README.md
```

---

## ⚡ Quick Start & Local Setup

### 1. Prerequisites
- **Node.js 18+** & **npm**
- **Python 3.10+** & **pip**
- **MongoDB Atlas** connection string or local MongoDB instance

### 2. Environment Configuration
Create `.env` files in `backend/`, `frontend/`, and `ml-service/`:

**`backend/.env`:**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
GEMINI_API_KEY=your_gemini_api_key
ML_SERVICE_URL=http://localhost:8000
```

**`frontend/.env`:**
```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### 3. Start the Services

#### Option A: 1-Click Launcher (Windows)
Double-click `start-all.bat` in the repository root.

#### Option B: Manual Terminal Execution

```bash
# Terminal 1: ML Microservice
cd ml-service
pip install -r requirements.txt
python main.py

# Terminal 2: Backend API Server
cd backend
npm install
node server.js

# Terminal 3: Frontend Client
cd frontend
npm install
npm run dev
```

Visit the application at: **`http://localhost:3000`**

---

## 🔌 API Reference Overview

| Method | Endpoint | Description | Access |
|---|---|---|:---:|
| `GET` | `/api/recovery/overview` | Aggregated recovery KPIs, recovery rate, revenue at risk. | Public |
| `GET` | `/api/recovery/transactions` | Paginated transaction explorer with filtering & search. | Public |
| `GET` | `/api/recovery/transactions/:id` | Full transaction diagnostic vector, customer history, audit events. | Public |
| `POST` | `/api/recovery/evaluate-batch` | 10,000-transaction batch simulation (Baseline vs AI). | Public |
| `POST` | `/api/agent/analyze` | AI multi-stage signal analysis, ML prediction, policy evaluation. | Public |
| `POST` | `/api/agent/recover` | Autonomous recovery execution with policy safety gating. | Public |
| `POST` | `/api/razorpay/create-order` | Generates a Razorpay Test Mode order for standard checkout. | Public |
| `POST` | `/api/razorpay/verify-payment` | Cryptographically verifies payment signature (HMAC-SHA256). | Public |
| `POST` | `/api/copilot/chat` | Natural language queries answered with real-time ledger context. | Public |
| `POST` | `/api/auth/register` | Create a merchant user account (stored in MongoDB). | Public |
| `POST` | `/api/auth/login` | Authenticate merchant credentials and issue JWT bearer token. | Public |

---

## 🔒 Security & Compliance Assurance

- **Zero Real-Money Movement**: The platform is safely sandboxed using simulated transactions and Razorpay Test Mode credentials.
- **Strict Separation of Privileges**: LLMs are prohibited from directly mutating financial states or releasing funds.
- **Idempotency Safeguards**: Every recovery endpoint enforces atomic status transitions to eliminate double-charging risks.
- **Enterprise HTTP Security Headers**: Configured across both Express `helmet` and Vercel Edge (`HSTS`, `CSP`, `X-Frame-Options: DENY`, `nosniff`).
- **Cryptographic Signatures**: Razorpay webhooks and payment confirmations are validated using `crypto.createHmac('sha256')`.

---

## 👨‍💻 Project Information & Submission

- **Candidate**: Mudavath Kumar
- **Live Demo Deployment**: [revenue-rescue-ai-omega.vercel.app](https://revenue-rescue-ai-omega.vercel.app/)
- **Repository**: [github.com/Mudavath-kumar/-RevenueRescue-AI](https://github.com/Mudavath-kumar/-RevenueRescue-AI)
