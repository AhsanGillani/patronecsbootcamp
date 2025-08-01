import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery,
  Fade,
} from '@mui/material';
import CountUp from 'react-countup';
import {
  School,
  People,
  Star,
  TrendingUp,
} from '@mui/icons-material';

interface StatItemProps {
  icon: React.ReactElement;
  value: number;
  label: string;
  description: string;
  delay?: number;
}

const StatCard: React.FC<StatItemProps> = ({ icon, value, label, description, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Fade in={isVisible} timeout={800}>
      <Card
        sx={{
          height: '100%',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.95))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.15)',
            '& .stat-icon': {
              transform: 'scale(1.1) rotate(5deg)',
            },
            '& .stat-bg': {
              opacity: 1,
            },
          },
        }}
      >
        {/* Background Effect */}
        <Box
          className="stat-bg"
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, rgba(25, 118, 210, 0.1), rgba(56, 142, 60, 0.1))',
            opacity: 0.7,
            transition: 'all 0.3s ease',
          }}
        />

        <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
          {/* Icon */}
          <Box
            className="stat-icon"
            sx={{
              backgroundColor: 'primary.main',
              borderRadius: '50%',
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 8px 20px rgba(25, 118, 210, 0.3)',
              transition: 'all 0.3s ease',
            }}
          >
            {React.cloneElement(icon, {
              sx: { fontSize: 36, color: 'white' },
            })}
          </Box>

          {/* Value with CountUp Animation */}
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 1,
              background: 'linear-gradient(45deg, #1976d2, #388e3c)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {isVisible && <CountUp end={value} duration={2} />}
            {label.includes('Rating') && '/5'}
            {label.includes('Free') && '+'}
            {label.includes('Students') && 'K+'}
          </Typography>

          {/* Label */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 2,
              color: 'text.primary',
            }}
          >
            {label}
          </Typography>

          {/* Description */}
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              lineHeight: 1.6,
              fontSize: '0.95rem',
            }}
          >
            {description}
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );
};

export const MuiStats = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const stats = [
    {
      icon: <School />,
      value: 500,
      label: 'Free Courses',
      description: 'High-quality courses available at no cost',
    },
    {
      icon: <People />,
      value: 50,
      label: 'Students',
      description: 'Active learners from around the world',
    },
    {
      icon: <Star />,
      value: 4.8,
      label: 'Rating',
      description: 'Average rating from student feedback',
    },
    {
      icon: <TrendingUp />,
      value: 95,
      label: 'Success Rate',
      description: 'Students who complete their courses',
    },
  ];

  return (
    <Box
      sx={{
        py: 8,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 2px, transparent 2px)
          `,
          backgroundSize: '60px 60px',
          opacity: 0.5,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <Fade in timeout={600}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: 'white',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              Our Impact in Numbers
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6,
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              }}
            >
              Join thousands of learners who have transformed their careers with our platform
            </Typography>
          </Box>
        </Fade>

        {/* Stats Grid */}
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <StatCard
                {...stat}
                delay={index * 200}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};