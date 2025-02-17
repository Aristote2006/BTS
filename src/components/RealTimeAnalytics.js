import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useSocket } from '../contexts/SocketContext';

const RealTimeAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    bookings: [],
    revenue: [],
    routePerformance: [],
    currentStats: {
      activeBookings: 0,
      todayRevenue: 0,
      occupancyRate: 0,
      onTimeRate: 0,
    },
  });

  const socket = useSocket();

  useEffect(() => {
    // Initial data fetch
    fetchAnalytics();

    // Set up real-time listeners
    socket.onBookingAnalytics((data) => {
      setAnalytics(prev => ({
        ...prev,
        bookings: [...prev.bookings, data].slice(-20), // Keep last 20 data points
        currentStats: {
          ...prev.currentStats,
          activeBookings: data.activeBookings,
          todayRevenue: data.todayRevenue,
        },
      }));
    });

    socket.onRoutePerformance((data) => {
      setAnalytics(prev => ({
        ...prev,
        routePerformance: data,
        currentStats: {
          ...prev.currentStats,
          occupancyRate: data.occupancyRate,
          onTimeRate: data.onTimeRate,
        },
      }));
    });

    return () => {
      // Clean up listeners if needed
    };
  }, [socket]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/realtime');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const LiveBookingChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Live Bookings
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.bookings}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#8884d8"
              name="Bookings"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const RoutePerformanceChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Route Performance (Live)
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.routePerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="route" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="bookings" fill="#8884d8" name="Bookings" />
            <Bar dataKey="occupancy" fill="#82ca9d" name="Occupancy %" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const StatCard = ({ title, value, unit = '', icon }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">
              {value}
              {unit}
            </Typography>
          </Box>
          {icon}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Active Bookings"
            value={analytics.currentStats.activeBookings}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Today's Revenue"
            value={analytics.currentStats.todayRevenue.toLocaleString()}
            unit=" RWF"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Occupancy Rate"
            value={analytics.currentStats.occupancyRate}
            unit="%"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="On-Time Rate"
            value={analytics.currentStats.onTimeRate}
            unit="%"
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <LiveBookingChart />
        </Grid>
        <Grid item xs={12} md={4}>
          <RoutePerformanceChart />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RealTimeAnalytics; 