const express = require('express');
const router = express.Router();
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// GET /api/ml/metrics
router.get('/metrics', async (req, res) => {
  try {
    // Try querying the live ML service
    try {
      const resp = await axios.get(`${process.env.ML_SERVICE_URL}/model/info`, { timeout: 2000 });
      if (resp.data && resp.data.evaluation) {
        return res.json({
          status: 'online',
          modelLoaded: resp.data.model_loaded,
          metrics: resp.data.evaluation,
          features: resp.data.features
        });
      }
    } catch (_) {
      // Fallback to local evaluation artifact file
    }

    const reportPath = path.join(__dirname, '../../ml-service/models/evaluation_report.json');
    if (fs.existsSync(reportPath)) {
      const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      return res.json({
        status: 'cached',
        modelLoaded: true,
        metrics: data,
        features: data.feature_names
      });
    }

    res.json({
      status: 'default',
      metrics: {
        model_selected: 'Random Forest',
        model_version: 'v1.0',
        random_forest: { precision: 0.6906, recall: 0.7678, f1: 0.7272, roc_auc: 0.8336 },
        logistic_regression: { precision: 0.6044, recall: 0.5137, f1: 0.5554, roc_auc: 0.7306 }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
