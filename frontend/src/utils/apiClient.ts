import axios from 'axios';
import { API_BASE } from './env';

// Get API base URL from environment
const API_BASE_URL = API_BASE;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add auth interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('daleel-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('daleel-token');
      localStorage.removeItem('daleel-user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Helper function for making fetch-style requests (for backward compatibility)
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('daleel-token');

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error((errorData as any).message || `HTTP error! status: ${response.status}`);
  }

  return response;
};

// Get backend URL for file uploads
const getUploadUrl = () => {
  // Always use the API_BASE_URL which handles the proxy correctly
  return API_BASE_URL;
};

// Upload helper for images
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('daleel-token');
  const uploadBaseUrl = getUploadUrl();
  
  const response = await fetch(`${uploadBaseUrl}/upload`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Upload error:', errorText);
    throw new Error('Failed to upload image');
  }

  const data = await response.json();
  return data.url;
};

export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const token = localStorage.getItem('daleel-token');
  const uploadBaseUrl = getUploadUrl();
  
  const response = await fetch(`${uploadBaseUrl}/upload/multiple`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Upload error:', errorText);
    throw new Error('Failed to upload images');
  }

  const data = await response.json();
  return data.files.map((f: any) => f.url);
};

// Export both the axios instance and the base URL
export { apiClient as default, API_BASE_URL };
