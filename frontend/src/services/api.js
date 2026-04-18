import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🧠 Debug: request log
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("➡️ API REQUEST:", config.baseURL + config.url);

    return config;
  },
  (error) => Promise.reject(error)
);

// ❌ Error handling
api.interceptors.response.use(
  (response) => {
    console.log("✅ API RESPONSE:", response.config.url);
    return response;
  },
  (error) => {
    console.log("❌ API ERROR:", error.config?.url);

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;