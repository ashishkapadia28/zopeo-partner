import React from 'react';
import { Box, Typography, styled } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { keyframes } from '@emotion/react';

interface Step {
  label: string;
  completed: boolean;
  active: boolean;
}

interface OnboardingProgressProps {
  steps: string[];
  activeStep: number;
}

const ProgressContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  position: 'relative',
  margin: '0 auto 40px',
  maxWidth: '600px',
  padding: '0 16px',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '16px',
    left: 'calc(12.5% + 8px)',
    right: 'calc(12.5% + 8px)',
    height: '2px',
    backgroundColor: '#E0E0E0',
    zIndex: 1,
  },
  '@media (max-width: 600px)': {
    padding: '0 8px',
    '&:before': {
      left: '16.666%',
      right: '16.666%',
    },
  },
});

const StepContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  zIndex: 2,
});

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const StepCircle = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'completed' && prop !== 'active',
})<{ completed: boolean; active: boolean }>(({ theme, completed, active }) => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '8px',
  backgroundColor: completed 
    ? theme.palette.primary.main 
    : active 
      ? '#E5EEFF'
      : '#E5EEFF',
  border: completed 
    ? `2px solid ${theme.palette.primary.main}`
    : active 
      ? `2px dashed ${theme.palette.primary.main}`
      : `2px solid ${theme.palette.grey[400]}`,
  position: 'relative',
  zIndex: 2,
  boxShadow: active ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
  '& .MuiSvgIcon-root': {
    color: 'white',
    fontSize: '16px',
  },
  ...(active && {
    animation: `${pulse} 1.5s infinite`,
  }),
  '& span': {
    color: completed ? 'white' : active ? theme.palette.primary.main : theme.palette.grey[600],
    fontSize: '14px',
    fontWeight: 600,
  },
}));

const StepLabel = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'completed' && prop !== 'active',
})<{ completed: boolean; active: boolean }>(({ theme, completed, active }) => ({
  fontSize: '14px',
  fontWeight: completed || active ? 700 : 400,
  color: completed || active ? theme.palette.primary.main : theme.palette.text.secondary,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  transition: 'all 0.3s ease',
  '@media (max-width: 600px)': {
    fontSize: '12px',
  },
}));

const ProgressLine = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'completed',
})<{ completed: boolean }>(({ theme, completed }) => ({
  position: 'absolute',
  top: '16px',
  left: 'calc(12.5% + 8px)',
  right: 'calc(12.5% + 8px)',
  height: '2px',
  backgroundColor: theme.palette.primary.main,
  zIndex: 2,
  transition: 'all 0.3s ease',
  transformOrigin: 'left',
  '@media (max-width: 600px)': {
    left: '16.666%',
    right: '16.666%',
  },
}));

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ steps, activeStep }) => {
  const progressSteps = steps.map((step, index) => ({
    label: step,
    completed: index < activeStep,
    active: index === activeStep,
  }));

  const calculateProgressWidth = () => {
    if (activeStep === 0) return '0%';
    if (activeStep >= steps.length - 1) return '100%';
    return `${(activeStep / (steps.length - 1)) * 100}%`;
  };

  const getStepPosition = (index: number) => {
    return (index / (steps.length - 1)) * 100;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <ProgressContainer>
        <ProgressLine 
          completed={activeStep > 0} 
          sx={{ 
            width: calculateProgressWidth(),
            ...(activeStep === 0 && { width: '0%' })
          }} 
        />
        {progressSteps.map((step, index) => (
          <StepContainer key={index}>
            <StepCircle 
              completed={step.completed} 
              active={step.active}
              sx={{
                ...(index <= activeStep && ({
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: (theme) => `1px solid ${step.completed ? 'transparent' : theme.palette.primary.main}20`,
                    animation: step.active ? `${pulse} 2s infinite` : 'none',
                  },
                })),
              }}
            >
              {step.completed ? (
                <CheckIcon sx={{ fontSize: '18px' }} />
              ) : (
                <span>{index + 1}</span>
              )}
            </StepCircle>
            <StepLabel completed={step.completed} active={step.active}>
              {step.label}
            </StepLabel>
          </StepContainer>
        ))}
      </ProgressContainer>
    </Box>
  );
};

export default OnboardingProgress;
