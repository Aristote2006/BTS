import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  LinearProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  TrendingDown,
  TrendingUp,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';
import { format } from 'date-fns';
import api from '../services/api';

const RealTimeOptimizer = () => {
  const [metrics, setMetrics] = useState({
    efficiency: 0,
    utilization: 0,
    conflicts: 0,
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    fetchCurrentMetrics();
    socket.on('optimization-update', handleOptimizationUpdate);

    return () => {
      socket.off('optimization-update', handleOptimizationUpdate);
    };
  }, []);

  const fetchCurrentMetrics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/optimization/metrics');
      setMetrics(response.data);
      setRecommendations(response.data.recommendations || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch optimization metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizationUpdate = (data) => {
    setMetrics(prev => ({
      ...prev,
      ...data.metrics
    }));
    if (data.recommendations) {
      setRecommendations(data.recommendations);
    }
  };

  const applyRecommendation = async (recommendation) => {
    try {
      await api.post('/optimization/apply', { recommendation });
      // Refresh metrics after applying recommendation
      fetchCurrentMetrics();
    } catch (error) {
      console.error('Failed to apply recommendation:', error);
      setError('Failed to apply recommendation');
    }
  };

  const MetricCard = ({ title, value, icon, unit = '%', target, trend }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          {icon}
        </Box>
        <Typography variant="h4" component="div" gutterBottom>
          {value.toFixed(1)}{unit}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          {trend === 'up' ? (
            <TrendingUp color="success" />
          ) : (
            <TrendingDown color="error" />
          )}
          <Typography variant="body2" sx={{ ml: 1 }}>
            Target: {target}{unit}
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={(value / target) * 100} 
          sx={{ mt: 2 }}
        />
      </CardContent>
    </Card>
  );

  const RecommendationCard = ({ recommendation }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" color="primary">
            {recommendation.title}
          </Typography>
          <Chip 
            label={recommendation.impact} 
            color={recommendation.impact === 'High' ? 'error' : 'warning'} 
            size="small" 
          />
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
          {recommendation.description}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            onClick={() => applyRecommendation(recommendation)}
          >
            Apply
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="System Efficiency"
            value={metrics.efficiency}
            icon={<CheckCircle color="success" />}
            target={95}
            trend="up"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Resource Utilization"
            value={metrics.utilization}
            icon={<TrendingUp color="primary" />}
            target={85}
            trend="up"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Conflict Rate"
            value={metrics.conflicts}
            icon={<Warning color="error" />}
            target={5}
            trend="down"
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Optimization Recommendations
      </Typography>

      {recommendations.length === 0 ? (
        <Alert severity="info">
          No optimization recommendations at this time.
        </Alert>
      ) : (
        recommendations.map((recommendation, index) => (
          <RecommendationCard 
            key={index}
            recommendation={recommendation}
          />
        ))
      )}
    </Box>
  );
};

export default RealTimeOptimizer; 