// src/services/api.js
import axios from 'axios';

// Khởi tạo một instance của axios
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Đường dẫn tới Backend FastAPI
});

// Interceptor: Tự động gắn Token vào mọi Request gửi đi (nếu đã đăng nhập)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;