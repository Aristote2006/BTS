import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import {
  Warning,
  TrendingUp,
  ErrorOutline,
  CheckCircle,
  Timeline,
  Schedule,
} from '@mui/icons-material';
import { format } from 'date-fns';

const ConflictPrevention = () => {
  const [riskAnalysis, setRiskAnalysis] = useState({
    highRisk: [],
    mediumRisk: [],
    patterns: [],
    metrics: {}
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRiskAnalysis();
  }, []);

  const fetchRiskAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/schedules/risk-analysis');
      const data = await response.json();
      setRiskAnalysis(data.data);
    } catch (error) {
      console.error('Error fetching risk analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const RiskMetricsCard = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Conflict Risk Metrics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h4" color="error">
                {riskAnalysis.metrics.highRiskCount || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                High Risk Schedules
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h4" color="warning.main">
                {riskAnalysis.metrics.mediumRiskCount || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Medium Risk Schedules
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main">
                {riskAnalysis.metrics.preventionRate || 0}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Prevention Rate
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const RiskPatternCard = ({ pattern }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" color="warning.main">
            {pattern.type}
          </Typography>
          <Chip
            label={`Impact: ${pattern.impact}`}
            color={pattern.impact === 'High' ? 'error' : 'warning'}
          />
        </Box>
        <Typography variant="body1" gutterBottom>
          {pattern.description}
        </Typography>
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Affected Schedules:
          </Typography>
          <List dense>
            {pattern.affectedSchedules.map((schedule, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${schedule.route} - ${format(new Date(schedule.date), 'MMM dd, yyyy')}`}
                  secondary={`${format(new Date(schedule.departureTime), 'HH:mm')} - ${format(new Date(schedule.arrivalTime), 'HH:mm')}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handlePreventiveAction(pattern)}
          >
            Take Preventive Action
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const handlePreventiveAction = async (pattern) => {
    try {
      const response = await fetch('/api/schedules/prevent-conflict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pattern }),
      });
      
      if (response.ok) {
        fetchRiskAnalysis();
      }
    } catch (error) {
      console.error('Error applying preventive action:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Conflict Prevention System
      </Typography>
      
      {loading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <RiskMetricsCard />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              High Risk Patterns
            </Typography>
            {riskAnalysis.patterns.map((pattern, index) => (
              <RiskPatternCard key={index} pattern={pattern} />
            ))}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Prevention Recommendations
                </Typography>
                <List>
                  {riskAnalysis.recommendations?.map((recommendation, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={recommendation.title}
                        secondary={
                          <>
                            <Typography variant="body2" color="textSecondary">
                              {recommendation.description}
                            </Typography>
                            <Chip
                              size="small"
                              label={`Priority: ${recommendation.priority}`}
                              color={
                                recommendation.priority === 'High' ? 'error' :
                                recommendation.priority === 'Medium' ? 'warning' : 'success'
                              }
                              sx={{ mt: 1 }}
                            />
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ConflictPrevention; 