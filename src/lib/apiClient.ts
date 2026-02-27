import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api/smart/';
// const API_BASE_URL = 'https://smartburhanpurcitybackend-production.up.railway.app/api/smart/';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartburhanpur_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('smartburhanpur_token');
      localStorage.removeItem('smartburhanpur_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
