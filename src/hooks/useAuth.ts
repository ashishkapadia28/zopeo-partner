import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string) => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current route is public
  const isPublicRoute = useCallback((): boolean => {
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/'];
    return publicRoutes.includes(location.pathname);
  }, [location.pathname]);

  // Check if current route is auth-related
  const isAuthRoute = useCallback((): boolean => {
    const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    return authRoutes.includes(location.pathname);
  }, [location.pathname]);

  // Track onboarding status in state
  const [onboardingStatus, setOnboardingStatus] = useState<{ isComplete: boolean } | null>(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);

  // Check auth status
  const checkAuth = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setIsAuthenticated(false);
        setOnboardingStatus(null);
        if (!isPublicRoute()) {
          navigate('/login', { replace: true });
        }
        return;
      }

      // If we're already on the onboarding page, don't redirect
      if (location.pathname === '/onboarding') {
        setIsAuthenticated(true);
        return;
      }

      // First check if we have onboarding status in state
      if (onboardingStatus) {
        setIsAuthenticated(true);
        if (isAuthRoute() || location.pathname === '/') {
          const targetPath = onboardingStatus.isComplete ? '/seller/dashboard' : '/onboarding';
          if (location.pathname !== targetPath) {
            navigate(targetPath, { replace: true });
          }
        }
        return;
      }

      // If no onboarding status, check it directly
      if (!isCheckingOnboarding) {
        try {
          setIsCheckingOnboarding(true);
          const status = await authService.checkOnboardingStatus();
          setOnboardingStatus(status);
          setIsAuthenticated(true);
          
          if (isAuthRoute() || location.pathname === '/') {
            const targetPath = status.isComplete ? '/seller/dashboard' : '/onboarding';
            if (location.pathname !== targetPath) {
              navigate(targetPath, { replace: true });
            }
          }
          return;
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          // If we can't check onboarding status, try the full auth flow
        } finally {
          setIsCheckingOnboarding(false);
        }
      }

      // Fallback to full auth check if needed
      const response = await authService.getCurrentUser();
      
      if (response) {
        setIsAuthenticated(true);
        
        // Only check onboarding status if we haven't processed it yet or if we're on an auth route
        if ((!onboardingStatus && !isCheckingOnboarding) || isAuthRoute() || location.pathname === '/') {
          try {
            setIsCheckingOnboarding(true);
            // Check onboarding status with force refresh if needed
            const status = await authService.checkOnboardingStatus();
            setOnboardingStatus(status);
            
            // Only redirect if we're on an auth route or home page
            if (isAuthRoute() || location.pathname === '/') {
              if (status.isComplete) {
                navigate('/seller/dashboard', { replace: true });
              } else {
                navigate('/onboarding', { replace: true });
              }
            }
          } catch (error) {
            console.error('Error checking onboarding status:', error);
            // On error, clear tokens and redirect to login
            setIsAuthenticated(false);
            setOnboardingStatus(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            navigate('/login', { replace: true });
          } finally {
            setIsCheckingOnboarding(false);
          }
        }
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        if (!isPublicRoute()) {
          navigate('/login', { 
            replace: true,
            state: { from: location.pathname }
          });
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      if (!isPublicRoute()) {
        navigate('/login', { 
          replace: true,
          state: { from: location.pathname }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status on mount and when location changes
  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
    };
    verifyAuth();
  }, [location.pathname, checkAuth]);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await authService.login({ email, password });
      if (response) {
        // Check onboarding status after successful login
        const onboardingStatus = await authService.checkOnboardingStatus();
        if (onboardingStatus.isComplete) {
          navigate('/seller/dashboard', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Logout function
  const logout = (): void => {
    authService.logout();
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Register function
  const register = async (email: string, password: string): Promise<void> => {
    try {
      await authService.register({ email, password });
      // After registration, user will be redirected to OTP verification
      // and then to onboarding flow
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    checkAuth,
  };
};

export default useAuth;
