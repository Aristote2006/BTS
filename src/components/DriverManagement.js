import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Avatar,
  Rating,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  Delete,
  DirectionsBus,
  Schedule,
  Star,
  Assessment,
} from '@mui/icons-material';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    phone: '',
    email: '',
    experience: '',
    status: 'available'
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers');
      const data = await response.json();
      setDrivers(data.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedDriver 
        ? `/api/drivers/${selectedDriver._id}`
        : '/api/drivers';
      const method = selectedDriver ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        fetchDrivers();
        handleClose();
      }
    } catch (error) {
      console.error('Error saving driver:', error);
    }
  };

  const handleEdit = (driver) => {
    setSelectedDriver(driver);
    setFormData({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      phone: driver.phone,
      email: driver.email,
      experience: driver.experience,
      status: driver.status
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await fetch(`/api/drivers/${id}`, { method: 'DELETE' });
        fetchDrivers();
      } catch (error) {
        console.error('Error deleting driver:', error);
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedDriver(null);
    setFormData({
      name: '',
      licenseNumber: '',
      phone: '',
      email: '',
      experience: '',
      status: 'available'
    });
  };

  const DriverForm = () => (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {selectedDriver ? 'Edit Driver' : 'Add New Driver'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="License Number"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Experience (years)"
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {selectedDriver ? 'Update' : 'Add'} Driver
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );

  const DriverStats = ({ driver }) => (
    <Box mt={2}>
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <Typography variant="subtitle2" color="textSecondary">
            Total Trips
          </Typography>
          <Typography variant="h6">
            {driver.stats?.totalTrips || 0}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Typography variant="subtitle2" color="textSecondary">
            On-Time Rate
          </Typography>
          <Typography variant="h6">
            {driver.stats?.onTimeRate || 0}%
          </Typography>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Typography variant="subtitle2" color="textSecondary">
            Rating
          </Typography>
          <Rating value={driver.stats?.rating || 0} readOnly size="small" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <Typography variant="subtitle2" color="textSecondary">
            Status
          </Typography>
          <Chip
            size="small"
            label={driver.status}
            color={driver.status === 'available' ? 'success' : 'warning'}
          />
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Driver Management</Typography>
        <Button
          variant="contained"
          startIcon={<DirectionsBus />}
          onClick={() => setOpen(true)}
        >
          Add Driver
        </Button>
      </Box>

      <Grid container spacing={3}>
        {drivers.map((driver) => (
          <Grid item xs={12} md={6} key={driver._id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ mr: 2 }}>{driver.name[0]}</Avatar>
                    <Box>
                      <Typography variant="h6">{driver.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        License: {driver.licenseNumber}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton onClick={() => handleEdit(driver)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(driver._id)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
                <DriverStats driver={driver} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <DriverForm />
    </Box>
  );
};

export default DriverManagement; 