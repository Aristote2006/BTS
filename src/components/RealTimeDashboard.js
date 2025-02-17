import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
} from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RealTimeDashboard = () => {
  const [realtimeStats, setRealtimeStats] = useState({
    activeBookings: 0,
    todayRevenue: 0,
    availableSeats: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [bookingTrend, setBookingTrend] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    // Listen for booking updates
    socket.onBookingUpdate((data) => {
      if (data.type === 'new') {
        setRealtimeStats(prev => ({
          ...prev,
          activeBookings: prev.activeBookings + 1,
          todayRevenue: prev.todayRevenue + data.booking.totalAmount
        }));
        setRecentBookings(prev => [data.booking, ...prev].slice(0, 5));
        updateBookingTrend(data.booking);
      }
    });

    // Listen for seat updates
    socket.onSeatUpdate((data) => {
      setRealtimeStats(prev => ({
        ...prev,
        availableSeats: data.availableSeats
      }));
    });

    // Initial data fetch
    fetchInitialData();
  }, [socket]);

  const fetchInitialData = async () => {
    try {
      const response = await fetch('/api/dashboard/realtime');
      const data = await response.json();
      setRealtimeStats(data.stats);
      setRecentBookings(data.recentBookings);
      setBookingTrend(data.bookingTrend);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const updateBookingTrend = (newBooking) => {
    const hour = new Date(newBooking.createdAt).getHours();
    setBookingTrend(prev => {
      const updated = [...prev];
      const hourIndex = updated.findIndex(item => item.hour === hour);
      if (hourIndex !== -1) {
        updated[hourIndex].bookings += 1;
      }
      return updated;
    });
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Bookings
              </Typography>
              <Typography variant="h4">
                {realtimeStats.activeBookings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Today's Revenue
              </Typography>
              <Typography variant="h4">
                {realtimeStats.todayRevenue.toLocaleString()} RWF
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Available Seats
              </Typography>
              <Typography variant="h4">
                {realtimeStats.availableSeats}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Booking Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Booking Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bookingTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="bookings" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Bookings */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Bookings
              </Typography>
              <List>
                {recentBookings.map((booking) => (
                  <ListItem key={booking._id}>
                    <ListItemText
                      primary={`${booking.user.name}`}
                      secondary={`${booking.route.from} → ${booking.route.to}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                      {booking.status === 'confirmed' ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Cancel color="error" />
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RealTimeDashboard; 