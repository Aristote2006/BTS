import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  ButtonGroup,
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
  Area,
  AreaChart,
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, subDays, subMonths } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdvancedAnalytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [reportType, setReportType] = useState('revenue');
  const [analyticsData, setAnalyticsData] = useState({
    revenue: [],
    occupancy: [],
    routes: [],
    performance: {}
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, reportType]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(
        `/api/analytics/advanced?timeRange=${timeRange}&type=${reportType}`
      );
      const data = await response.json();
      setAnalyticsData(data.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  const RevenueChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Revenue Analysis
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analyticsData.revenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(new Date(date), 'MMM dd')}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => `$${value}`}
              labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              fill="#8884d8"
              name="Revenue"
            />
            <Area
              type="monotone"
              dataKey="projectedRevenue"
              stroke="#82ca9d"
              fill="#82ca9d"
              name="Projected"
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const RoutePerformance = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Route Performance
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.routes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="route" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="bookings"
              fill="#8884d8"
              name="Bookings"
            />
            <Bar
              yAxisId="right"
              dataKey="occupancyRate"
              fill="#82ca9d"
              name="Occupancy Rate (%)"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const OccupancyTrends = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Occupancy Trends
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analyticsData.occupancy}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="hour" 
              tickFormatter={(hour) => `${hour}:00`}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="weekday"
              stroke="#8884d8"
              name="Weekday"
            />
            <Line
              type="monotone"
              dataKey="weekend"
              stroke="#82ca9d"
              name="Weekend"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const PerformanceMetrics = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Booking Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData.performance.bookingDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {analyticsData.performance.bookingDistribution?.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Peak Hours Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData.performance.peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Advanced Analytics</Typography>
        <Box display="flex" gap={2}>
          <ButtonGroup>
            <Button
              variant={timeRange === 'week' ? 'contained' : 'outlined'}
              onClick={() => setTimeRange('week')}
            >
              Week
            </Button>
            <Button
              variant={timeRange === 'month' ? 'contained' : 'outlined'}
              onClick={() => setTimeRange('month')}
            >
              Month
            </Button>
            <Button
              variant={timeRange === 'quarter' ? 'contained' : 'outlined'}
              onClick={() => setTimeRange('quarter')}
            >
              Quarter
            </Button>
          </ButtonGroup>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              label="Report Type"
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="revenue">Revenue Analysis</MenuItem>
              <MenuItem value="routes">Route Performance</MenuItem>
              <MenuItem value="occupancy">Occupancy Trends</MenuItem>
              <MenuItem value="performance">Performance Metrics</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {reportType === 'revenue' && (
          <Grid item xs={12}>
            <RevenueChart />
          </Grid>
        )}
        {reportType === 'routes' && (
          <Grid item xs={12}>
            <RoutePerformance />
          </Grid>
        )}
        {reportType === 'occupancy' && (
          <Grid item xs={12}>
            <OccupancyTrends />
          </Grid>
        )}
        {reportType === 'performance' && (
          <Grid item xs={12}>
            <PerformanceMetrics />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AdvancedAnalytics; 