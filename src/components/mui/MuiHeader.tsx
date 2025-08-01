import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  InputBase,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Container,
  Chip,
  Fade,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  AccountCircle,
  School,
  Dashboard,
  Person,
  ExitToApp,
  Close,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSearch } from '@/hooks/useSearch';

export const MuiHeader = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, profile, signOut } = useAuth();
  const { searchQuery, setSearchQuery, handleSearch } = useSearch();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    handleClose();
  };

  const getDashboardLink = () => {
    if (!profile?.role) return '/';
    switch (profile.role) {
      case 'admin':
        return '/admin';
      case 'instructor':
        return '/instructor';
      case 'student':
        return '/student';
      default:
        return '/';
    }
  };

  const handleSearchAction = () => {
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchAction();
  };

  const navigationItems = [
    { label: 'Home', path: '/' },
    { label: 'Courses', path: '/courses' },
    { label: 'Blog', path: '/blog' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const mobileMenu = (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
          Menu
        </Typography>
        <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </Box>
      
      <List sx={{ px: 1 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              sx={{
                borderRadius: 2,
                mx: 1,
                mb: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemText 
                primary={item.label} 
                sx={{ 
                  '& .MuiTypography-root': { 
                    fontWeight: 500,
                    color: 'white'
                  } 
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
        
        {!user && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  mb: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  },
                }}
              >
                <ListItemText 
                  primary="Sign In" 
                  sx={{ 
                    '& .MuiTypography-root': { 
                      fontWeight: 600,
                      color: 'white'
                    } 
                  }} 
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/auth?mode=register"
                onClick={() => setMobileMenuOpen(false)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  mb: 1,
                  backgroundColor: 'white',
                  color: '#1976d2',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
              >
                <ListItemText 
                  primary="Sign Up" 
                  sx={{ 
                    '& .MuiTypography-root': { 
                      fontWeight: 600,
                      color: '#1976d2'
                    } 
                  }} 
                />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar position="fixed" elevation={1}>
        <Container maxWidth="xl">
          <Toolbar sx={{ py: 1 }}>
            {/* Logo */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                mr: 4,
              }}
            >
              <School sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #1976d2, #388e3c)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Patronecs
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1, mr: 'auto' }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.label}
                    component={Link}
                    to={item.path}
                    sx={{
                      color: 'text.primary',
                      fontWeight: 500,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        color: 'primary.main',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Search Bar */}
            {!isMobile && (
              <Box
                component="form"
                onSubmit={handleSearchSubmit}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  borderRadius: 3,
                  px: 2,
                  py: 0.5,
                  mx: 2,
                  minWidth: 300,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                  },
                  '&:focus-within': {
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                  },
                }}
              >
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <InputBase
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    flex: 1,
                    '& input': {
                      padding: '4px 0',
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </Box>
            )}

            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Desktop Auth Buttons */}
              {!user && !isMobile && (
                <>
                  <Button
                    component={Link}
                    to="/auth?instructor=true"
                    variant="text"
                    sx={{
                      color: 'text.primary',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      },
                    }}
                  >
                    Teach on Patronecs
                  </Button>
                  <Button
                    component={Link}
                    to="/auth"
                    variant="outlined"
                    sx={{
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                      },
                    }}
                  >
                    Log in
                  </Button>
                  <Button
                    component={Link}
                    to="/auth?mode=register"
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1565c0, #0d47a1)',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                      },
                    }}
                  >
                    Sign up
                  </Button>
                </>
              )}

              {/* User Menu */}
              {user && (
                <>
                  <Chip
                    label={profile?.role || 'User'}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                  />
                  <IconButton
                    size="large"
                    onClick={handleMenu}
                    color="inherit"
                    sx={{
                      p: 0.5,
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        border: '2px solid',
                        borderColor: 'primary.main',
                      }}
                    >
                      {profile?.full_name?.[0] || user.email?.[0]}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        minWidth: 200,
                        borderRadius: 2,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                      },
                    }}
                    TransitionComponent={Fade}
                  >
                    <MenuItem
                      component={Link}
                      to={getDashboardLink()}
                      onClick={handleClose}
                      sx={{ gap: 2 }}
                    >
                      <Dashboard fontSize="small" />
                      Dashboard
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      to="/profile"
                      onClick={handleClose}
                      sx={{ gap: 2 }}
                    >
                      <Person fontSize="small" />
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleSignOut} sx={{ gap: 2, color: 'error.main' }}>
                      <ExitToApp fontSize="small" />
                      Sign out
                    </MenuItem>
                  </Menu>
                </>
              )}

              {/* Mobile Menu Button */}
              {isMobile && (
                <IconButton
                  size="large"
                  onClick={() => setMobileMenuOpen(true)}
                  color="inherit"
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    },
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Menu Drawer */}
      {mobileMenu}

      {/* Spacer to account for fixed AppBar */}
      <Toolbar />
    </>
  );
};