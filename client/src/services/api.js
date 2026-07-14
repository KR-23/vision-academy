import axios from 'axios';

// Create Axios Client
const API = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 15000
});

// Request Interceptor: Attach JWT Token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format error messages
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred. Please try again.';
    return Promise.reject({
      status: error.response?.status,
      message,
      originalError: error
    });
  }
);

export default API;
