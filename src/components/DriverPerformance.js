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
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Timeline,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { format } from 'date-fns';

const DriverPerformance = () => {
  const [selectedDriver, setSelectedDriver] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [performanceData, setPerformanceData] = useState({
    trips: [],
    ratings: [],
    metrics: {},
    timeline: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (selectedDriver) {
      fetchPerformanceData();
    }
  }, [selectedDriver]);

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers');
      const data = await response.json();
      setDrivers(data.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/drivers/${selectedDriver}/performance`);
      const data = await response.json();
      setPerformanceData(data.data);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const PerformanceMetric = ({ title, value, target, unit = '%' }) => (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography variant="body2" color="textSecondary">
          {title}
        </Typography>
        <Typography variant="body2">
          {value}{unit} / {target}{unit}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={(value / target) * 100}
        color={value >= target ? 'success' : value >= target * 0.8 ? 'warning' : 'error'}
      />
    </Box>
  );

  const PerformanceRadar = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Performance Overview
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={[performanceData.metrics]}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name="Performance"
              dataKey="value"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const TripHistory = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Trip History
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData.trips}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM dd')} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completedTrips" name="Completed" fill="#4caf50" />
            <Bar dataKey="cancelledTrips" name="Cancelled" fill="#f44336" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const RatingTrend = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Rating Trend
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData.ratings}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM dd')} />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="rating"
              stroke="#8884d8"
              name="Rating"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box mb={3}>
        <FormControl fullWidth>
          <InputLabel>Select Driver</InputLabel>
          <Select
            value={selectedDriver}
            label="Select Driver"
            onChange={(e) => setSelectedDriver(e.target.value)}
          >
            {drivers.map((driver) => (
              <MenuItem key={driver._id} value={driver._id}>
                {driver.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : selectedDriver && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Key Metrics
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <PerformanceMetric
                    title="On-Time Rate"
                    value={performanceData.metrics.onTimeRate}
                    target={95}
                  />
                  <PerformanceMetric
                    title="Customer Rating"
                    value={performanceData.metrics.averageRating}
                    target={4.5}
                    unit=""
                  />
                  <PerformanceMetric
                    title="Trip Completion Rate"
                    value={performanceData.metrics.completionRate}
                    target={98}
                  />
                  <PerformanceMetric
                    title="Schedule Adherence"
                    value={performanceData.metrics.scheduleAdherence}
                    target={90}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <PerformanceRadar />
          </Grid>
          <Grid item xs={12} md={6}>
            <TripHistory />
          </Grid>
          <Grid item xs={12} md={6}>
            <RatingTrend />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default DriverPerformance; 