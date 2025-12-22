/**
 * API Configuration
 * Centralized API base URL configuration for all API calls
 */

// Get API URL from environment variable, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_BASE_URL;
