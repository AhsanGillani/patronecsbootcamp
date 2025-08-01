import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  TextField,
  Button,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  School,
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  YouTube,
  Send,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

export const MuiFooter = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const footerLinks = {
    'Quick Links': [
      { label: 'Home', path: '/' },
      { label: 'About Us', path: '/about' },
      { label: 'Contact', path: '/contact' },
      { label: 'FAQ', path: '/faq' },
    ],
    'Courses': [
      { label: 'All Courses', path: '/courses' },
      { label: 'Programming', path: '/courses?category=programming' },
      { label: 'Design', path: '/courses?category=design' },
      { label: 'Business', path: '/courses?category=business' },
    ],
    'Support': [
      { label: 'Help Center', path: '/help' },
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Student Support', path: '/support' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: <Facebook />, url: '#' },
    { name: 'Twitter', icon: <Twitter />, url: '#' },
    { name: 'LinkedIn', icon: <LinkedIn />, url: '#' },
    { name: 'Instagram', icon: <Instagram />, url: '#' },
    { name: 'YouTube', icon: <YouTube />, url: '#' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: 'white',
        pt: 6,
        pb: 2,
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <School sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #1976d2, #388e3c)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Patronecs
                </Typography>
              </Box>
              
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  lineHeight: 1.6,
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                Empowering learners worldwide with high-quality education. 
                Join thousands of students who have transformed their careers with our platform.
              </Typography>

              {/* Contact Info */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} />
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                    hello@patronecs.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} />
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                    +1 (555) 123-4567
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} />
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                    San Francisco, CA
                  </Typography>
                </Box>
              </Box>

              {/* Social Links */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {socialLinks.map((social) => (
                  <IconButton
                    key={social.name}
                    href={social.url}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Navigation Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <Grid item xs={6} md={2.67} key={title}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: 'primary.main',
                }}
              >
                {title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {links.map((link) => (
                  <Link
                    key={link.label}
                    component={RouterLink}
                    to={link.path}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      '&:hover': {
                        color: 'primary.main',
                        textDecoration: 'underline',
                      },
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}

          {/* Newsletter */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: 'primary.main',
              }}
            >
              Stay Updated
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mb: 3,
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: 1.6,
              }}
            >
              Subscribe to our newsletter for the latest courses, updates, and learning tips.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                placeholder="Enter your email"
                variant="outlined"
                size="small"
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              />
              <Button
                variant="contained"
                sx={{
                  px: 3,
                  background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0, #0d47a1)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Send sx={{ fontSize: 18 }} />
              </Button>
            </Box>
            
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.75rem',
              }}
            >
              We respect your privacy. Unsubscribe at any time.
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            py: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            © 2024 Patronecs. All rights reserved.
          </Typography>
          
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: { xs: 'center', sm: 'right' },
              fontStyle: 'italic',
            }}
          >
            "Education is the most powerful weapon which you can use to change the world." - Nelson Mandela
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};