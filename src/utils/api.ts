import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Fallback URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor to handle global errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      console.error("Unauthorized access - Redirecting to login.");
      // Clear token and user data
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      // Redirect (ensure this doesn't cause infinite loops)
       if (window.location.pathname !== '/login') {
           window.location.href = '/login';
       }
    }
    return Promise.reject(error);
  }
);


export default api;
