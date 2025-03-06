import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  IconButton,
  Card,
  CardContent,
  useTheme,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Button,
  useMediaQuery,
  Fade,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  DarkMode,
  LightMode,
  DirectionsBus,
  Receipt,
  History,
  LocationOn,
  Support,
  ArrowBack,
  Dashboard as DashboardIcon,
  AccessTime,
  EventSeat,
  Logout,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Add auth context import
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

// Slideshow images
const busImages = [
  'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?auto=format&fit=crop&q=80',
];

const CustomerDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const { logout } = useAuth(); // Get logout function from auth context
  const { darkMode, toggleDarkMode } = useCustomTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const drawerWidth = 240;

  const handleLogout = async () => {
    try {
      setDrawerOpen(false);
      
      // First clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Call logout function
      await logout();
      
      // Force a hard redirect to home page
      window.location.href = '/';
      
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/customer/dashboard' },
    { text: 'My Bookings', icon: <Receipt />, path: '/bookings' },
    { text: 'Book a Trip', icon: <DirectionsBus />, path: '/booking' },
    { text: 'Track Location', icon: <LocationOn />, path: '/track' },
    { text: 'Support', icon: <Support />, path: '/support' },
    { 
      text: 'Logout', 
      icon: <Logout />, 
      onClick: handleLogout,
      divider: true,
      sx: { 
        color: 'error.main',
        '&:hover': {
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,0,0,0.1)' : 'rgba(255,0,0,0.05)',
        },
      }
    },
  ];

  // Slideshow effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === busImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const stats = {
    totalBookings: 15,
    upcomingTrips: 2,
    completedTrips: 13,
    savedLocations: 5,
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      width: '100vw',
      bgcolor: darkMode ? '#121212' : 'background.default',
      overflow: 'hidden'
    }}>
      {/* Top AppBar with menu */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: darkMode ? '#1a1a1a' : theme.palette.primary.main,
          boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => navigate(-1)}
            sx={{ 
              mr: 1,
              '&:hover': {
                bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }
            }}
          >
            <ArrowBack />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ 
              mr: 2,
              '&:hover': {
                bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Rwanda Bus Booking
          </Typography>
          <IconButton 
            color="inherit" 
            onClick={toggleDarkMode}
            sx={{ 
              '&:hover': {
                bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }
            }}
          >
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Menu Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 240,
            bgcolor: darkMode ? '#1a1a1a' : 'background.paper',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, color: darkMode ? 'white' : 'text.primary' }}>
            Menu
          </Typography>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <Box key={item.text}>
              {item.divider && <Divider sx={{ my: 1 }} />}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else {
                      navigate(item.path);
                    }
                    setDrawerOpen(false);
                  }}
                  sx={item.sx}
                >
                  <ListItemIcon sx={item.sx}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      sx: {
                        color: item.sx?.color,
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </Box>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          mt: 8,
          bgcolor: darkMode ? '#121212' : 'background.default',
          color: darkMode ? 'white' : 'text.primary',
          overflowX: 'hidden',
        }}
      >
        {/* Welcome Section with Slideshow */}
        <Paper
          elevation={darkMode ? 8 : 2}
          sx={{
            position: 'relative',
            width: '100%',
            borderRadius: { xs: 2, sm: 3 },
            overflow: 'hidden',
            aspectRatio: { xs: '16/6', sm: '21/6' },
            mb: 3,
            bgcolor: darkMode ? '#1a1a1a' : 'background.paper',
            boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <Fade in={true} timeout={1000}>
            <Box
              component="img"
              src={busImages[currentImageIndex]}
              alt="Bus"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                filter: 'brightness(0.4)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            />
          </Fade>
          <Box
            sx={{
              position: 'relative',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              textAlign: 'center',
              p: { xs: 1.5, sm: 2 },
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.4))',
            }}
          >
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{
                fontSize: { xs: '1.2rem', sm: '1.8rem', md: '2.2rem' },
                fontWeight: 600,
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                mb: { xs: 0.5, sm: 1 },
              }}
            >
              Welcome back, 
            </Typography>
            <Typography 
              variant="h6"
              sx={{
                fontSize: { xs: '0.8rem', sm: '1rem', md: '1.1rem' },
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                maxWidth: '800px',
                opacity: 0.9,
              }}
            >
              Your trusted partner in comfortable and safe travel
            </Typography>
          </Box>
        </Paper>

        {/* Stats Grid */}
        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: 3 }}>
          {[
            { title: 'Total Bookings', value: stats.totalBookings, icon: <DirectionsBus /> },
            { title: 'Upcoming Trips', value: stats.upcomingTrips, icon: <Receipt /> },
            { title: 'Completed Trips', value: stats.completedTrips, icon: <History /> },
            { title: 'Saved Locations', value: stats.savedLocations, icon: <LocationOn /> },
          ].map((stat, index) => (
            <Grid item xs={6} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: darkMode ? '#1a1a1a' : 'background.paper',
                    color: darkMode ? 'white' : 'text.primary',
                    boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      transition: 'transform 0.3s ease-in-out',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: darkMode ? 'primary.dark' : 'primary.light',
                          color: darkMode ? 'white' : 'primary.main',
                        }}
                      >
                        {stat.icon}
                      </Avatar>
                    </Box>
                    <Typography 
                      variant="h4" 
                      component="div"
                      sx={{
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                        fontWeight: 600,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: darkMode ? 'grey.400' : 'text.secondary',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      }}
                    >
                      {stat.title}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Available Buses Today */}
        <Paper
          elevation={darkMode ? 8 : 2}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            bgcolor: darkMode ? '#1a1a1a' : 'background.paper',
            boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.7rem' },
                fontWeight: 600,
                color: darkMode ? 'primary.light' : 'primary.main',
              }}
            >
              Available Buses Today
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate('/booking')}
              startIcon={<DirectionsBus />}
              sx={{
                borderColor: darkMode ? 'primary.light' : 'primary.main',
                color: darkMode ? 'primary.light' : 'primary.main',
                '&:hover': {
                  borderColor: darkMode ? 'primary.main' : 'primary.dark',
                  bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                },
              }}
            >
              View All
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            {[
              { id: 1, name: 'Bus 1', type: 'Luxury', availableSeats: 20, departureTime: '08:00', arrivalTime: '10:00', price: 500 },
              { id: 2, name: 'Bus 2', type: 'Standard', availableSeats: 30, departureTime: '10:00', arrivalTime: '12:00', price: 300 },
              { id: 3, name: 'Bus 3', type: 'Economy', availableSeats: 40, departureTime: '12:00', arrivalTime: '14:00', price: 200 },
            ].map((bus) => (
              <Grid item xs={12} sm={6} md={4} key={bus.id}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      height: '100%',
                      bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'background.paper',
                      '&:hover': {
                        bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      },
                      border: '1px solid',
                      borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <DirectionsBus 
                        color="primary"
                        sx={{ fontSize: '1.8rem' }}
                      />
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: { xs: '1.1rem', sm: '1.2rem' },
                            fontWeight: 600,
                            color: darkMode ? 'white' : 'text.primary',
                          }}
                        >
                          {bus.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.9rem',
                            color: darkMode ? 'grey.400' : 'text.secondary',
                          }}
                        >
                          {bus.type}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <AccessTime 
                          sx={{ 
                            fontSize: '1.2rem',
                            color: darkMode ? 'grey.400' : 'text.secondary',
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.9rem',
                            color: darkMode ? 'grey.400' : 'text.secondary',
                          }}
                        >
                          {bus.departureTime} - {bus.arrivalTime}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventSeat 
                          sx={{ 
                            fontSize: '1.2rem',
                            color: darkMode ? 'grey.400' : 'text.secondary',
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.9rem',
                            color: darkMode ? 'grey.400' : 'text.secondary',
                          }}
                        >
                          {bus.availableSeats} seats available
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-end',
                      mt: 'auto',
                    }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          color: darkMode ? 'primary.light' : 'primary.main',
                        }}
                      >
                        KES {bus.price}
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate('/booking')}
                        sx={{
                          bgcolor: darkMode ? 'primary.dark' : 'primary.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: darkMode ? 'primary.main' : 'primary.dark',
                          },
                        }}
                      >
                        Book Now
                      </Button>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Menu Cards */}
        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
          {menuItems.map((item, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    cursor: 'pointer',
                    height: '100%',
                    bgcolor: darkMode ? '#1a1a1a' : 'background.paper',
                    color: darkMode ? 'white' : 'text.primary',
                    boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      transition: 'transform 0.3s ease-in-out',
                      bgcolor: darkMode ? '#252525' : 'grey.100',
                    },
                  }}
                >
                  <CardContent>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: 1,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: darkMode ? 'primary.dark' : 'primary.light',
                          color: darkMode ? 'white' : 'primary.main',
                          width: { xs: 40, sm: 50 },
                          height: { xs: 40, sm: 50 },
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      <Typography 
                        variant="h6"
                        sx={{
                          fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' },
                          fontWeight: 500,
                        }}
                      >
                        {item.text}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default CustomerDashboard;