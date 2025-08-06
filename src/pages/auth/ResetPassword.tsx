import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import authService from '../../services/authService';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Fade,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Logo from '../../assets/logo/logo.svg';

const ResetPassword: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password length
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, formData.password);
      setSuccess(true);
      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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
                textAlign: 'center'
              }}
            >
              <Box textAlign="center" mb={4}>
                <Box 
                  component="img"
                  src={Logo}
                  alt="Nyrkart"
                  sx={{ 
                    height: 40, 
                    mb: 2,
                    display: 'block',
                    mx: 'auto',
                  }}
                />
                <Typography variant="h5" component="h1" fontWeight={600} gutterBottom>
                  Password Reset Successful
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Your password has been successfully reset. Redirecting to login...
                </Typography>
                <Button
                  component={Link}
                  to="/login"
                  variant="contained"
                  sx={{
                    mt: 2,
                    py: 1.5, 
                    px: 4,
                    borderRadius: 3, 
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(39, 111, 244, 0.2)',
                    },
                  }}
                >
                  Back to Login
                </Button>
              </Box>
            </Paper>
          </Fade>
        </Container>
      </Box>
    );
  }

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
                alt="Nyrkart"
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
              <Typography variant="h5" component="h1" fontWeight={600} gutterBottom sx={{ mt: 3 }}>
                Reset Your Password
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
                Enter your new password below.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                helperText="Password must be at least 8 characters"
                sx={{ 
                  mb: 2,
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
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
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
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
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
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>

              <Box mt={4} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Remember your password?{' '}
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
                    Back to Login
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

export default ResetPassword;
