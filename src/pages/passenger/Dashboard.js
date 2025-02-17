import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  Chip,
  Divider,
} from '@mui/material';
import {
  DirectionsBus,
  AccessTime,
  Receipt,
  Star,
} from '@mui/icons-material';
import { format } from 'date-fns';
import DashboardLayout from '../../layouts/DashboardLayout';
import BookingHistory from '../../components/BookingHistory';
import UpcomingTrips from '../../components/UpcomingTrips';
import TripReviews from '../../components/TripReviews';

const PassengerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    upcomingTrips: [],
    recentBookings: [],
    stats: {
      totalTrips: 0,
      totalSpent: 0,
      averageRating: 0,
      rewardPoints: 0
    },
    favoriteRoutes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPassengerDashboard();
  }, []);

  const fetchPassengerDashboard = async () => {
    try {
      const response = await fetch('/api/passenger/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Trips"
              value={dashboardData.stats.totalTrips}
              icon={<DirectionsBus />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Spent"
              value={`${dashboardData.stats.totalSpent.toLocaleString()} RWF`}
              icon={<Receipt />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Average Rating"
              value={`${dashboardData.stats.averageRating.toFixed(1)} ⭐`}
              icon={<Star />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Reward Points"
              value={dashboardData.stats.rewardPoints}
              icon={<AccessTime />}
              color="info"
            />
          </Grid>

          {/* Upcoming Trips */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming Trips
                </Typography>
                <UpcomingTrips trips={dashboardData.upcomingTrips} />
              </CardContent>
            </Card>
          </Grid>

          {/* Favorite Routes */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Favorite Routes
                </Typography>
                <List>
                  {dashboardData.favoriteRoutes.map((route, index) => (
                    <React.Fragment key={route._id}>
                      <ListItem>
                        <ListItemText
                          primary={`${route.from} → ${route.to}`}
                          secondary={`${route.tripCount} trips`}
                        />
                        <Chip
                          size="small"
                          label={`${route.usagePercentage}%`}
                          color="primary"
                        />
                      </ListItem>
                      {index < dashboardData.favoriteRoutes.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Booking History */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Bookings
                </Typography>
                <BookingHistory bookings={dashboardData.recentBookings} />
              </CardContent>
            </Card>
          </Grid>

          {/* Trip Reviews */}
          <Grid item xs={12}>
            <TripReviews />
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h5" component="div">
            {value}
          </Typography>
        </Box>
        <Box sx={{ color: `${color}.main` }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default PassengerDashboard; 