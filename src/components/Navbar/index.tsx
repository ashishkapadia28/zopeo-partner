import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Link as ScrollLink, scroller } from 'react-scroll';
import {
  AppBar,
  Toolbar,
  Button,
  Container,
  Box,
  useMediaQuery,
  useTheme,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Stack,
  Menu,
  MenuItem,
  useScrollTrigger,
  Slide
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Logo from '../../assets/logo/logo.svg';
import OfferBar from '../OfferBar';

import { useAuthContext } from '../../contexts/AuthContext';

interface NavbarProps {
  onLogin: () => void;
  onRegister: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onLogin,
  onRegister,
}) => {
  const { isAuthenticated, logout } = useAuthContext();
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Navigation items with section IDs for single-page navigation
  const navItems = [
    { label: 'Home', section: 'hero' },
    { label: 'Features', section: 'features' },
    { label: 'Pricing', section: 'pricing' },
    { label: 'About', section: 'about' },
    { label: 'Contact', section: 'contact' },
  ].map(item => ({
    ...item,
    label: item.label.charAt(0).toUpperCase() + item.label.slice(1).toLowerCase()
  }));

  // Handle scroll to section
  const scrollToSection = (sectionId: string) => {
    scroller.scrollTo(sectionId, {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart',
      offset: -80,
    });
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Hide app bar on scroll down
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  // Mobile drawer content
  const drawer = (
    <Box sx={{ width: 280, p: 2, bgcolor: 'background.paper', height: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        py: 1
      }}>
        <ScrollLink 
          to="hero" 
          smooth={true} 
          duration={800} 
          offset={-80}
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            textDecoration: 'none',
          }}
        >
          <img 
            src={Logo} 
            alt="Logo" 
            style={{ 
              height: 36,
              width: 'auto',
              objectFit: 'contain',
            }}
          />
        </ScrollLink>
        <IconButton 
          onClick={handleDrawerToggle}
          sx={{
            color: 'text.primary',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <List sx={{ py: 1 }}>
        {navItems.map((item) => {
          const isSelected = location.hash === `#${item.section}`;
          return (
            <ListItem key={item.section} disablePadding>
              <ListItemButton 
                onClick={() => scrollToSection(item.section)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  ...(isSelected && {
                    backgroundColor: 'action.selected',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                  }),
                }}
              >
                <ListItemText 
                  primary={item.label} 
                  sx={{ 
                    fontWeight: isSelected ? 600 : 400,
                    fontFamily: 'Poppins, sans-serif',
                    color: isSelected ? 'primary.main' : 'text.primary',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ mt: 2, p: 2 }}>
        {isAuthenticated ? (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => {
              logout();
              handleMenuClose();
            }}
            sx={{ 
              borderRadius: 2,
              py: 1.5,
              fontWeight: 500,
              fontFamily: 'Poppins, sans-serif',
              textTransform: 'none',
            }}
          >
            Logout
          </Button>
        ) : (
          <Stack spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={onLogin}
              sx={{ 
                borderRadius: 2,
                py: 1.5,
                fontWeight: 500,
                fontFamily: 'Poppins, sans-serif',
                textTransform: 'none',
              }}
            >
              Login
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={onRegister}
              sx={{ 
                borderRadius: 2,
                py: 1.5,
                fontWeight: 500,
                fontFamily: 'Poppins, sans-serif',
                textTransform: 'none',
              }}
            >
              Register
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );

  // Desktop navigation
  const desktopNav = (
    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
      <Stack direction="row" spacing={0.5}>
        {navItems.map((item) => {
          const isSelected = location.hash === `#${item.section}`;
          return (
            <Button
              key={item.section}
              onClick={() => scrollToSection(item.section)}
              sx={{
                px: 3,
                py: 2,
                color: isSelected ? 'primary.main' : 'text.secondary',
                fontWeight: isSelected ? 700 : 500,
                fontFamily: 'Poppins, sans-serif',
                textTransform: 'none',
                fontSize: '1rem',
                position: 'relative',
                borderRadius: 0,
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: 'primary.main',
                },
                transition: 'color 0.2s ease-in-out',
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );

  return (
    <>
      <OfferBar />
      <Slide appear={false} direction="down" in={!trigger}>
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{
            backgroundColor: 'background.paper',
            color: 'text.primary',
            border: 'none',
            boxShadow: 'none',
            '&.MuiAppBar-root': {
              boxShadow: 'none',
            },
          }}
        >
          <Container maxWidth={false}>
            <Toolbar disableGutters sx={{ minHeight: 72, py: 1 }}>
              {/* Logo */}
              <Box 
                sx={{ 
                  flexGrow: { xs: 1, lg: 0 }, 
                  display: 'flex', 
                  alignItems: 'center',
                  '&:hover': {
                    opacity: 0.9,
                  },
                }}
              >
                <ScrollLink 
                  to="hero" 
                  smooth={true} 
                  duration={800} 
                  offset={-80}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    textDecoration: 'none',
                  }}
                >
                  <img 
                    src={Logo} 
                    alt="Logo" 
                    style={{ 
                      height: 40,
                      width: 'auto',
                      objectFit: 'contain',
                    }}
                  />
                </ScrollLink>
              </Box>

              {/* Desktop Navigation */}
              {!isMobile && desktopNav}

              {/* Auth Buttons - Desktop */}
              {!isMobile && (
                <Stack direction="row" spacing={2} sx={{ ml: 'auto' }}>
                  {isAuthenticated ? (
                    <>
                      <IconButton
                        size="large"
                        edge="end"
                        aria-label="account of current user"
                        aria-haspopup="true"
                        onClick={handleProfileMenuOpen}
                        color="inherit"
                        sx={{
                          p: 1,
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <AccountCircle />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                          elevation: 0,
                          sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                              width: 32,
                              height: 32,
                              ml: -0.5,
                              mr: 1,
                            },
                            '&:before': {
                              content: '""',
                              display: 'block',
                              position: 'absolute',
                              top: 0,
                              right: 14,
                              width: 10,
                              height: 10,
                              bgcolor: 'background.paper',
                              transform: 'translateY(-50%) rotate(45deg)',
                              zIndex: 0,
                            },
                          },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                      >
                        <MenuItem 
                          component={RouterLink} 
                          to="/profile"
                          onClick={handleMenuClose}
                          sx={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          My Profile
                        </MenuItem>
                        <MenuItem 
                          component={RouterLink} 
                          to="/dashboard"
                          onClick={handleMenuClose}
                          sx={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          Dashboard
                        </MenuItem>
                        <Divider />
                        <MenuItem 
                          onClick={() => {
                            logout();
                            handleMenuClose();
                            window.location.href = '/';
                          }}
                          sx={{ 
                            color: 'error.main',
                            fontFamily: 'Poppins, sans-serif',
                            '&:hover': {
                              backgroundColor: 'error.light',
                              color: 'error.contrastText',
                            },
                          }}
                        >
                          Logout
                        </MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={onLogin}
                        sx={{ 
                          borderRadius: 15,
                          px: 3,
                          py: 1,
                          fontWeight: 500,
                          fontFamily: 'Poppins, sans-serif',
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        Log In
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={onRegister}
                        sx={{ 
                          borderRadius: 15,
                          px: 3,
                          py: 1,
                          fontWeight: 500,
                          fontFamily: 'Poppins, sans-serif',
                          textTransform: 'none',
                          boxShadow: 'none',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                          },
                        }}
                      >
                        Register Now
                      </Button>
                    </Stack>
                  )}
                </Stack>
              )}

              {/* Mobile menu button */}
              <Box sx={{ display: { xs: 'flex', lg: 'none' }, ml: 'auto' }}>
                <IconButton
                  size="large"
                  aria-label="menu"
                  onClick={handleDrawerToggle}
                  color="inherit"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </Slide>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box',
            width: 280,
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
