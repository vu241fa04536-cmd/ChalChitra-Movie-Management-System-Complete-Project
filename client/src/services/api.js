import axios from 'axios';

// Normalize API base URL: remove trailing slashes for clean endpoint concatenation
const rawBaseUrl = import.meta.env.VITE_API_URL || '/api';
const baseURL = rawBaseUrl.replace(/\/+$/, '');

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach appropriate JWT token (strict User vs Admin separation)
API.interceptors.request.use(
  (config) => {
    const userToken = localStorage.getItem('chalchitra_token');
    const adminToken = sessionStorage.getItem('chalchitra_admin_token');
    const method = (config.method || 'get').toLowerCase();
    const url = config.url || '';

    let tokenToAttach = null;

    // 1. Admin movie mutations (POST, PUT, DELETE /movies) require admin token
    const isMovieMutation =
      (url === '/movies' || url.startsWith('/movies/')) &&
      ['post', 'put', 'delete'].includes(method);

    if (isMovieMutation) {
      tokenToAttach = adminToken || userToken;
    } else if (url.startsWith('/users/')) {
      // 2. Personal user actions (watchlist, favorites) strictly require the user token
      tokenToAttach = userToken;
    } else if (url === '/auth/me') {
      // 3. User profile verification strictly requires user token
      tokenToAttach = userToken;
    } else {
      // 4. General protected requests: prioritize user token, fallback to admin
      tokenToAttach = userToken || adminToken;
    }

    if (tokenToAttach) {
      config.headers.Authorization = `Bearer ${tokenToAttach}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent, informative error extraction
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Unable to connect to the ChalChitra streaming service. Please check your internet connection.';

    if (error.response?.status === 401 && error.config?.url === '/auth/me') {
      // Stale user token detected during session validation
      localStorage.removeItem('chalchitra_token');
    }

    return Promise.reject(new Error(message));
  }
);

export default API;
