import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, styled, useTheme, Step } from '@mui/material';
import { keyframes } from '@emotion/react';
import BusinessInfo from './components/BusinessInfo';
import AdditionalInfo from './components/AdditionalInfo';
import DocumentUpload from './components/DocumentUpload';
import ReviewSubmit from './components/ReviewSubmit';
import OnboardingSuccess from './components/OnboardingSuccess';
import OnboardingProgress from '../../components/OnboardingProgress';
import Logo from '../../assets/logo/logo.svg';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;


const StyledStep = styled(Step)<{ completed: boolean }>(({ theme, completed }) => ({
  '& .MuiStepLabel-label': {
    color: completed ? theme.palette.primary.main : theme.palette.text.secondary,
    fontWeight: completed ? 600 : 400,
    '&.Mui-active': {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
  },
}));

const FormContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: '20px',
  padding: theme.spacing(4),
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)',
  border: `1px solid ${theme.palette.grey[100]}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 15px 50px rgba(0, 0, 0, 0.08)',
    transform: 'translateY(-2px)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.down('xs')]: {
    padding: theme.spacing(2),
  },
}));

const STORAGE_KEY = 'onboarding_form_data';

const STEPS = [
  'Business Info',
  'Additional Info',
  'Documents',
  'Review & Submit'
];

const OnboardingPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
  }, []);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleFormDataUpdate = (data: Record<string, any>) => {
    const updatedData = {
      ...formData,
      ...data
    };
    setFormData(updatedData);
    // Save to localStorage whenever data is updated
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  };

  // Function to clear form data after successful submission
  const clearFormData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFormData({});
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <BusinessInfo onNext={handleNext} onDataUpdate={handleFormDataUpdate} />;
      case 1:
        return (
          <AdditionalInfo 
            onNext={handleNext} 
            onBack={handleBack} 
            onDataUpdate={handleFormDataUpdate}
            businessType={formData.businessType}
            businessCategory={formData.businessCategory}
          />
        );
      case 2:
        return <DocumentUpload onNext={handleNext} onBack={handleBack} onDataUpdate={handleFormDataUpdate} />;
      case 3:
        return (
          <ReviewSubmit 
            data={formData} 
            onBack={handleBack} 
            onComplete={() => {
              clearFormData();
              handleNext();
            }} 
          />
        );
      case 4:
        return <OnboardingSuccess />;
      default:
        return <div>Unknown step</div>;
    }
  };

  const theme = useTheme();

  // Animation keyframes
  const pulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  `;

  const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  `;

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.default',
    }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        py: 3, // Reduced from py: 4
        position: 'relative',
        overflow: 'hidden',
        '&:after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            py: 2 // Reduced from py: 4
          }}>
            <Box 
              component="img"
              src={Logo}
              alt="Nyrly Logo"
              sx={{ 
                height: { xs: 40, sm: 45 }, // Reduced from 50/60
                width: 'auto',
                mb: 2, // Reduced from mb: 3
                filter: 'brightness(0) invert(1)'
              }}
            />
            <Typography 
              variant="h4" 
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 1, // Reduced from mb: 2
                fontSize: { xs: '1.5rem', md: '1.75rem' }, // Reduced font size
                lineHeight: 1.2,
                maxWidth: '700px',
                mx: 'auto'
              }}
            >
              Welcome to Nyrly Partner Program
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{
                opacity: 0.9,
                maxWidth: '600px',
                mb: 0.5, // Reduced from mb: 1
                fontSize: { xs: '0.9rem', md: '1rem' }, // Reduced font size
              }}
            >
              Let's get you set up in just a few simple steps
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, py: { xs: 4, md: 6 } }}>
        <Container maxWidth="md">
          {/* Progress Bar */}
          <Box sx={{ mb: 6 }}>
            <OnboardingProgress steps={STEPS} activeStep={activeStep} />
          </Box>
          
          {/* Form Content */}
          <FormContainer>
            {renderStepContent(activeStep)}
          </FormContainer>
        </Container>
      </Box>
    </Box>
  );
};

export default OnboardingPage;
