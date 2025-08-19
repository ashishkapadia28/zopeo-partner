import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import Logo from '../../assets/logo/logo.svg';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      enqueueSnackbar('Please enter your email address', { variant: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      enqueueSnackbar('Password reset link sent to your email', { variant: 'success' });
      // Navigate back to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset link. Please try again.';
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
              <Typography variant="h5" component="h1" fontWeight={600} gutterBottom sx={{ mt: 3 }}>
                Forgot Password
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: -3}}>
                Enter your email and we'll send you a link to reset your password.
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                {isLoading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;
