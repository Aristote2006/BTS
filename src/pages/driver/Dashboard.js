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
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  DirectionsBus,
  Star,
  Speed,
  Timeline,
  CheckCircle,
  Warning,
  NavigateNext,
  EmojiEvents,
} from '@mui/icons-material';
import { format } from 'date-fns';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useSocket } from '../../contexts/SocketContext';

const DriverDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    currentSchedule: null,
    upcomingSchedules: [],
    performance: {
      rating: 0,
      completionRate: 0,
      onTimeRate: 0,
      totalTrips: 0,
    },
    rewards: {
      points: 0,
      level: 'Bronze',
      nextLevelProgress: 0,
      achievements: []
    },
    recentReviews: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    fetchDriverDashboard();
    
    socket.on('scheduleUpdate', handleScheduleUpdate);
    socket.on('reviewUpdate', handleReviewUpdate);
    socket.on('rewardUpdate', handleRewardUpdate);

    const interval = setInterval(fetchDriverDashboard, 300000); // 5 minutes

    return () => {
      socket.off('scheduleUpdate');
      socket.off('reviewUpdate');
      socket.off('rewardUpdate');
      clearInterval(interval);
    };
  }, [socket]);

  const fetchDriverDashboard = async () => {
    try {
      const response = await fetch('/api/driver/dashboard');
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

  const handleScheduleUpdate = (data) => {
    setDashboardData(prev => ({
      ...prev,
      currentSchedule: data.currentSchedule || prev.currentSchedule,
      upcomingSchedules: data.upcomingSchedules || prev.upcomingSchedules
    }));
  };

  const handleReviewUpdate = (review) => {
    setDashboardData(prev => ({
      ...prev,
      recentReviews: [review, ...prev.recentReviews.slice(0, -1)],
      performance: {
        ...prev.performance,
        rating: (prev.performance.rating * prev.recentReviews.length + review.rating) / 
                (prev.recentReviews.length + 1)
      }
    }));
  };

  const handleRewardUpdate = (rewards) => {
    setDashboardData(prev => ({
      ...prev,
      rewards
    }));
  };

  const handleStartTrip = async () => {
    try {
      const response = await fetch('/api/driver/trips/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scheduleId: dashboardData.currentSchedule._id
        })
      });
      
      if (response.ok) {
        fetchDriverDashboard();
      }
    } catch (error) {
      console.error('Error starting trip:', error);
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

        {/* Current Schedule Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Current Schedule
            </Typography>
            {dashboardData.currentSchedule ? (
              <Box>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <Typography variant="h5">
                      {dashboardData.currentSchedule.route.from} → {dashboardData.currentSchedule.route.to}
                    </Typography>
                    <Typography color="textSecondary">
                      Departure: {format(new Date(dashboardData.currentSchedule.departureTime), 'HH:mm')}
                    </Typography>
                    <Typography color="textSecondary">
                      Bus Number: {dashboardData.currentSchedule.busNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} textAlign="right">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleStartTrip}
                      disabled={dashboardData.currentSchedule.status !== 'scheduled'}
                    >
                      {dashboardData.currentSchedule.status === 'inProgress' ? 'In Progress' : 'Start Trip'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Typography color="textSecondary">No current schedule</Typography>
            )}
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Performance Stats */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Rating"
              value={`${dashboardData.performance.rating.toFixed(1)} ⭐`}
              icon={<Star />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completion Rate"
              value={`${dashboardData.performance.completionRate}%`}
              icon={<CheckCircle />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="On-Time Rate"
              value={`${dashboardData.performance.onTimeRate}%`}
              icon={<Speed />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Trips"
              value={dashboardData.performance.totalTrips}
              icon={<DirectionsBus />}
              color="info"
            />
          </Grid>

          {/* Rewards Section */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Driver Rewards
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">
                    Level: {dashboardData.rewards.level}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Points: {dashboardData.rewards.points}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={dashboardData.rewards.nextLevelProgress}
                    sx={{ mt: 1 }}
                  />
                </Box>
                <List>
                  {dashboardData.rewards.achievements.map((achievement) => (
                    <ListItem key={achievement._id}>
                      <ListItemText
                        primary={achievement.title}
                        secondary={achievement.description}
                      />
                      <EmojiEvents color="primary" />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Schedules */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming Schedules
                </Typography>
                <List>
                  {dashboardData.upcomingSchedules.map((schedule) => (
                    <ListItem
                      key={schedule._id}
                      secondaryAction={
                        <IconButton edge="end">
                          <NavigateNext />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={`${schedule.route.from} → ${schedule.route.to}`}
                        secondary={
                          <>
                            <Typography component="span" variant="body2">
                              {format(new Date(schedule.departureTime), 'MMM dd, HH:mm')}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2">
                              Bus: {schedule.busNumber}
                            </Typography>
                          </>
                        }
                      />
                      <Chip
                        size="small"
                        label={schedule.status}
                        color={schedule.status === 'scheduled' ? 'primary' : 'default'}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Reviews */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Reviews
                </Typography>
                <List>
                  {dashboardData.recentReviews.map((review) => (
                    <ListItem key={review._id}>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            <Typography variant="body1" sx={{ mr: 1 }}>
                              {review.rating} ⭐
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                            </Typography>
                          </Box>
                        }
                        secondary={review.comment}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
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

export default DriverDashboard; 