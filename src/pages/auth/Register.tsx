import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import authService from '../../services/authService';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  Fade,
  FormHelperText,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Logo from '../../assets/logo/logo.svg';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      enqueueSnackbar('Please fill in all fields', { variant: 'error' });
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      enqueueSnackbar('Passwords do not match', { variant: 'error' });
      return false;
    }
    
    if (formData.password.length < 8) {
      enqueueSnackbar('Password must be at least 8 characters long', { variant: 'error' });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setIsLoading(true);
    console.log('Sending registration request...');
    
    try {
      // First send OTP to the user's email
      const registerData = {
        email: formData.email,
        password: formData.password
      };
      
      console.log('Calling authService.register with:', registerData);
      
      // This will send OTP to the user's email
      const response = await authService.register(registerData);
      
      console.log('Registration successful, navigating to OTP verification');
      
      // Store the email and password in session storage for OTP verification
      console.log('Storing credentials in sessionStorage');
      sessionStorage.setItem('registerEmail', formData.email);
      sessionStorage.setItem('registerPassword', formData.password);
      
      // Log before navigation
      console.log('Before navigation - sessionStorage:', {
        email: sessionStorage.getItem('registerEmail'),
        password: sessionStorage.getItem('registerPassword')
      });
      
      // Show success message before redirecting
      enqueueSnackbar('OTP sent to your email', { variant: 'success' });
      
      // Use navigate with replace to prevent going back to register
      console.log('Navigating to /verify-otp with state:', { 
        from: 'register',
        email: formData.email,
        password: '***' // Don't log actual password
      });
      
      navigate('/verify-otp', { 
        replace: true,
        state: { 
          from: 'register',
          email: formData.email,
          password: formData.password 
        }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      
      // Check if the error indicates email is already registered
      if (error.response?.status === 400 && errorMessage.toLowerCase().includes('already exists')) {
        enqueueSnackbar('This email is already registered. Please log in.', { variant: 'info' });
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              email: formData.email,
              from: '/onboarding' // This will be used to redirect to onboarding after login
            },
            replace: true 
          });
        }, 1500);
      } else {
        // For other errors, show the error message
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Fade in={true} timeout={500}>
          <Paper 
            elevation={0}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.04)',
            }}
          >
            <Box textAlign="center" mb={5}>
              <Box 
                component="img"
                src={Logo}
                alt="Nyrly"
                sx={{ 
                  height: 40, 
                  mb: 2,
                  display: 'block',
                  mx: 'auto',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              />
              <Typography variant="h5" component="h1" fontWeight={600} gutterBottom>
                Create your account
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: -3}}>
                Join Nyrly to start selling your products
              </Typography>
            </Box>
            
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '& fieldset': {
                      borderColor: 'divider',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: '1px',
                    },
                  },
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '& fieldset': {
                      borderColor: 'divider',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: '1px',
                    },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'primary.main',
                            backgroundColor: 'transparent',
                          },
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FormHelperText sx={{ mb: 2, ml: 1.5, fontSize: '0.75rem' }}>
                Password must be at least 8 characters long
              </FormHelperText>

              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '& fieldset': {
                      borderColor: 'divider',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: '1px',
                    },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'primary.main',
                            backgroundColor: 'transparent',
                          },
                        }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ 
                  mt: 3, 
                  py: 1.5, 
                  borderRadius: 3, 
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(39, 111, 244, 0.2)',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'primary.light',
                    color: 'white'
                  }
                }}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <Box mt={4} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Typography 
                    component={Link}
                    to="/login"
                    color="primary"
                    variant="body2"
                    sx={{ 
                      fontWeight: 600, 
                      textDecoration: 'none', 
                      '&:hover': { 
                        textDecoration: 'underline',
                        textUnderlineOffset: '3px',
                      } 
                    }}
                  >
                    Sign in
                  </Typography>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Register;
