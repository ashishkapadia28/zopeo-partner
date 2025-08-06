import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current route is public
  const isPublicRoute = useCallback(() => {
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/'];
    return publicRoutes.includes(location.pathname);
  }, [location.pathname]);

  // Check if current route is auth-related
  const isAuthRoute = useCallback(() => {
    const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    return authRoutes.includes(location.pathname);
  }, [location.pathname]);

  // Check auth status on mount and when dependencies change
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        // Verify token and get user data
        const response = await authService.getCurrentUser();
        
        if (response) {
          setIsAuthenticated(true);
          
          // Redirect away from auth pages if already authenticated
          if (isAuthRoute()) {
            navigate('/dashboard', { replace: true });
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

    checkAuth();
  }, [navigate, location.pathname, isAuthRoute, isPublicRoute]);

  // Login function
  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await authService.login(credentials);
      if (response) {
        setIsAuthenticated(true);
        // Redirect to dashboard after successful login
        navigate('/dashboard', { replace: true });
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Check auth status
  const checkAuthStatus = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      return false;
    }
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };
};

export default useAuth;
