import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : 'http://localhost:5000/api';

const API = axios.create({ baseURL: API_BASE });

export const getDashboardMetrics = () => API.get('/dashboard/metrics');
export const getTransactions     = (params) => API.get('/transactions', { params });
export const getTransaction      = (id) => API.get(`/transactions/${id}`);
export const getAuditTrail       = (txnId) => API.get(`/audit/${txnId}`);
export const getExceptions       = () => API.get('/exceptions');
export const resolveException    = (id, data) => API.post(`/exceptions/${id}/resolve`, data);
export const analyzeRecovery     = (transactionId) => API.post('/recovery/analyze', { transactionId });
export const executeRecovery     = (transactionId, action) => API.post('/recovery/execute', { transactionId, action });
export const runAgentRecovery    = (transactionId) => API.post('/agent/recover', { transactionId });
export const runSimulation       = (params) => API.post('/simulation/run', params);
export const getMLMetrics        = () => API.get('/ml/metrics');
export const createRazorpayOrder = (data) => API.post('/razorpay/create-order', data);
export const verifyRazorpayPayment = (data) => API.post('/razorpay/verify-payment', data);

export default API;
