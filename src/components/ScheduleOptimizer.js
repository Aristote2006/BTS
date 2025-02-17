import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Timeline,
  TrendingUp,
  Speed,
  DirectionsBus,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const ScheduleOptimizer = () => {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  });
  const [optimizationResults, setOptimizationResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await fetch('/api/routes');
      const data = await response.json();
      setRoutes(data.data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const optimizeSchedule = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/schedules/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routeId: selectedRoute,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }),
      });
      const data = await response.json();
      setOptimizationResults(data.data);
    } catch (error) {
      console.error('Error optimizing schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const OptimizationCard = ({ title, value, icon, description }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography variant="h6" ml={1}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" gutterBottom>
          {value}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Schedule Optimizer
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Route</InputLabel>
                <Select
                  value={selectedRoute}
                  label="Route"
                  onChange={(e) => setSelectedRoute(e.target.value)}
                >
                  {routes.map((route) => (
                    <MenuItem key={route._id} value={route._id}>
                      {route.from} → {route.to}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
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
          </Grid>
          <Button
            variant="contained"
            onClick={optimizeSchedule}
            disabled={loading || !selectedRoute}
            sx={{ mt: 2 }}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Optimize Schedule'}
          </Button>
        </CardContent>
      </Card>

      {optimizationResults && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <OptimizationCard
              title="Recommended Departure Times"
              icon={<Timeline color="primary" />}
              value={optimizationResults.recommendedTimes.length}
              description="Optimal departure times based on historical demand"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <OptimizationCard
              title="Expected Occupancy Rate"
              icon={<TrendingUp color="success" />}
              value={`${optimizationResults.expectedOccupancy}%`}
              description="Projected occupancy with optimized schedule"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <OptimizationCard
              title="Recommended Fleet Size"
              icon={<DirectionsBus color="secondary" />}
              value={optimizationResults.recommendedFleetSize}
              description="Optimal number of buses for this route"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <OptimizationCard
              title="Efficiency Score"
              icon={<Speed color="warning" />}
              value={optimizationResults.efficiencyScore}
              description="Overall optimization efficiency score"
            />
          </Grid>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mt: 2 }}>
              These recommendations are based on historical booking data, peak hours analysis, and seasonal trends.
            </Alert>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ScheduleOptimizer; 