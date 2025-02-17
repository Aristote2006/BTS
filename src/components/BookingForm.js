import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Ensure this path is correct

const BookingForm = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [agency, setAgency] = useState('');
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [agencies, setAgencies] = useState([]);
  const [price, setPrice] = useState(0);
  const navigate = useNavigate();

  // List of districts in Rwanda
  const districts = [
    'Bugesera',
    'Gatsibo',
    'Kayonza',
    'Kirehe',
    'Ngoma',
    'Nyagatare',
    'Rwamagana',
    'Kigali',
    'Gasabo',
    'Kicukiro',
    'Nyarugenge',
    'Burera',
    'Gakenke',
    'Gicumbi',
    'Musanze',
    'Rulindo',
    'Gisagara',
    'Huye',
    'Kamonyi',
    'Muhanga',
    'Nyamagabe',
    'Nyanza',
    'Nyaruguru',
    'Ruhango',
    'Karongi',
    'Ngororero',
    'Nyabihu',
    'Nyamasheke',
    'Rubavu',
    'Rusizi',
    'Rutsiro',
  ];

  useEffect(() => {
    // Fetch available agencies from the API
    const fetchAgencies = async () => {
      try {
        const agenciesResponse = await api.get('/agencies'); // Adjust the endpoint as necessary
        setAgencies(agenciesResponse.data);
      } catch (err) {
        console.error('Failed to fetch agencies', err);
      }
    };

    fetchAgencies();
  }, []);

  useEffect(() => {
    // Calculate price based on selected route
    if (from && to) {
      const basePrice = 10000; // Base price for the route
      const additionalCost = 2000; // Cost per ticket
      setPrice(basePrice + additionalCost * numberOfTickets);
    } else {
      setPrice(0);
    }
  }, [from, to, numberOfTickets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      setError('Please log in to book a ticket.');
      setLoading(false);
      navigate('/login'); // Redirect to login page
      return;
    }

    try {
      const response = await api.post('/bookings', { from, to, date, agency, numberOfTickets });
      setSuccess(true);
      navigate('/customer/bookings'); // Redirect to bookings page
    } catch (err) {
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>
      <Typography variant="h4" gutterBottom style={{ color: '#3f51b5', textAlign: 'center' }}>
        Create a Booking
      </Typography>
      <Paper elevation={3} style={{ padding: '2rem', borderRadius: '8px', backgroundColor: '#ffffff' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel>From</InputLabel>
                <Select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  label="From"
                  required
                >
                  {districts.map((district) => (
                    <MenuItem key={district} value={district}>
                      {district}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel>To</InputLabel>
                <Select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  label="To"
                  required
                >
                  {districts.map((district) => (
                    <MenuItem key={district} value={district}>
                      {district}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                type="date"
                variant="outlined"
                fullWidth
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel>Agency</InputLabel>
                <Select
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  label="Agency"
                  required
                >
                  {agencies.map((agency) => (
                    <MenuItem key={agency.id} value={agency.name}>
                      {agency.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Number of Tickets"
                type="number"
                variant="outlined"
                fullWidth
                value={numberOfTickets}
                onChange={(e) => setNumberOfTickets(e.target.value)}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" style={{ color: '#3f51b5' }}>
                Total Price: RWF {price}
              </Typography>
            </Grid>
          </Grid>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            style={{ marginTop: '1rem', width: '100%', backgroundColor: '#3f51b5', transition: 'background-color 0.3s' }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#303f9f')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#3f51b5')}
          >
            {loading ? <CircularProgress size={24} /> : 'Book Now'}
          </Button>
        </form>
      </Paper>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        message="Booking created successfully!"
      />
      {error && (
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={6000}
          onClose={() => setError('')}
          message={error}
        />
      )}
    </Container>
  );
};

export default BookingForm;
