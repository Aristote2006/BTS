import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  Chip,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add as AddIcon,
  Schedule,
  DirectionsBus,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const RouteScheduling = () => {
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    routeId: '',
    date: new Date(),
    departureTime: '',
    busNumber: '',
    driverName: '',
    availableSeats: 40,
    status: 'scheduled'
  });

  useEffect(() => {
    fetchSchedules();
    fetchRoutes();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedules');
      const data = await response.json();
      setSchedules(data.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await fetch('/api/routes');
      const data = await response.json();
      setRoutes(data.data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingSchedule 
        ? `/api/schedules/${editingSchedule._id}`
        : '/api/schedules';
      
      const method = editingSchedule ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchSchedules();
        handleClose();
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      routeId: schedule.route._id,
      date: new Date(schedule.date),
      departureTime: schedule.departureTime,
      busNumber: schedule.busNumber,
      driverName: schedule.driverName,
      availableSeats: schedule.availableSeats,
      status: schedule.status
    });
    setOpen(true);
  };

  const handleDelete = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        const response = await fetch(`/api/schedules/${scheduleId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchSchedules();
        }
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  const handleStatusChange = async (scheduleId, newStatus) => {
    try {
      const response = await fetch(`/api/schedules/${scheduleId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchSchedules();
      }
    } catch (error) {
      console.error('Error updating schedule status:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingSchedule(null);
    setFormData({
      routeId: '',
      date: new Date(),
      departureTime: '',
      busNumber: '',
      driverName: '',
      availableSeats: 40,
      status: 'scheduled'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'primary',
      inProgress: 'warning',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Route Scheduling</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            Add New Schedule
          </Button>
        </Box>

        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Route</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Departure</TableCell>
                <TableCell>Bus Number</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Available Seats</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DirectionsBus sx={{ mr: 1 }} />
                      {`${schedule.route.from} → ${schedule.route.to}`}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(schedule.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{schedule.departureTime}</TableCell>
                  <TableCell>{schedule.busNumber}</TableCell>
                  <TableCell>{schedule.driverName}</TableCell>
                  <TableCell>{schedule.availableSeats}</TableCell>
                  <TableCell>
                    <Chip
                      label={schedule.status}
                      color={getStatusColor(schedule.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(schedule)} size="small">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(schedule._id)} size="small" color="error">
                      <Delete />
                    </IconButton>
                    <IconButton onClick={() => handleStatusChange(schedule._id, 'inProgress')} size="small" color="warning">
                      <Schedule />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Route</InputLabel>
                    <Select
                      value={formData.routeId}
                      label="Route"
                      onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                      required
                    >
                      {routes.map((route) => (
                        <MenuItem key={route._id} value={route._id}>
                          {`${route.from} → ${route.to}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Date"
                    value={formData.date}
                    onChange={(newDate) => setFormData({ ...formData, date: newDate })}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Departure Time"
                    type="time"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Bus Number"
                    value={formData.busNumber}
                    onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Driver Name"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Available Seats"
                    type="number"
                    value={formData.availableSeats}
                    onChange={(e) => setFormData({ ...formData, availableSeats: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      label="Status"
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <MenuItem value="scheduled">Scheduled</MenuItem>
                      <MenuItem value="inProgress">In Progress</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editingSchedule ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default RouteScheduling; 