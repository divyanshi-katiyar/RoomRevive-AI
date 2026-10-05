import axios from 'axios';

// Base API configuration
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s for intensive AI tasks
});

let tokenGetter: (() => Promise<string | null>) | null = null;
let currentUserId: string | null = null;

export const setAuthTokenGetter = (
  getter: (() => Promise<string | null>) | null,
  userId: string | null = null
) => {
  tokenGetter = getter;
  currentUserId = userId;
};

// Request interceptor to automatically attach Clerk Bearer token and user identifier
apiClient.interceptors.request.use(async (config) => {
  if (tokenGetter) {
    try {
      const token = await tokenGetter();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('[ApiClient] Failed to acquire auth token:', err);
    }
  }

  if (currentUserId) {
    config.headers['x-user-id'] = currentUserId;
  }

  return config;
});
