import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledOfferBar = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main, // Using theme primary color
  color: '#ffffff',
  width: '100vw',
  position: 'relative',
  left: '50%',
  right: '50%',
  marginLeft: '-50vw',
  marginRight: '-50vw',
  padding: theme.spacing(0.75, 0),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5, 0),
  },
}));

const OfferText = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  fontSize: '0.875rem',
  fontWeight: 500,
}));

const OfferBar: React.FC = () => {
  return (
    <StyledOfferBar>
  <Container maxWidth={false} sx={{ display: 'flex', justifyContent: 'center' }}>
    <Typography 
      variant="body2" 
      component="div" 
      sx={{ 
        fontWeight: 500,
        // textAlign: 'center',
        // display: 'flex',
        // alignItems: 'center',
        // justifyContent: 'center',
        gap: 0.5,
      }}
    >
      🎁 Limited Offer: 30% OFF for new sellers. Set up your Nyrly store now!{' '}
      <Link
        href="/offers"
        color="inherit"
        sx={{
          fontWeight: 600,
          textDecoration: 'none',
          display: 'inline-flex',
        //   alignItems: 'center',
          ml: 0.5,
          '&:hover': {
            color: 'white',
            textDecoration: 'none',
          },
        }}
      >
        Claim Now
      </Link>
    </Typography>
  </Container>
</StyledOfferBar>
  );
};

export default OfferBar;
