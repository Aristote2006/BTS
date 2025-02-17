import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { Edit, Delete, Add as AddIcon } from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';

const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    price: '',
    departureTime: '',
    availableSeats: 40,
    status: 'active'
  });
  const socket = useSocket();

  useEffect(() => {
    fetchRoutes();
    
    // Listen for real-time route updates
    socket.onSeatUpdate((data) => {
      setRoutes(prevRoutes => 
        prevRoutes.map(route => 
          route._id === data.routeId 
            ? { ...route, availableSeats: data.availableSeats }
            : route
        )
      );
    });
  }, [socket]);

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
      const url = editingRoute 
        ? `/api/routes/${editingRoute._id}`
        : '/api/routes';
      
      const method = editingRoute ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchRoutes();
        handleClose();
      }
    } catch (error) {
      console.error('Error saving route:', error);
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      from: route.from,
      to: route.to,
      price: route.price,
      departureTime: route.departureTime,
      availableSeats: route.availableSeats,
      status: route.status
    });
    setOpen(true);
  };

  const handleDelete = async (routeId) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        const response = await fetch(`/api/routes/${routeId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchRoutes();
        }
      } catch (error) {
        console.error('Error deleting route:', error);
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingRoute(null);
    setFormData({
      from: '',
      to: '',
      price: '',
      departureTime: '',
      availableSeats: 40,
      status: 'active'
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Route Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Add New Route
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>From</TableCell>
            <TableCell>To</TableCell>
            <TableCell>Price (RWF)</TableCell>
            <TableCell>Departure Time</TableCell>
            <TableCell>Available Seats</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {routes.map((route) => (
            <TableRow key={route._id}>
              <TableCell>{route.from}</TableCell>
              <TableCell>{route.to}</TableCell>
              <TableCell>{route.price}</TableCell>
              <TableCell>{route.departureTime}</TableCell>
              <TableCell>{route.availableSeats}</TableCell>
              <TableCell>
                <Button
                  size="small"
                  variant="contained"
                  color={route.status === 'active' ? 'success' : 'error'}
                >
                  {route.status}
                </Button>
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleEdit(route)} color="primary">
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(route._id)} color="error">
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRoute ? 'Edit Route' : 'Add New Route'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="From"
                  value={formData.from}
                  onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="To"
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
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
                  label="Available Seats"
                  type="number"
                  value={formData.availableSeats}
                  onChange={(e) => setFormData({ ...formData, availableSeats: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingRoute ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default RouteManagement; 