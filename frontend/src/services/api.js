import axios from 'axios';

// API base URL configuration to support environment variables in production.
// In development, Vite will proxy requests starting with '/api' to 'http://localhost:3000'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch list of stock symbols
 * @returns {Promise<string[]>} List of stock symbols
 */
export const getStocks = async () => {
  const response = await api.get('/stocks');
  return response.data;
};

/**
 * Run next-day stock price prediction
 * @param {string} stock Stock symbol (e.g. 'RELIANCE.NS')
 * @returns {Promise<object>} Prediction results
 */
export const predictStock = async (stock) => {
  const response = await api.post('/predict', { stock });
  return response.data;
};

export default {
  getStocks,
  predictStock,
};
