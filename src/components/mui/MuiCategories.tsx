import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Skeleton,
  Alert,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Code,
  Palette,
  TrendingUp,
  Language,
  Camera,
  Psychology,
  ArrowForward,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';

const getIconForCategory = (categoryName: string) => {
  const iconMap: { [key: string]: React.ReactElement } = {
    'Programming': <Code />,
    'Design': <Palette />,
    'Business': <TrendingUp />,
    'Languages': <Language />,
    'Photography': <Camera />,
    'Psychology': <Psychology />,
  };
  return iconMap[categoryName] || <Code />;
};

export const MuiCategories = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { categories, loading, error } = useCategories();

  if (loading) {
    return (
      <Box sx={{ py: 8, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Skeleton variant="text" width="60%" height={60} sx={{ mx: 'auto', mb: 2 }} />
          <Skeleton variant="text" width="40%" height={30} sx={{ mx: 'auto', mb: 6 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3 }}>
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 8, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
            Failed to load categories. Please try again later.
          </Alert>
        </Container>
      </Box>
    );
  }

  const topCategories = categories?.slice(0, 4) || [];

  return (
    <Box sx={{ py: 8, backgroundColor: 'grey.50' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Fade in timeout={600}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(45deg, #1976d2, #388e3c)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Explore Categories
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
            >
              Discover courses across various domains and find your passion
            </Typography>
          </Box>
        </Fade>

        {/* Categories Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 6 }}>
          {topCategories.map((category, index) => (
            <Zoom key={category.id} in timeout={600} style={{ transitionDelay: `${index * 100}ms` }}>
              <Card
                component={Link}
                to={`/courses?category=${category.slug || category.name}`}
                sx={{
                  height: '100%',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease-in-out',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.15)',
                    '& .category-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    },
                    '& .category-bg': {
                      transform: 'scale(1.05)',
                      opacity: 0.8,
                    },
                  },
                }}
              >
                {/* Background Gradient */}
                <Box
                  className="category-bg"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '60%',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    transition: 'all 0.3s ease',
                    opacity: 0.9,
                  }}
                />
                
                <CardContent sx={{ position: 'relative', zIndex: 2, p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Icon */}
                  <Box
                    className="category-icon"
                    sx={{
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      width: 64,
                      height: 64,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {React.cloneElement(getIconForCategory(category.name), {
                      sx: { fontSize: 32, color: 'primary.main' },
                    })}
                  </Box>

                  {/* Content */}
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      color: 'white',
                    }}
                  >
                    {category.name}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      mb: 2,
                      flexGrow: 1,
                      lineHeight: 1.5,
                    }}
                  >
                    {category.description || `Explore ${category.name.toLowerCase()} courses`}
                  </Typography>

                  {/* Course Count Chip */}
                  <Chip
                    label="12+ courses"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontWeight: 500,
                      alignSelf: 'flex-start',
                    }}
                  />
                </CardContent>
              </Card>
            </Zoom>
          ))}
        </Box>

        {/* View All Button */}
        <Fade in timeout={800} style={{ transitionDelay: '400ms' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Button
              component={Link}
              to="/courses"
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                boxShadow: '0 4px 16px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0, #0d47a1)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              View All Categories
            </Button>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};