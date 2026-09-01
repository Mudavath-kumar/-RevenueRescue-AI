# RevenueRescue AI — System Architecture

## 1. Overview
RevenueRescue AI is an autonomous, policy-gated revenue recovery engine that detects failed payment transactions, calculates recovery probability using Machine Learning, proposes bounded recovery actions with an AI Agent, validates actions against deterministic safety policies, and executes simulated or test-mode recoveries.

```
┌─────────────────────────────────────────────────────────────┐
│             RescueFlow UI (React 18 + Vite)                │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST APIs
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

## 2. Core Processing Pipeline
1. **Detection:** Failed transactions ingested into MongoDB Atlas.
2. **Diagnosis:** Classified by failure reason (`TEMPORARY_BANK_FAILURE`, `NETWORK_FAILURE`, etc.).
3. **ML Prediction:** Random Forest model estimates $P(\text{Recovery}) \in [0, 1]$ based on 9 transaction and customer features.
4. **Agent Reasoning:** LLM Agent reviews transaction history and recommends structured action (`RETRY_PAYMENT`, `SEND_NOTIFICATION`, `ESCALATE_TO_HUMAN`).
5. **Deterministic Policy Gate:** Hardcoded business rules validate:
   - `MAX_RETRIES <= 2`
   - `MAX_AUTONOMOUS_AMOUNT <= ₹5,000`
   - `MAX_RECOVERY_WINDOW <= 48 hours`
   - `MIN_RECOVERY_PROBABILITY >= 40%`
6. **Execution:** Approved actions run via Payment Simulator or Razorpay Test Checkout.
7. **Audit Trail:** Immutable append-only log records all decisions, results, and revenue recovered.

## 3. Security & Safety Contract
- **Air-gapped Financial Authority:** The LLM cannot execute financial actions directly; all mutations require backend policy validation.
- **Idempotency Protection:** Recovery execution checks transaction state to prevent duplicate charge attempts.
- **Provider Credentials:** Razorpay API keys reside strictly in backend `.env` variables and are never exposed to the client.
