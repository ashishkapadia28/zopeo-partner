import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Fade,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Logo from '../../assets/logo/logo.svg';

const Login: React.FC = () => {
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Show message from OTP verification if present
  useEffect(() => {
    if (location.state?.message) {
      enqueueSnackbar(location.state.message, { 
        variant: location.state.variant || 'info' 
      });
      // Clear the state to prevent showing the message again on re-render
      window.history.replaceState({}, document.title);
    }
  }, [location.state, enqueueSnackbar]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      enqueueSnackbar('Please fill in all fields', { variant: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      enqueueSnackbar('Login successful!', { variant: 'success' });
      // The login function from useAuth will handle the redirection
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
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
            <Typography variant="h5" component="h1" fontWeight={600} gutterBottom sx={{ mt:3}}>
             Login to your account
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: -3}}>
              Please enter your credentials to continue.
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
              autoComplete="current-password"
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

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              my: 2
            }}>
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    disabled={isLoading}
                  />
                }
                label="Remember me"
                sx={{ 
                  alignSelf: 'flex-start',
                  '& .MuiTypography-root': {
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                  },
                }}
              />
              <Typography 
                component={Link}
                to="/forgot-password"
                color="primary"
                variant="body2"
                sx={{ 
                  textDecoration: 'none', 
                  '&:hover': { 
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                  } 
                }}
              >
                Forgot password?
              </Typography>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ 
                mt: 1, 
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
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>

            <Box mt={4} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Typography 
                  component={Link}
                  to="/register"
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
                  Create an account
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

export default Login;
