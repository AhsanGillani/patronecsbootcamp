import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  InputAdornment,
  Chip,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Search as SearchIcon,
  School,
  TrendingUp,
  EmojiEvents,
  Group,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useSearch } from '@/hooks/useSearch';

export const MuiHero = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const features = [
    {
      icon: <School />,
      title: 'Expert-Led Courses',
      description: 'Learn from industry professionals with real-world experience',
      color: '#1976d2',
    },
    {
      icon: <TrendingUp />,
      title: 'Skill Development',
      description: 'Build in-demand skills that advance your career',
      color: '#388e3c',
    },
    {
      icon: <EmojiEvents />,
      title: 'Certification',
      description: 'Earn recognized certificates upon course completion',
      color: '#f57c00',
    },
  ];

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4, alignItems: 'center' }}>
          {/* Left Content */}
          <Box sx={{ flex: 1, color: 'white', textAlign: { xs: 'center', lg: 'left' } }}>
            <Chip
              label="🚀 Join 50,000+ Learners"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
                mb: 3,
              }}
            />

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                fontWeight: 800,
                lineHeight: 1.1,
                mb: 3,
                color: 'white',
              }}
            >
              Master New Skills with Expert Guidance
            </Typography>

            <Typography
              variant="h5"
              sx={{
                mb: 4,
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              Access thousands of high-quality courses, learn at your own pace, and
              advance your career with industry-recognized certifications.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                component={Link}
                to="/courses"
                variant="contained"
                size="large"
                startIcon={<School />}
                sx={{
                  px: 4,
                  py: 2,
                  background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                }}
              >
                Browse Courses
              </Button>
              <Button
                component={Link}
                to="/auth?mode=register"
                variant="outlined"
                size="large"
                startIcon={<Group />}
                sx={{
                  px: 4,
                  py: 2,
                  color: 'white',
                  borderColor: 'white',
                }}
              >
                Join Free
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};