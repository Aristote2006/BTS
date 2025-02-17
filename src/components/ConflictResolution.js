import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Warning,
  CheckCircle,
  Schedule,
  SwapHoriz,
  DirectionsBus,
  Person,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useSocket } from '../contexts/SocketContext';

const ConflictResolution = () => {
  const [conflicts, setConflicts] = useState([]);
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [resolutionOptions, setResolutionOptions] = useState([]);
  const [resolving, setResolving] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    fetchActiveConflicts();
    
    socket.on('scheduleConflict', (conflict) => {
      setConflicts(prev => [conflict, ...prev]);
    });

    return () => {
      socket.off('scheduleConflict');
    };
  }, [socket]);

  const fetchActiveConflicts = async () => {
    try {
      const response = await fetch('/api/schedules/conflicts/active');
      const data = await response.json();
      setConflicts(data.data);
    } catch (error) {
      console.error('Error fetching conflicts:', error);
    }
  };

  const handleSelectConflict = async (conflict) => {
    setSelectedConflict(conflict);
    try {
      const response = await fetch(`/api/schedules/conflicts/${conflict._id}/options`);
      const data = await response.json();
      setResolutionOptions(data.data);
    } catch (error) {
      console.error('Error fetching resolution options:', error);
    }
  };

  const resolveConflict = async (resolution) => {
    setResolving(true);
    try {
      const response = await fetch(`/api/schedules/conflicts/${selectedConflict._id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resolution }),
      });
      
      if (response.ok) {
        setConflicts(prev => prev.filter(c => c._id !== selectedConflict._id));
        setSelectedConflict(null);
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
    } finally {
      setResolving(false);
    }
  };

  const ConflictCard = ({ conflict }) => (
    <Card sx={{ mb: 2, border: '1px solid', borderColor: 'warning.main' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" color="warning.main" sx={{ display: 'flex', alignItems: 'center' }}>
            <Warning sx={{ mr: 1 }} />
            Schedule Conflict
          </Typography>
          <Chip
            label={conflict.status}
            color={conflict.status === 'pending' ? 'warning' : 'default'}
          />
        </Box>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Driver
            </Typography>
            <Typography>
              {conflict.driverName}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Date
            </Typography>
            <Typography>
              {format(new Date(conflict.date), 'MMM dd, yyyy')}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary">
              Conflicting Schedule
            </Typography>
            <Box sx={{ bgcolor: 'background.default', p: 1, borderRadius: 1 }}>
              <Typography>
                {conflict.conflictingSchedule.route.from} → {conflict.conflictingSchedule.route.to}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {format(new Date(conflict.conflictingSchedule.departureTime), 'HH:mm')} - 
                {format(new Date(conflict.conflictingSchedule.estimatedArrivalTime), 'HH:mm')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSelectConflict(conflict)}
          >
            Resolve Conflict
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const ResolutionDialog = () => (
    <Dialog
      open={!!selectedConflict}
      onClose={() => setSelectedConflict(null)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Resolve Schedule Conflict
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Select a resolution option below. The system has analyzed available drivers,
          routes, and schedules to provide optimal solutions.
        </Alert>
        <List>
          {resolutionOptions.map((option, index) => (
            <ListItem
              key={index}
              button
              onClick={() => resolveConflict(option)}
              disabled={resolving}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <ListItemText
                primary={option.title}
                secondary={option.description}
              />
              <Box display="flex" alignItems="center">
                <Chip
                  size="small"
                  label={`Impact: ${option.impactLevel}`}
                  color={
                    option.impactLevel === 'Low' ? 'success' :
                    option.impactLevel === 'Medium' ? 'warning' : 'error'
                  }
                  sx={{ mr: 1 }}
                />
                {option.type === 'swap' && <SwapHoriz color="action" />}
                {option.type === 'reassign' && <Person color="action" />}
                {option.type === 'reschedule' && <Schedule color="action" />}
              </Box>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSelectedConflict(null)}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Schedule Conflicts
      </Typography>
      {conflicts.length === 0 ? (
        <Alert severity="success">
          No active schedule conflicts
        </Alert>
      ) : (
        conflicts.map((conflict) => (
          <ConflictCard key={conflict._id} conflict={conflict} />
        ))
      )}
      <ResolutionDialog />
    </Box>
  );
};

export default ConflictResolution; 