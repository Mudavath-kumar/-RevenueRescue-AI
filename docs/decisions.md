# RevenueRescue AI — Architecture & Product Decisions

## ADR 01: Separation of LLM Reasoning and Deterministic Financial Policy
- **Context:** Financial applications cannot tolerate hallucinated approvals or unbounded retries.
- **Decision:** The LLM Agent functions purely as a decision-support and reasoning orchestrator. All execution requests pass through a strictly deterministic, hardcoded `policy-engine.js` gate.
- **Consequences:** Safe, predictable behavior where AI cannot unilaterally bypass financial limits or retry thresholds.

## ADR 02: Dual Execution Mode (Payment Simulator + Razorpay Test Mode)
- **Context:** Running 10,000 live API transactions against external payment gateways during benchmarking would incur high latency and potential rate-limiting.
- **Decision:** Provide a reproducible Payment Simulator with fixed seeds for large-batch experiments, while embedding official Razorpay Standard Web Checkout for interactive single-transaction testing and HMAC-SHA256 signature verification.
- **Consequences:** Rapid, deterministic batch evaluations alongside authentic gateway provider integration.

## ADR 03: Minimal, High-Density Canvas Layout
- **Context:** Traditional multi-layered dashboard sidebars waste horizontal screen real estate for complex data tables and transaction explorers.
- **Decision:** Replaced the legacy vertical sidebar with a floating command pill navigation bar (`HeaderNav.jsx`), providing a full-width responsive canvas and clean typography.
- **Consequences:** Maximized data density for transaction inspection, clearer KPI comparisons, and a modern aesthetic.
