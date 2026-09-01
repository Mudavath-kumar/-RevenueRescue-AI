# -*- coding: utf-8 -*-
"""
ML Training Script for RevenueRescue AI
Trains Logistic Regression (baseline) and Random Forest (candidate)
Saves the best model as trained_model.joblib
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (classification_report, confusion_matrix,
                              roc_auc_score, f1_score, precision_score, recall_score)
from sklearn.pipeline import Pipeline
import joblib
import json
import random
import os

SEED = 42
random.seed(SEED)
np.random.seed(SEED)

# ─── Generate Synthetic Labeled Dataset ────────────────────────────────────────

FAILURE_REASONS = [
    'TEMPORARY_BANK_FAILURE', 'NETWORK_FAILURE', 'INSUFFICIENT_FUNDS',
    'EXPIRED_PAYMENT_METHOD', 'PAYMENT_METHOD_ISSUE', 'REPEATED_FAILURE', 'UNKNOWN'
]
PAYMENT_METHODS = ['UPI', 'CARD', 'NETBANKING', 'WALLET']

BASE_RECOVERY_RATE = {
    'TEMPORARY_BANK_FAILURE': 0.82,
    'NETWORK_FAILURE': 0.75,
    'PAYMENT_METHOD_ISSUE': 0.55,
    'INSUFFICIENT_FUNDS': 0.15,
    'EXPIRED_PAYMENT_METHOD': 0.20,
    'REPEATED_FAILURE': 0.10,
    'UNKNOWN': 0.40
}

def generate_dataset(n=15000):
    rows = []
    for _ in range(n):
        failure_reason = random.choices(
            FAILURE_REASONS,
            weights=[0.30, 0.20, 0.20, 0.10, 0.10, 0.05, 0.05]
        )[0]
        payment_method = random.choices(PAYMENT_METHODS, weights=[0.45, 0.30, 0.15, 0.10])[0]

        amount = random.randint(100, 20000)
        retry_count = random.choices([0, 1, 2, 3], weights=[0.5, 0.3, 0.15, 0.05])[0]
        success_rate = round(random.uniform(0.2, 1.0), 2)
        avg_txn_value = random.randint(500, 8000)
        previous_recoveries = random.choices([0, 1, 2, 3], weights=[0.6, 0.25, 0.10, 0.05])[0]
        customer_total_transactions = random.randint(1, 50)
        hours_since_failure = round(random.uniform(0.1, 48), 1)

        # Ground truth: simulate recovery outcome
        base_prob = BASE_RECOVERY_RATE[failure_reason]
        # Adjust based on features
        prob = base_prob
        prob += (success_rate - 0.5) * 0.2
        prob -= retry_count * 0.08
        prob += (previous_recoveries / 5) * 0.05
        prob -= max(0, (amount - 5000) / 20000) * 0.15
        prob -= (hours_since_failure / 48) * 0.10
        prob = max(0.02, min(0.97, prob))

        recovered = 1 if random.random() < prob else 0

        rows.append({
            'amount': amount,
            'payment_method': payment_method,
            'failure_reason': failure_reason,
            'retry_count': retry_count,
            'success_rate': success_rate,
            'avg_transaction_value': avg_txn_value,
            'previous_recoveries': previous_recoveries,
            'customer_total_transactions': customer_total_transactions,
            'hours_since_failure': hours_since_failure,
            'recovered': recovered
        })
    return pd.DataFrame(rows)

def preprocess(df):
    le_method = LabelEncoder()
    le_reason = LabelEncoder()
    df = df.copy()
    df['payment_method_enc'] = le_method.fit_transform(df['payment_method'])
    df['failure_reason_enc'] = le_reason.fit_transform(df['failure_reason'])
    return df, le_method, le_reason

def evaluate_model(model, X_test, y_test, name):
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    print(f"\n{'='*50}")
    print(f"  {name}")
    print(f"{'='*50}")
    print(f"  Precision : {precision_score(y_test, y_pred):.4f}")
    print(f"  Recall    : {recall_score(y_test, y_pred):.4f}")
    print(f"  F1 Score  : {f1_score(y_test, y_pred):.4f}")
    print(f"  ROC-AUC   : {roc_auc_score(y_test, y_prob):.4f}")
    print(f"\n  Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    return {
        "precision": round(precision_score(y_test, y_pred), 4),
        "recall": round(recall_score(y_test, y_pred), 4),
        "f1": round(f1_score(y_test, y_pred), 4),
        "roc_auc": round(roc_auc_score(y_test, y_prob), 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist()
    }

def main():
    print("[*] Generating training dataset...")
    df = generate_dataset(15000)
    df_processed, le_method, le_reason = preprocess(df)

    FEATURES = [
        'amount', 'payment_method_enc', 'failure_reason_enc',
        'retry_count', 'success_rate', 'avg_transaction_value',
        'previous_recoveries', 'customer_total_transactions', 'hours_since_failure'
    ]
    X = df_processed[FEATURES]
    y = df_processed['recovered']

    # 70/15/15 split
    X_temp, X_test, y_temp, y_test = train_test_split(X, y, test_size=0.15, random_state=SEED, stratify=y)
    X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=0.176, random_state=SEED, stratify=y_temp)

    print(f"[*] Dataset: {len(X_train)} train | {len(X_val)} val | {len(X_test)} test")
    print(f"    Recovery rate: {y.mean():.2%}")

    # ── Logistic Regression (Baseline) ─────────────────────────────────────────
    print("\n[1/2] Training Logistic Regression...")
    lr_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('model', LogisticRegression(max_iter=1000, random_state=SEED))
    ])
    lr_pipeline.fit(X_train, y_train)
    lr_metrics = evaluate_model(lr_pipeline, X_test, y_test, "Logistic Regression (Baseline)")

    # ── Random Forest (Candidate) ───────────────────────────────────────────────
    print("\n[2/2] Training Random Forest...")
    rf_pipeline = Pipeline([
        ('model', RandomForestClassifier(n_estimators=200, max_depth=12, min_samples_leaf=5,
                                          random_state=SEED, n_jobs=-1))
    ])
    rf_pipeline.fit(X_train, y_train)
    rf_metrics = evaluate_model(rf_pipeline, X_test, y_test, "Random Forest (Candidate)")

    # ── Model Selection ─────────────────────────────────────────────────────────
    best_model = rf_pipeline if rf_metrics['roc_auc'] >= lr_metrics['roc_auc'] else lr_pipeline
    best_name = "Random Forest" if rf_metrics['roc_auc'] >= lr_metrics['roc_auc'] else "Logistic Regression"
    print(f"\n[BEST] Model selected: {best_name} (ROC-AUC: {max(rf_metrics['roc_auc'], lr_metrics['roc_auc'])})")

    # Save model and encoders — write to ml-service/models/ (where main.py loads from)
    MODEL_OUT = os.path.join(os.path.dirname(__file__), '..', 'models')
    os.makedirs(MODEL_OUT, exist_ok=True)
    joblib.dump(best_model, os.path.join(MODEL_OUT, 'trained_model.joblib'))
    joblib.dump(le_method,  os.path.join(MODEL_OUT, 'le_method.joblib'))
    joblib.dump(le_reason,  os.path.join(MODEL_OUT, 'le_reason.joblib'))
    joblib.dump(FEATURES,   os.path.join(MODEL_OUT, 'feature_names.joblib'))

    # Save evaluation report
    report = {
        "model_selected": best_name,
        "model_version": "v1.0",
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "feature_names": FEATURES,
        "logistic_regression": lr_metrics,
        "random_forest": rf_metrics,
        "intervention_cost_per_attempt": 25
    }
    with open(os.path.join(MODEL_OUT, 'evaluation_report.json'), 'w') as f:
        json.dump(report, f, indent=2)

    print("\n[OK] Model saved to models/trained_model.joblib")
    print("[OK] Evaluation report saved to models/evaluation_report.json")

if __name__ == '__main__':
    main()
