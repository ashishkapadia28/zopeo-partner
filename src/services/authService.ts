import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

// Base URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/v1';
console.log('API_BASE_URL:', API_BASE_URL);

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
      
      // If error is not 401 or it's a retry request, reject
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        
        // Use a direct axios instance to avoid duplicate path segments
        const response = await axios.post<TokenResponse>(
          `${API_BASE_URL}/auth/seller/refresh-token`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const { accessToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return axios(originalRequest);
      } catch (error) {
        // If refresh fails, clear storage and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
  );

  return instance;
};

// Create API instances for different route prefixes
const authApi = createApiInstance(`${API_BASE_URL}/auth/seller`);
const sellerApi = createApiInstance(`${API_BASE_URL}/seller`);

export { sellerApi };

// Interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

interface UserData {
  id: string;
  email: string;
  // Add other user properties as needed
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user?: UserData;
}

// Create axios instance with base URL
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        
        const response = await api.post<TokenResponse>('/auth/seller/refresh-token', { refreshToken });
        const { accessToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        return api(originalRequest);
      } catch (error) {
        // If refresh fails, clear storage and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/seller/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

// Store auth state
let currentUser: UserData | null = {
  id: '',
  email: ''
};

const authService = {
  // Register new seller - Step 1: Send OTP
  register: async (data: RegisterData) => {
    console.log('Register request data:', data);
    try {
      const response = await authApi.post('/send-otp', {
        email: data.email,
        password: data.password
      });
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error:', error.message);
      }
      throw error; // Re-throw to handle in the component
    }
  },

  // Verify OTP - Step 2: Verify OTP and complete registration
  verifyOtp: async (email: string, otp: string) => {
    const response = await authApi.post('/verify-otp', { email, otp });
    return response.data;
  },

  // Get seller details
  getSellerDetails: async () => {
    try {
      const response = await sellerApi.get<{ user: UserData }>('/profile');
      currentUser = response.data.user || { id: '', email: '' };
      return { data: currentUser };
    } catch (error) {
      console.error('Error fetching seller details:', error);
      currentUser = null;
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const { data } = await authService.getSellerDetails();
    return data;
  },

  // Login user
  login: async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.post<TokenResponse>('/login', credentials);
      const { accessToken, refreshToken, user } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Update current user
      currentUser = user || { id: '', email: '' };
      
      return { user: currentUser };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    const response = await authApi.post('/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, password: string) => {
    const response = await authApi.post('/reset-password', { token, password });
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    currentUser = null;
    window.location.href = '/login';
  },
  
  // Get current user (synchronous)
  getCurrentUserSync: (): UserData | null => {
    return currentUser;
  },

  // For backward compatibility
  checkOnboardingStatus: async () => {
    return { isComplete: true }; // Always return true as onboarding is removed
  },

  // Get auth header
  getAuthHeader: () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

export default authService;
