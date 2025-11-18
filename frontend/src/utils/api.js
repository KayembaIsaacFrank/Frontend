/**
 * Axios API Client Configuration
 * 
 * Purpose: Centralized HTTP client for all backend API requests
 * - Configures base URL for API endpoints
 * - Adds JWT token to all requests automatically
 * - Handles authentication errors globally
 * - Provides consistent request/response handling
 * 
 * Features:
 * - Request interceptor: Adds Authorization header with JWT token
 * - Environment variable support: Uses VITE_API_URL or defaults to localhost
 * - JSON content type by default
 * 
 * Usage:
 * import api from '../utils/api';
 * const response = await api.get('/sales');
 * const data = await api.post('/procurement', payload);
 */

import axios from 'axios';

// Get API base URL from environment variable or use localhost
// Remove trailing slash if present
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';

// Create Axios instance with default configuration
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,  // Base URL for all API requests (e.g., http://localhost:5000/api)
  headers: {
    'Content-Type': 'application/json',  // Default content type for requests
  },
});

/**
 * Request Interceptor
 * 
 * Automatically adds JWT token to Authorization header for all requests
 * This ensures authenticated requests without manual header management
 * 
 * Flow:
 * 1. Get token from localStorage
 * 2. If token exists, add to Authorization header as "Bearer <token>"
 * 3. Send request with token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');  // Retrieve JWT token from localStorage
    if (token) {
      // Add Authorization header with Bearer token
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;  // Proceed with request
  },
  (error) => Promise.reject(error)  // Handle request configuration errors
);

// Export configured Axios instance for use throughout the application
export default api;
