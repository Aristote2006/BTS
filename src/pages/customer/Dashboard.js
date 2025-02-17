import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Button,
  Paper,
  Divider,
  CircularProgress,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  DirectionsBus,
  Receipt,
  Schedule,
  LocationOn,
  ArrowForward,
  TrendingUp,
  Person,
  History,
  Notifications,
  Settings,
  ExitToApp,
  AccountCircle,
  Help,
  LocalOffer,
  DateRange,
  DarkMode,
  LightMode,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from '../../components/Sidebar';
import './Dashboard.css';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const { darkMode, toggleDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DirectionsBus />, path: '/dashboard' },
    { text: 'My Bookings', icon: <Receipt />, path: '/bookings' },
    { text: 'Schedule', icon: <Schedule />, path: '/schedule' },
    { text: 'Saved Locations', icon: <LocationOn />, path: '/locations' },
    { text: 'History', icon: <History />, path: '/history' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  const [stats, setStats] = useState({
    totalBookings: 15,
    upcomingTrips: 2,
    completedTrips: 13,
    savedLocations: 5,
  });

  const [recentBookings] = useState([
    {
      id: 1,
      from: "Nairobi",
      to: "Mombasa",
      date: "2024-01-15",
      status: "Upcoming",
      price: "KES 1,200"
    },
    {
      id: 2,
      from: "Mombasa",
      to: "Nairobi",
      date: "2024-01-10",
      status: "Completed",
      price: "KES 1,200"
    },
  ]);

  const [specialOffers] = useState([
    {
      title: "Early Bird Discount",
      description: "20% off on morning buses",
      code: "EARLY20"
    },
    {
      title: "Weekend Special",
      description: "15% off on weekend trips",
      code: "WEEKEND15"
    }
  ]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card 
        className="stat-card" 
        onClick={onClick}
        sx={{ 
          cursor: onClick ? 'pointer' : 'default',
          background: `linear-gradient(135deg, ${color}15, ${color}05)`,
          borderLeft: `4px solid ${color}`,
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography color="textSecondary" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h4" component="div" sx={{ color: color }}>
                {value}
              </Typography>
            </Box>
            <Box sx={{ color: color }}>
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const QuickAction = ({ title, icon, color, onClick }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="contained"
        startIcon={icon}
        onClick={onClick}
        sx={{
          backgroundColor: color,
          '&:hover': {
            backgroundColor: color + 'dd',
          },
          width: '100%',
          py: 2,
          color: 'white',
        }}
      >
        {title}
      </Button>
    </motion.div>
  );

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className={darkMode ? 'dark-mode' : ''}>
      <Container className="dashboard-container">
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleSidebarToggle}
          className="menu-button"
        >
          <MenuIcon />
        </IconButton>

        <Sidebar
          open={sidebarOpen}
          onClose={handleSidebarClose}
          onToggle={handleSidebarToggle}
          onLogout={handleLogout}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <Box className="welcome-section">
            <Typography variant="h4" className="welcome-text">
              Welcome back, {user?.name}! 👋
            </Typography>
            <Typography variant="subtitle1">
              Manage your bookings and track your journeys with ease
            </Typography>
          </Box>

          {/* Dashboard Cards */}
          <Grid container spacing={3}>
            {/* Book a Trip Card */}
            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}>
                <Card className="dashboard-card" onClick={() => navigate('/customer/booking')}>
                  <CardContent>
                    <Box className="card-icon book-icon">
                      <DirectionsBus fontSize="inherit" />
                    </Box>
                    <Typography variant="h6" className="card-title">
                      Book a Trip
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Find and book your next journey
                    </Typography>
                    <Typography className="stats-number">
                      24/7
                    </Typography>
                    <Button 
                      variant="contained" 
                      className="action-button"
                      color="primary"
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Active Bookings Card */}
            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}>
                <Card className="dashboard-card">
                  <CardContent>
                    <Box className="card-icon active-icon">
                      <LocationOn fontSize="inherit" />
                    </Box>
                    <Typography variant="h6" className="card-title">
                      Active Bookings
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Track your current bookings
                    </Typography>
                    <Typography className="stats-number">
                      2
                    </Typography>
                    <Button 
                      variant="contained" 
                      className="action-button active-button"
                    >
                      View Active
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Booking History Card */}
            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}>
                <Card className="dashboard-card">
                  <CardContent>
                    <Box className="card-icon history-icon">
                      <History fontSize="inherit" />
                    </Box>
                    <Typography variant="h6" className="card-title">
                      Booking History
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      View your past journeys
                    </Typography>
                    <Typography className="stats-number">
                      12
                    </Typography>
                    <Button 
                      variant="contained" 
                      className="action-button history-button"
                    >
                      View History
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Profile Card */}
            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}>
                <Card className="dashboard-card">
                  <CardContent>
                    <Box className="card-icon profile-icon">
                      <Person fontSize="inherit" />
                    </Box>
                    <Typography variant="h6" className="card-title">
                      My Profile
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Manage your account
                    </Typography>
                    <Typography className="stats-number">
                      Pro
                    </Typography>
                    <Button 
                      variant="contained" 
                      className="action-button profile-button"
                      component={Link}
                      to="/customer/profile"
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          {/* Recent Bookings Section */}
          <Paper className="section-paper recent-bookings">
            <Box className="section-header">
              <Typography variant="h6">Recent Bookings</Typography>
              <Button 
                endIcon={<ArrowForward />}
                onClick={() => navigate('/customer/bookings')}
              >
                View All
              </Button>
            </Box>
            <Divider />
            <Box className="bookings-list">
              {recentBookings.map((booking) => (
                <Card key={booking.id} className="booking-item">
                  <CardContent>
                    <Grid container alignItems="center" justifyContent="space-between">
                      <Grid item xs={12} sm={3}>
                        <Typography variant="subtitle2" color="textSecondary">
                          From - To
                        </Typography>
                        <Typography variant="body1">
                          {booking.from} - {booking.to}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Date
                        </Typography>
                        <Typography variant="body1">
                          {booking.date}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Price
                        </Typography>
                        <Typography variant="body1">
                          {booking.price}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Button 
                          variant="contained" 
                          color={booking.status === 'Upcoming' ? 'primary' : 'secondary'}
                        >
                          {booking.status}
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>

          {/* Special Offers Section */}
          <Paper className="section-paper special-offers">
            <Box className="section-header">
              <Typography variant="h6">Special Offers</Typography>
              <LocalOffer className="section-icon" />
            </Box>
            <Divider />
            <Grid container spacing={2} className="offers-grid">
              {specialOffers.map((offer, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card className="offer-card">
                    <CardContent>
                      <Typography variant="h6" className="offer-title">
                        {offer.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {offer.description}
                      </Typography>
                      <Box className="offer-code">
                        <Typography variant="h5">{offer.code}</Typography>
                        <Button variant="outlined" size="small">
                          Copy Code
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Quick Links Section */}
          <Paper className="section-paper quick-links">
            <Typography variant="h6" className="section-title">
              Quick Links
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<DateRange />}
                  className="quick-link-button"
                  onClick={() => navigate('/customer/schedule')}
                >
                  Bus Schedule
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<Receipt />}
                  className="quick-link-button"
                  onClick={() => navigate('/customer/tickets')}
                >
                  My Tickets
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<Help />}
                  className="quick-link-button"
                  onClick={() => navigate('/customer/support')}
                >
                  Support
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<Settings />}
                  className="quick-link-button"
                  onClick={() => navigate('/customer/settings')}
                >
                  Settings
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default CustomerDashboard; 