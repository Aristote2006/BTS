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
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  DirectionsBus,
  People,
  AttachMoney,
  TrendingUp,
} from '@mui/icons-material';
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
import DashboardLayout from '../../layouts/DashboardLayout';
import { useSocket } from '../../contexts/SocketContext';
import RealTimeAnalytics from '../../components/RealTimeAnalytics';
import DriverPerformance from '../../components/DriverPerformance';
import RouteScheduling from '../../components/RouteScheduling';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardData, setDashboardData] = useState({
    todayStats: {
      totalBookings: 0,
      totalRevenue: 0,
      activeRoutes: 0,
      onTimeRate: 0,
    },
    recentBookings: [],
    routePerformance: [],
    driverStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time listeners
    socket.on('bookingUpdate', handleBookingUpdate);
    socket.on('routeUpdate', handleRouteUpdate);
    socket.on('driverUpdate', handleDriverUpdate);

    // Refresh data periodically
    const interval = setInterval(fetchDashboardData, 60000);

    return () => {
      socket.off('bookingUpdate');
      socket.off('routeUpdate');
      socket.off('driverUpdate');
      clearInterval(interval);
    };
  }, [socket]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
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

  const handleBookingUpdate = (data) => {
    setDashboardData(prev => ({
      ...prev,
      todayStats: {
        ...prev.todayStats,
        totalBookings: prev.todayStats.totalBookings + 1,
        totalRevenue: prev.todayStats.totalRevenue + data.amount
      },
      recentBookings: [data, ...prev.recentBookings.slice(0, 9)]
    }));
  };

  const handleRouteUpdate = (data) => {
    setDashboardData(prev => ({
      ...prev,
      routePerformance: prev.routePerformance.map(route =>
        route._id === data.routeId ? { ...route, ...data } : route
      )
    }));
  };

  const handleDriverUpdate = (data) => {
    setDashboardData(prev => ({
      ...prev,
      driverStats: prev.driverStats.map(driver =>
        driver._id === data.driverId ? { ...driver, ...data } : driver
      )
    }));
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
          {/* Summary Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Today's Bookings"
              value={dashboardData.todayStats.totalBookings}
              icon={<DirectionsBus />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Today's Revenue"
              value={`${dashboardData.todayStats.totalRevenue.toLocaleString()} RWF`}
              icon={<AttachMoney />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Routes"
              value={dashboardData.todayStats.activeRoutes}
              icon={<TrendingUp />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="On-Time Rate"
              value={`${dashboardData.todayStats.onTimeRate}%`}
              icon={<People />}
              color="warning"
            />
          </Grid>

          {/* Tabs Section */}
          <Grid item xs={12}>
            <Paper sx={{ mt: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                centered
              >
                <Tab label="Overview" />
                <Tab label="Real-Time Analytics" />
                <Tab label="Driver Performance" />
                <Tab label="Route Scheduling" />
              </Tabs>

              <Box sx={{ p: 3 }}>
                {activeTab === 0 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <BookingTrends data={dashboardData.recentBookings} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <RoutePerformance data={dashboardData.routePerformance} />
                    </Grid>
                  </Grid>
                )}
                {activeTab === 1 && <RealTimeAnalytics />}
                {activeTab === 2 && <DriverPerformance />}
                {activeTab === 3 && <RouteScheduling />}
              </Box>
            </Paper>
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

const BookingTrends = ({ data }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Booking Trends
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="bookings" stroke="#8884d8" name="Bookings" />
          <Line type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue" />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const RoutePerformance = ({ data }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Route Performance
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="route" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="occupancy" fill="#8884d8" name="Occupancy Rate" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default AdminDashboard; 