# RevenueRescue AI — Autonomous Payment Recovery Platform

> **Detect → Diagnose → Predict → Decide → Gate → Recover → Verify → Measure → Audit**

RevenueRescue AI is an intelligent, policy-gated revenue recovery engine that detects failed payment transactions, calculates recovery probabilities using Machine Learning, reasons about optimal interventions using an AI Agent, validates actions against deterministic safety policies, and executes verified recoveries via Payment Simulation or Razorpay Test Checkout.

---

## 🏆 Hackathon "The Bar" Compliance

| Requirement | Implementation in RevenueRescue AI |
|---|---|
| **Detect Revenue at Risk** | Real-time ledger analysis identifying failed/at-risk payments across 10,000+ seeded transactions. |
| **Diagnose Root Cause** | Classifies failure taxonomy (`TEMPORARY_BANK_FAILURE`, `NETWORK_FAILURE`, `INSUFFICIENT_FUNDS`, etc.). |
| **ML Recovery Prediction** | Production Random Forest classifier ($83.36\%$ ROC-AUC on 2,250 held-out test transactions). |
| **AI Agent Reasoning** | Structured decision support recommending `RETRY_PAYMENT`, `SEND_NOTIFICATION`, or `ESCALATE_TO_HUMAN`. |
| **Deterministic Policy Gate** | Hard limits: `MAX_RETRIES=2`, `MAX_AMOUNT=₹5,000`, `MAX_WINDOW=48h`, `MIN_PROB=40%`. AI cannot bypass. |
| **Measured Money Recovered** | 10,000-Transaction Batch Simulator directly measuring incremental ₹ recovered and net ROI vs Baseline. |
| **Compliant Escalation** | High-value and policy-blocked transactions routed to human triage queue with 1-click resolution. |
| **Immutable Audit Trail** | Append-only event log tracking every actor (`AI_AGENT`, `POLICY_ENGINE`, `PAYMENT_SIMULATOR`, `HUMAN`). |
| **Razorpay Integration** | Official Standard Web Checkout modal with HMAC-SHA256 signature verification. |

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│             RescueFlow UI (React 18 + Vite)                │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST APIs (Port 3000 -> 5000)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Express.js Backend API                     │
│         (Routes: recovery, agent, razorpay, batch)          │
└───┬──────────────────────────┬──────────────────────────┬───┘
    │                          │                          │
    ▼                          ▼                          ▼
┌──────────────────┐   ┌───────────────────┐   ┌──────────────────┐
│  FastAPI ML Svc  │   │  Policy Engine    │   │  Razorpay SDK    │
│  Random Forest   │   │  (Safety Gate)    │   │  Test Mode Orders│
└──────────────────┘   └───────────────────┘   └──────────────────┘
    │                          │                          │
    └──────────────────────────┼──────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 MongoDB Atlas Database                      │
│        (Transactions, Customers, AuditEvents)              │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js 18+** & **npm**
- **Python 3.10+**
- **MongoDB Atlas** or Local MongoDB

### 2. Start ML Service (Port 8000)
```bash
cd ml-service
pip install -r requirements.txt
python main.py
```

### 3. Start Backend API (Port 5000)
```bash
cd backend
npm install
node server.js
```

### 4. Start Frontend UI (Port 3000)
```bash
cd frontend
npm install
npm run dev
```

Visit: **`http://localhost:3000`**

---

## 🎯 5-Minute Demo Walkthrough Script

### Demo 1 — Platform Overview (`Overview`)
1. View the **Revenue at Risk** (₹5.11+ Cr) and **Revenue Recovered** financial KPIs.
2. Inspect the **Operational Metrics**: Successful Recoveries, Failed Interventions, Human Escalations, Unresolved Exceptions.
3. Review the **7-Day Recovery Trend** and **Failure Reason Distribution** charts.

### Demo 2 — Transaction Explorer (`Transactions`)
1. Filter transactions by status (`FAILED`), payment method (`UPI`, `CARD`), or failure reason.
2. Click any transaction ID (e.g. `TXN001741`) to open its deep-dive decision breakdown.

### Demo 3 — AI Decision Engine & Razorpay Checkout (`Decision Engine`)
1. Click **Analyze** on `TXN001741` to see customer history, ML recovery probability (74.7%), and policy checks.
2. Click **🚀 Run AI Recovery Agent** to execute the end-to-end autonomous recovery workflow.
3. Click **💳 Live Razorpay Checkout Test** to open the real Razorpay standard checkout modal and verify HMAC-SHA256 signatures.

### Demo 4 — Exceptions Queue & Human Triage (`Exceptions`)
1. Inspect the **Human Escalations** (high-value payments > ₹5,000) and **Policy Blocked** queues.
2. Click **Approve** or **Dismiss** to demonstrate Human-in-the-Loop exception handling with operator audit logging.

### Demo 5 — 10,000-Transaction Batch Benchmark (`Batch Simulator`)
1. Select batch size **10,000 transactions** and mode **Both (Baseline vs AI)**.
2. Click **Run Batch Evaluation**.
3. Review the **Held-Out ML Benchmark Panel** ($83.36\%$ ROC-AUC) and the **Incremental Revenue Recovered** comparison proving financial ROI.

---

## 📊 Machine Learning Model Benchmarks

Evaluated on **2,250 held-out test samples** (15% split) unseen during training:

| Metric | Logistic Regression (Baseline) | Random Forest (Selected Model v1.0) |
|---|---|---|
| **ROC-AUC** | 73.06% | **83.36%** (+10.3%) |
| **Precision** | 60.44% | **69.06%** (+8.6%) |
| **Recall** | 51.37% | **76.78%** (+25.4%) |
| **F1-Score** | 55.54% | **72.72%** (+17.2%) |

---

## 🛡️ Security & Safety Principles
- **Separation of Concerns:** The AI Agent is a decision-support engine; only the deterministic backend policy engine can authorize execution.
- **Stopping Rules:** Automatic cessation after 2 retries or 48 hours to prevent customer spamming.
- **Idempotency:** Recovery endpoints guard against duplicate execution on already-recovered transactions.
- **Zero Real-Money Movement:** All executions are safely bounded to simulated payments and Razorpay Test Mode.

---

## 🛠️ Technology Stack
- **Frontend:** React 18, Vite, Recharts, Custom Minimal Design System
- **Backend:** Node.js, Express.js, Mongoose, Razorpay Node SDK, UUID, Crypto
- **Machine Learning:** Python, FastAPI, scikit-learn, Pandas, NumPy, Joblib
- **Database:** MongoDB Atlas
