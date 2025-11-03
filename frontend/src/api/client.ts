import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5175',
  timeout: 20000,
});

api.interceptors.response.use(
  (r) => r,
  (e) => {
    // 简单错误直传
    return Promise.reject(e);
  }
);


