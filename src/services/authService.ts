import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';

// Base URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/v1';
console.log('API_BASE_URL:', API_BASE_URL);

// Global variables for token refresh queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Create separate API instances for different route prefixes
const createApiInstance = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor for auth token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for token refresh
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is not 401 or it's a refresh token request, reject
      if (error.response?.status !== 401 || originalRequest.url?.includes('/auth/refresh-token')) {
        return Promise.reject(error);
      }

      // If we're already refreshing, add to queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axios(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      // Mark that we're refreshing the token
      isRefreshing = true;
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token found');
        }

        // Use the authApi instance to refresh the token
        const response = await authApi.post<TokenResponse>('/auth/seller/refresh-token', {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Store the new tokens
        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Update the authorization header for the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Process any queued requests with the new token
        processQueue(null, accessToken);
        
        // Retry the original request with the new token
        return axios({
          ...originalRequest,
          baseURL: originalRequest.baseURL || API_BASE_URL,
          headers: {
            ...originalRequest.headers,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Clear auth data and redirect to login on refresh failure
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        processQueue(error, null);
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
  );

  return instance;
};

// Create API instances
const authApi = createApiInstance(API_BASE_URL);
const sellerApi = createApiInstance(`${API_BASE_URL}/seller`);

export { sellerApi };

// Interfaces
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
}

interface UserData {
  id: string;
  email: string;
  [key: string]: any;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Create axios instance with base URL
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or it's a retry request, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Mark this request as already tried to prevent infinite loops
    originalRequest._retry = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      // Use the authApi instance to refresh the token
      const response = await authApi.post<TokenResponse>('/auth/refresh-token', {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Store the new tokens
      localStorage.setItem('accessToken', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      // Update the authorization header
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      // Retry the original request with the new token
      return api(originalRequest);
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear auth data and redirect to login on refresh failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }
  }
);

const authService = {
  // Register new seller - Step 1: Send OTP
  register: async (data: RegisterData) => {
    try {
      const response = await authApi.post('/auth/seller/register', data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data.message || 'Registration failed. Please try again.'
        );
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error('Error setting up registration. Please try again.');
      }
    }
  },

  // Verify OTP - Step 2: Verify OTP and complete registration
  verifyOtp: async (email: string, otp: string) => {
    const response = await authApi.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  // Get seller details
  getSellerDetails: async () => {
    try {
      const response = await sellerApi.get('/seller/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching seller details:', error);
      return { data: null };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await authApi.get('/auth/seller/me');
    return response.data;
  },

  // Login user
  login: async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.post('/auth/seller/login', credentials);
      const { accessToken, refreshToken, user } = response.data;

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(user));

      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      return { user };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Login failed. Please try again.';
      throw new Error(errorMessage);
    }
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    const response = await authApi.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, password: string) => {
    const response = await authApi.post('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  },

  // Logout
  logout: () => {
    // Clear all auth data from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '/login';
  },

  // Get current user (synchronous)
  getCurrentUserSync: (): UserData | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user has completed onboarding (with caching)
  checkOnboardingStatus: (() => {
    let cache: { isComplete: boolean } | null = null;
    let isFetching = false;
    let currentPromise: Promise<{ isComplete: boolean }> | null = null;

    const checkStatus = async (force = false): Promise<{ isComplete: boolean }> => {
      // Return cached result if available and not forcing a refresh
      if (cache && !force) {
        return cache;
      }

      // If already fetching, return the existing promise
      if (isFetching && currentPromise) {
        return currentPromise;
      }

      // Set up the fetch
      isFetching = true;
      currentPromise = (async () => {
        try {
          const response = await sellerApi.get('/onboard/status');
          cache = response.data;
          return response.data;
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          return { isComplete: false };
        } finally {
          isFetching = false;
          currentPromise = null;
        }
      })();

      return currentPromise;
    };

    return checkStatus;
  })(),

  // Get auth header
  getAuthHeader: () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

export default authService;
