import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  Chip,
  Avatar,
  Rating,
  Skeleton,
  Alert,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
} from '@mui/material';
import {
  PlayArrow,
  Schedule,
  People,
  Star,
  ArrowForward,
  School,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useCourses } from '@/hooks/useCourses';

export const MuiCourses = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { courses, loading, error } = useCourses();

  if (loading) {
    return (
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Skeleton variant="text" width="60%" height={60} sx={{ mx: 'auto', mb: 2 }} />
          <Skeleton variant="text" width="40%" height={30} sx={{ mx: 'auto', mb: 6 }} />
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} lg={4} key={index}>
                <Card>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={30} />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={20} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
            Failed to load courses. Please try again later.
          </Alert>
        </Container>
      </Box>
    );
  }

  const featuredCourses = courses?.slice(0, 6) || [];

  return (
    <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
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
              Featured Courses
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
            >
              Start learning with our most popular and highly-rated courses
            </Typography>
          </Box>
        </Fade>

        {/* Courses Grid */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {featuredCourses.map((course, index) => (
            <Grid item xs={12} sm={6} lg={4} key={course.id}>
              <Zoom in timeout={600} style={{ transitionDelay: `${index * 100}ms` }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease-in-out',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 28px rgba(0, 0, 0, 0.15)',
                      '& .course-image': {
                        transform: 'scale(1.05)',
                      },
                      '& .play-button': {
                        opacity: 1,
                        transform: 'translate(-50%, -50%) scale(1)',
                      },
                    },
                  }}
                >
                  {/* Course Image */}
                  <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                    <CardMedia
                      className="course-image"
                      component="img"
                      height="200"
                      image={course.thumbnail_url || '/placeholder.svg'}
                      alt={course.title}
                      sx={{
                        transition: 'all 0.3s ease',
                        backgroundColor: 'grey.100',
                      }}
                    />
                    
                    {/* Play Button Overlay */}
                    <Box
                      className="play-button"
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) scale(0.8)',
                        opacity: 0,
                        transition: 'all 0.3s ease',
                        backgroundColor: 'rgba(25, 118, 210, 0.9)',
                        borderRadius: '50%',
                        width: 60,
                        height: 60,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <PlayArrow sx={{ color: 'white', fontSize: 32 }} />
                    </Box>

                    {/* Level Badge */}
                    <Chip
                      label={course.level}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        backgroundColor: 'primary.main',
                        color: 'white',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    />

                    {/* Free Badge */}
                    <Chip
                      label="FREE"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        backgroundColor: 'success.main',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    {/* Course Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {course.title}
                    </Typography>

                    {/* Course Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {course.description}
                    </Typography>

                    {/* Course Stats */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {course.total_duration || 0}min
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {course.total_enrollments || 0} students
                        </Typography>
                      </Box>
                    </Box>

                    {/* Rating */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <Rating value={4.8} precision={0.1} size="small" readOnly />
                      <Typography variant="caption" color="text.secondary">
                        4.8 (124 reviews)
                      </Typography>
                    </Box>

                    {/* Enroll Button */}
                    <Button
                      component={Link}
                      to={`/course/${course.id}`}
                      variant="contained"
                      fullWidth
                      startIcon={<School />}
                      sx={{
                        py: 1.5,
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1565c0, #0d47a1)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Enroll Free
                    </Button>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* View All Button */}
        <Fade in timeout={800} style={{ transitionDelay: '600ms' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Button
              component={Link}
              to="/courses"
              variant="outlined"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              View All Courses
            </Button>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};