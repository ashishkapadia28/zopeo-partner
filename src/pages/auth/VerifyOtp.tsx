import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  CircularProgress,
} from '@mui/material';
import Logo from '../../assets/logo/logo.svg';

const VerifyOtp: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(true);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const { enqueueSnackbar } = useSnackbar();
  
  // Get email and password from session storage or location state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Load email and password from session storage or location state
  useEffect(() => {
    const loadCredentials = () => {
      console.log('VerifyOtp - Loading credentials...');
      console.log('Location state:', location.state);
      
      // First check location state (from navigation)
      if (location.state?.email && location.state?.password) {
        console.log('Found credentials in location state');
        const { email: stateEmail, password: statePassword } = location.state;
        setEmail(stateEmail);
        setPassword(statePassword);
        // Save to session storage in case of page refresh
        sessionStorage.setItem('registerEmail', stateEmail);
        sessionStorage.setItem('registerPassword', statePassword);
        setIsLoading(false);
        console.log('Credentials loaded from location state');
        return;
      }

      // Then check session storage
      console.log('Checking session storage for credentials');
      const savedEmail = sessionStorage.getItem('registerEmail');
      const savedPassword = sessionStorage.getItem('registerPassword');
      
      console.log('Session storage values:', { savedEmail, hasPassword: !!savedPassword });
      
      if (savedEmail && savedPassword) {
        console.log('Found credentials in session storage');
        setEmail(savedEmail);
        setPassword(savedPassword);
        setIsLoading(false);
        console.log('Credentials loaded from session storage');
      } else {
        // If no credentials found, redirect to register page
        console.error('No credentials found in location state or session storage');
        enqueueSnackbar('Please register first', { variant: 'error' });
        navigate('/register', { replace: true });
      }
    };

    loadCredentials();
  }, [navigate, enqueueSnackbar, location.state]);

  // Handle OTP input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    // Only allow numbers and empty string
    if (value && isNaN(Number(value))) return;
    
    // Update the current input value
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only the last character if multiple are pasted
    setOtp(newOtp);
    
    // Auto-focus next input when a digit is entered
    if (value && index < otp.length - 1) {
      const inputs = document.querySelectorAll<HTMLInputElement>('input[type="text"]');
      if (inputs[index + 1]) inputs[index + 1].focus();
    }
    
    // If this is the last input and has a value, focus the verify button
    if (value && index === otp.length - 1) {
      const verifyButton = document.getElementById('verify-otp-button');
      if (verifyButton) verifyButton.focus();
    }
  };
  
  // Handle paste event for OTP
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, ''); // Remove non-digits
    
    if (pastedData) {
      const newOtp = [...otp];
      const startIndex = 0; // Always start from first box when pasting
      
      // Fill OTP fields with pasted data
      for (let i = 0; i < pastedData.length && (startIndex + i) < otp.length; i++) {
        newOtp[startIndex + i] = pastedData[i];
      }
      
      setOtp(newOtp);
      
      // Focus the next empty field or verify button
      const nextIndex = Math.min(startIndex + pastedData.length, otp.length - 1);
      const inputs = document.querySelectorAll<HTMLInputElement>('input[type="text"]');
      
      if (nextIndex < otp.length - 1) {
        inputs[nextIndex]?.focus();
      } else {
        const verifyButton = document.getElementById('verify-otp-button');
        if (verifyButton) verifyButton.focus();
      }
    }
  };

  // Handle key down for navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const target = e.target as HTMLInputElement;
    const inputs = document.querySelectorAll<HTMLInputElement>('input[type="text"]');
    
    // Handle backspace
    if (e.key === 'Backspace') {
      // If there's a value, clear it but stay in the same field
      if (target.value) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } 
      // If no value, move to previous field
      else if (index > 0) {
        e.preventDefault();
        inputs[index - 1]?.focus();
      }
      return;
    }
    
    // Handle left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputs[index - 1]?.focus();
      return;
    }
    
    // Handle right arrow
    if (e.key === 'ArrowRight' && index < otp.length - 1) {
      e.preventDefault();
      inputs[index + 1]?.focus();
      return;
    }
    
    // Handle number input - auto move to next field
    if (/^[0-9]$/.test(e.key) && index < otp.length - 1) {
      // Let the change handler handle the value update and focus change
      // We need to use setTimeout to ensure the value is set before moving focus
      setTimeout(() => {
        if (inputs[index + 1]) inputs[index + 1].focus();
      }, 0);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    if (otp.some(digit => !digit)) {
      enqueueSnackbar('Please enter the complete OTP', { variant: 'error' });
      return;
    }

    const otpCode = otp.join('');
    setIsLoading(true);

    try {
      // 1. First verify the OTP
      await authService.verifyOtp(email, otpCode);
      
      // 2. Then log in the user
      try {
        const loginResponse = await authService.login({ email, password });
        
        if (loginResponse) {
          // 3. Only navigate if login was successful
          enqueueSnackbar('Registration successful!', { variant: 'success' });
          
          // 4. Redirect to dashboard after successful login
          window.location.href = 'http://localhost:8000';
        } else {
          throw new Error('Login failed after OTP verification');
        }
      } catch (loginError) {
        console.error('Auto-login after OTP verification failed:', loginError);
        // If auto-login fails, redirect to login page with email pre-filled
        navigate('/login', { 
          state: { 
            email,
            message: 'Please log in with your new account',
            variant: 'info'
          },
          replace: true 
        });
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.message || 'OTP verification failed. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (resendDisabled) return;
    
    try {
      await authService.register({
        email,
        password,
      });
      
      setCountdown(30);
      setResendDisabled(true);
      enqueueSnackbar('OTP resent successfully', { variant: 'success' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (countdown > 0 && resendDisabled) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, resendDisabled]);

  // Redirect if email or password is not available
  useEffect(() => {
    const savedEmail = sessionStorage.getItem('registerEmail');
    const savedPassword = sessionStorage.getItem('registerPassword');
    
    if ((!email || !password) && (!savedEmail || !savedPassword)) {
      enqueueSnackbar('Invalid access. Please register first.', { variant: 'error' });
      // Clear any existing state to prevent loops
      navigate('/register', { 
        replace: true,
        state: { 
          from: location.pathname,
          message: 'Please complete your registration',
          variant: 'info'
        }
      });
    } else if ((!email || !password) && savedEmail && savedPassword) {
      // If we have saved values in session storage but not in state, update the state
      setEmail(savedEmail);
      setPassword(savedPassword);
    }
  }, [email, password, enqueueSnackbar, navigate, location.pathname]);

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
              <Typography variant="h5" component="h1" fontWeight={600} gutterBottom>
                Verify Your Email
              </Typography>
              <Typography variant="body1" color="text.secondary">
                We've sent a 6-digit verification code to
              </Typography>
              <Typography variant="body1" fontWeight={600} color="text.primary">
                {email}
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 2, 
              mb: 4,
              '& .MuiTextField-root': {
                width: '50px',
                '& .MuiOutlinedInput-root': {
                  height: '60px',
                  '& input': {
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    padding: 0,
                    caretColor: 'transparent'
                  },
                  '& fieldset': {
                    borderColor: 'divider',
                    borderRadius: 3,
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: '1px',
                  },
                },
              },
            }}>
              {otp.map((data, index) => (
                <TextField
                  key={index}
                  type="text"
                  value={data}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>, index)}
                  onKeyDown={(e) => handleKeyDown(e as React.KeyboardEvent<HTMLInputElement>, index)}
                  onPaste={handlePaste}
                  onFocus={(e) => e.target.select()}
                  inputProps={{
                    maxLength: 1,
                    'aria-label': `Digit ${index + 1} of 6`
                  }}
                />
              ))}
            </Box>
            
            <Button
              fullWidth
              variant="contained"
              size="large"
              id="verify-otp-button"
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.some(digit => !digit)}
              sx={{ 
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
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 4, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Didn't receive the code?{' '}
                <Typography
                  component="span"
                  onClick={!resendDisabled ? handleResendOtp : undefined}
                  sx={{
                    color: !resendDisabled ? 'primary.main' : 'text.disabled',
                    cursor: !resendDisabled ? 'pointer' : 'default',
                    fontWeight: 600,
                    '&:hover': !resendDisabled ? {
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px',
                    } : {},
                  }}
                >
                  {resendDisabled ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </Typography>
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Check your spam folder if you can't find the email
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default VerifyOtp;
