import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box, Typography, Button, CircularProgress } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import Navbar from './components/Navbar';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Register from './pages/auth/Register';
import VerifyOtp from './pages/auth/VerifyOtp';
import OnboardingPage from './pages/onboarding';
import ProtectedRoute from './components/ProtectedRoute';
import useAuth from './hooks/useAuth';
import { AuthContext } from './contexts/AuthContext';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#276FF4',
      light: '#5D95F6',
      dark: '#1A4DAB',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

// Create AuthProvider component
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-otp'].includes(location.pathname);
    const isLandingPage = location.pathname === '/';
    
    // Only run auth checks for auth pages, not for landing page
    if (isLandingPage) return;
    
    // Special handling for OTP verification page
    if (location.pathname === '/verify-otp') {
      // If user is already authenticated, redirect to dashboard
      if (isAuthenticated) {
        navigate('http://localhost:8000', { 
          replace: true,
          state: { from: location.pathname }
        });
      }
      // If not authenticated but has OTP verification state, stay on OTP page
      else if (sessionStorage.getItem('registerEmail') && sessionStorage.getItem('registerPassword')) {
        return;
      }
      // If no OTP verification state, redirect to register
      else {
        navigate('/register', { replace: true });
      }
      return;
    }
    
    // Handle other auth pages
    if (isAuthenticated && isAuthPage) {
      // If authenticated and trying to access auth pages, redirect to dashboard
      navigate('http://localhost:8000', { 
        replace: true,
        state: { from: location.pathname }
      });
    } else if (!isAuthenticated && !isAuthPage) {
      navigate('/login', { 
        replace: true,
        state: { from: location.pathname }
      });
    }
  }, [isAuthenticated, isLoading, location, navigate]);

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      // Any cleanup if needed
    };
  }, []);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Landing page component
const LandingPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Navbar with full width background */}
      <Box sx={{ bgcolor: 'background.paper', width: '100%' }}>
        <Container maxWidth="xl">
          <Navbar onLogin={handleLogin} onRegister={handleRegister} />
        </Container>
      </Box>
      
      {/* Main content with consistent padding */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}>
        <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: 8 }}>
          <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto', width: '100%' }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
            Your products, your customers, your profits Grow with Nyrly.
            </Typography>
            <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Run your shop online with 0% commission, zero hustle, and everything you need to grow—powered by Nyrly.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleRegister}
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              Get Started
            </Button>
            0% Commission
          </Box>
        </Container>
      </Box>
      
      {/* Footer with full width background */}
      <Box component="footer" sx={{ 
        py: 3, 
        textAlign: 'center',
        bgcolor: 'background.paper',
        width: '100%'
      }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary">
            {new Date().getFullYear()} Nyrly. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                } />
                
                {/* Protected routes */}
{/* Example of a protected route that requires onboarding to be complete */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Box>Dashboard Content</Box>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </SnackbarProvider>
        </ThemeProvider>
      </AuthProvider>
    );
  };

export default App;
