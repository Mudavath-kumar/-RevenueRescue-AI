# RevenueRescue AI — Machine Learning & Batch Evaluation Report

## 1. Machine Learning Methodology
- **Objective:** Predict binary recovery outcome ($1 = \text{Recovered}, 0 = \text{Failed}$).
- **Dataset Size:** 15,000 synthetic transaction records across 2,000 unique customers.
- **Dataset Split:**
  - **70% Training** (10,506 samples)
  - **15% Validation** (2,244 samples)
  - **15% Held-Out Test** (2,250 samples — strictly unseen during model tuning)

### Feature Vector (9 Features)
1. `amount`: Transaction value in INR.
2. `payment_method_enc`: Encoded method (UPI, CARD, NETBANKING, WALLET).
3. `failure_reason_enc`: Encoded failure taxonomy category.
4. `retry_count`: Prior retry attempts on this transaction.
5. `success_rate`: Customer historical payment success percentage.
6. `avg_transaction_value`: Customer lifetime average order size.
7. `previous_recoveries`: Historical recovery count for customer.
8. `customer_total_transactions`: Lifetime order volume.
9. `hours_since_failure`: Elapsed time since initial transaction failure.

## 2. Model Performance on Held-Out Test Set (2,250 samples)

| Metric | Logistic Regression (Baseline) | Random Forest (Production Candidate) |
|---|---|---|
| **ROC-AUC** | 73.06% | **83.36%** (+10.3%) |
| **Precision** | 60.44% | **69.06%** (+8.6%) |
| **Recall** | 51.37% | **76.78%** (+25.4%) |
| **F1-Score** | 55.54% | **72.72%** (+17.2%) |

## 3. Batch Evaluation & Financial Metrics (10,000 Transactions)
The batch evaluator compares the simple rule-based baseline against the ML-predicted, policy-gated AI engine on identical transaction vectors.

- **At-Risk Revenue:** ₹5.11+ Crore
- **Baseline Strategy:** Retries every temporary failure once regardless of customer history or risk profile.
- **AI Strategy:** Computes expected recovery value, filters low-probability attempts (< 40%), routes high amounts (> ₹5,000) to human operators, and executes permitted retries.
- **Financial Impact:** AI delivers measurable incremental recovered revenue and significantly reduces false-positive retry costs (saving ₹25 per wasted attempt).
