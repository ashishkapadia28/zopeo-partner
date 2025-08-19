import React from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';

const OnboardingSuccess: React.FC = () => {
  const navigate = useNavigate();
  
  const handleDashboardClick = () => {
    // Redirect to seller dashboard or home page
    navigate('/seller/dashboard');
  };
  
  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          p: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          mt: 4,
        }}
      >
        <CheckCircleOutlineIcon
          color="success"
          sx={{ fontSize: 80, mb: 3 }}
        />
        
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Application Submitted Successfully!
        </Typography>
        
        <Typography variant="h6" color="textSecondary" paragraph sx={{ mb: 4, maxWidth: '600px' }}>
          Thank you for submitting your seller application. Our team will review your information and get back to you within 2-3 business days.
        </Typography>
        
        <Box sx={{ mt: 2, mb: 4, width: '100%', maxWidth: '500px' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 2 }}>
            What's Next?
          </Typography>
          
          <Box sx={{ textAlign: 'left', pl: 2 }}>
            <Typography variant="body1" paragraph>
              • You will receive a confirmation email with your application details.
            </Typography>
            <Typography variant="body1" paragraph>
              • Our verification team will review your documents and information.
            </Typography>
            <Typography variant="body1" paragraph>
              • Once approved, you'll receive an email with login credentials and next steps.
            </Typography>
            <Typography variant="body1">
              • If we need additional information, we'll contact you via email.
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleDashboardClick}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              textTransform: 'none',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
              },
            }}
          >
            Go to Dashboard
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => window.print()}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 'medium',
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            Print Application
          </Button>
        </Box>
        
        <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid #eee', width: '100%' }}>
          <Typography variant="body2" color="textSecondary">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@nyrkart.com" style={{ color: '#1976d2', textDecoration: 'none' }}>
              support@nyrkart.com
            </a>{' '}
            or call us at +91-XXXXXXXXXX
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default OnboardingSuccess;
