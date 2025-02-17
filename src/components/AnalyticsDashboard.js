import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
  });
  const [agencyId, setAgencyId] = useState('all');
  const [analyticsData, setAnalyticsData] = useState({
    bookingStats: [],
    revenueStats: [],
    routePerformance: [],
    paymentMethods: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, agencyId]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `/api/analytics/dashboard?startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}&agencyId=${agencyId}`
      );
      const data = await response.json();
      setAnalyticsData(data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const BookingTrendsChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Booking Trends
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analyticsData.bookingStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="bookings" stroke="#8884d8" name="Bookings" />
            <Line type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue (RWF)" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const RoutePerformanceChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Route Performance
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.routePerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="route" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="bookings" fill="#8884d8" name="Total Bookings" />
            <Bar dataKey="revenue" fill="#82ca9d" name="Revenue (RWF)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const PaymentMethodsChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Payment Methods Distribution
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={analyticsData.paymentMethods}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {analyticsData.paymentMethods.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const StatCards = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Bookings
            </Typography>
            <Typography variant="h4">
              {analyticsData.totalBookings}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Revenue
            </Typography>
            <Typography variant="h4">
              {analyticsData.totalRevenue?.toLocaleString()} RWF
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Average Booking Value
            </Typography>
            <Typography variant="h4">
              {analyticsData.averageBookingValue?.toLocaleString()} RWF
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Booking Success Rate
            </Typography>
            <Typography variant="h4">
              {analyticsData.bookingSuccessRate}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <DatePicker
              label="Start Date"
              value={dateRange.startDate}
              onChange={(newDate) => setDateRange({ ...dateRange, startDate: newDate })}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DatePicker
              label="End Date"
              value={dateRange.endDate}
              onChange={(newDate) => setDateRange({ ...dateRange, endDate: newDate })}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Agency</InputLabel>
              <Select
                value={agencyId}
                label="Agency"
                onChange={(e) => setAgencyId(e.target.value)}
              >
                <MenuItem value="all">All Agencies</MenuItem>
                {/* Add agency options here */}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <StatCards />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <BookingTrendsChart />
        </Grid>
        <Grid item xs={12} md={8}>
          <RoutePerformanceChart />
        </Grid>
        <Grid item xs={12} md={4}>
          <PaymentMethodsChart />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard; 