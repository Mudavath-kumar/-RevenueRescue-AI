"""
RevenueRescue AI — ML Inference Service
FastAPI service exposing /predict endpoint
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import joblib
import numpy as np
import os
import json

app = FastAPI(title="RevenueRescue ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Load model artifacts
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

model = None
le_method = None
le_reason = None
feature_names = None
evaluation_report = {}

def load_artifacts():
    global model, le_method, le_reason, feature_names, evaluation_report
    try:
        model = joblib.load(os.path.join(MODEL_DIR, 'trained_model.joblib'))
        le_method = joblib.load(os.path.join(MODEL_DIR, 'le_method.joblib'))
        le_reason = joblib.load(os.path.join(MODEL_DIR, 'le_reason.joblib'))
        feature_names = joblib.load(os.path.join(MODEL_DIR, 'feature_names.joblib'))
        report_path = os.path.join(MODEL_DIR, 'evaluation_report.json')
        if os.path.exists(report_path):
            with open(report_path) as f:
                evaluation_report = json.load(f)
        print("✅ Model artifacts loaded successfully")
    except Exception as e:
        print(f"⚠️  Could not load model: {e}. Run training/train.py first.")

load_artifacts()

class PredictionRequest(BaseModel):
    amount: float
    payment_method: str
    failure_reason: str
    retry_count: int = 0
    success_rate: float = 0.7
    avg_transaction_value: float = 2000
    previous_recoveries: int = 0
    customer_total_transactions: int = 5
    hours_since_failure: float = 1.0

class PredictionResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    recovery_probability: float
    risk_level: str
    recommended_action: str
    model_version: str
    confidence: float

def encode_safe(le, value, default=0):
    """Safe label encoding — returns 0 for unseen labels."""
    try:
        return le.transform([value])[0]
    except ValueError:
        return default

@app.get("/")
def root():
    return {"service": "RevenueRescue ML Service", "status": "running", "model_loaded": model is not None}

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    if model is None:
        # Fallback deterministic prediction
        base_rates = {
            'TEMPORARY_BANK_FAILURE': 0.82,
            'NETWORK_FAILURE': 0.75,
            'PAYMENT_METHOD_ISSUE': 0.55,
            'INSUFFICIENT_FUNDS': 0.15,
            'EXPIRED_PAYMENT_METHOD': 0.20,
            'REPEATED_FAILURE': 0.10,
            'UNKNOWN': 0.40
        }
        prob = base_rates.get(request.failure_reason, 0.40)
        prob -= request.retry_count * 0.08
        prob = max(0.05, min(0.95, prob))
    else:
        try:
            method_enc = encode_safe(le_method, request.payment_method)
            reason_enc = encode_safe(le_reason, request.failure_reason)

            features = np.array([[
                request.amount,
                method_enc,
                reason_enc,
                request.retry_count,
                request.success_rate,
                request.avg_transaction_value,
                request.previous_recoveries,
                request.customer_total_transactions,
                request.hours_since_failure
            ]])

            prob = float(model.predict_proba(features)[0][1])
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

    # Determine risk level and recommended action
    if prob >= 0.65:
        risk_level = "LOW"
        recommended_action = "RETRY"
    elif prob >= 0.40:
        risk_level = "MEDIUM"
        recommended_action = "NOTIFY"
    else:
        risk_level = "HIGH"
        recommended_action = "ESCALATE"

    return PredictionResponse(
        recovery_probability=round(prob, 4),
        risk_level=risk_level,
        recommended_action=recommended_action,
        model_version=evaluation_report.get("model_version", "v1.0"),
        confidence=round(abs(prob - 0.5) * 2, 4)  # 0=uncertain, 1=very confident
    )

@app.get("/model/info")
def model_info():
    return {
        "model_loaded": model is not None,
        "evaluation": evaluation_report,
        "features": feature_names
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
