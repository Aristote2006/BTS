import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  Divider,
  Alert,
  Fade,
  Chip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  ArrowBack,
  DirectionsBus,
  LocationOn,
  Person,
  EventSeat,
  Payment,
  CheckCircle,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

const steps = ['Trip Details', 'Select Bus', 'Passenger Info', 'Payment'];

const popularRoutes = [
  { from: 'Nairobi', to: 'Mombasa', price: 1200 },
  { from: 'Nairobi', to: 'Kisumu', price: 1000 },
  { from: 'Mombasa', to: 'Malindi', price: 800 },
  { from: 'Nairobi', to: 'Nakuru', price: 500 },
];

// Sample bus data (this would come from your API/backend)
const availableBuses = [
  {
    id: 1,
    name: "Express Liner",
    type: "Luxury",
    departureTime: "08:00 AM",
    arrivalTime: "02:00 PM",
    availableSeats: 32,
    price: 1200,
    amenities: ["WiFi", "AC", "USB Charging"]
  },
  {
    id: 2,
    name: "City Cruiser",
    type: "Standard",
    departureTime: "09:30 AM",
    arrivalTime: "03:30 PM",
    availableSeats: 28,
    price: 800,
    amenities: ["AC", "USB Charging"]
  },
  {
    id: 3,
    name: "Night Rider",
    type: "VIP",
    departureTime: "10:00 PM",
    arrivalTime: "06:00 AM",
    availableSeats: 24,
    price: 1500,
    amenities: ["WiFi", "AC", "USB Charging", "Reclining Seats"]
  }
];

const Booking = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: null,
    passengers: 1,
    selectedBus: null,
    name: '',
    email: '',
    phone: '',
  });
  
  const navigate = useNavigate();
  const theme = useTheme();
  const { darkMode, toggleDarkMode } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleNext = () => {
    // Validate current step before proceeding
    if (!isStepValid(activeStep)) {
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        if (!formData.from || !formData.to || !formData.date || !formData.passengers) {
          alert('Please fill in all trip details');
          return false;
        }
        return true;
      case 1:
        if (!formData.selectedBus) {
          alert('Please select a bus');
          return false;
        }
        return true;
      case 2:
        if (!formData.name || !formData.email || !formData.phone) {
          alert('Please fill in all passenger details');
          return false;
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          alert('Please enter a valid email address');
          return false;
        }
        // Basic phone validation (at least 10 digits)
        const phoneRegex = /^\d{10,}$/;
        if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
          alert('Please enter a valid phone number');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isStepValid(activeStep)) {
      return;
    }

    // Here you would typically make an API call to submit the booking
    try {
      // Simulating API call
      console.log('Submitting booking:', {
        ...formData,
        totalPrice: formData.selectedBus.price * formData.passengers,
      });

      // Show success message
      alert('Booking successful! You will receive a confirmation email shortly.');
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      alert('Failed to submit booking. Please try again.');
    }
  };

  const filterBusesByRoute = () => {
    return availableBuses.filter(bus => {
      // In a real app, you would filter based on the selected route
      // For now, we'll show all buses
      return true;
    });
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleDateChange = (newDate) => {
    setFormData({
      ...formData,
      date: newDate,
    });
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{
                  fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.7rem' },
                  fontWeight: 600,
                  color: darkMode ? 'primary.light' : 'primary.main',
                  mb: 3,
                }}
              >
                Select Your Route
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!formData.from}>
                <InputLabel>From</InputLabel>
                <Select
                  value={formData.from}
                  onChange={handleInputChange('from')}
                  label="From"
                  required
                  sx={{
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '1.1rem', sm: '1.2rem' },
                      color: darkMode ? 'grey.400' : 'text.secondary',
                    },
                    '& .MuiSelect-select': {
                      fontSize: { xs: '1.1rem', sm: '1.2rem' },
                      color: darkMode ? 'white' : 'text.primary',
                    },
                  }}
                >
                  {popularRoutes.map((route) => (
                    <MenuItem key={route.from} value={route.from}>
                      {route.from}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!formData.to}>
                <InputLabel>To</InputLabel>
                <Select
                  value={formData.to}
                  onChange={handleInputChange('to')}
                  label="To"
                  required
                  sx={{
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '1.1rem', sm: '1.2rem' },
                      color: darkMode ? 'grey.400' : 'text.secondary',
                    },
                    '& .MuiSelect-select': {
                      fontSize: { xs: '1.1rem', sm: '1.2rem' },
                      color: darkMode ? 'white' : 'text.primary',
                    },
                  }}
                >
                  {popularRoutes.map((route) => (
                    <MenuItem key={route.to} value={route.to}>
                      {route.to}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Date & Time"
                  value={formData.date}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={new Date()}
                  sx={{
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '1.1rem', sm: '1.2rem' },
                      color: darkMode ? 'grey.400' : 'text.secondary',
                    },
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '1.1rem', sm: '1.2rem' },
                      color: darkMode ? 'white' : 'text.primary',
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!formData.passengers}>
                <InputLabel>Passengers</InputLabel>
                <Select
                  value={formData.passengers}
                  onChange={handleInputChange('passengers')}
                  label="Passengers"
                  required
                  sx={{
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '1.1rem', sm: '1.2rem' },
                      color: darkMode ? 'grey.400' : 'text.secondary',
                    },
                    '& .MuiSelect-select': {
                      fontSize: { xs: '1.1rem', sm: '1.2rem' },
                      color: darkMode ? 'white' : 'text.primary',
                    },
                  }}
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num} {num === 1 ? 'Passenger' : 'Passengers'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  mt: 2,
                  fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.7rem' },
                  fontWeight: 600,
                  color: darkMode ? 'primary.light' : 'primary.main',
                  mb: 2,
                }}
              >
                Popular Routes
              </Typography>
            </Grid>
            <Grid container spacing={2}>
              {popularRoutes.map((route, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'background.paper',
                        '&:hover': {
                          bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        },
                      }}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          from: route.from,
                          to: route.to,
                        });
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <DirectionsBus color="primary" />
                        <Box>
                          <Typography 
                            variant="subtitle1"
                            sx={{
                              fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' },
                              fontWeight: 500,
                              color: darkMode ? 'white' : 'text.primary',
                            }}
                          >
                            {route.from} → {route.to}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{
                              color: darkMode ? 'grey.400' : 'text.secondary',
                              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                              mt: 0.5,
                            }}
                          >
                            From KES {route.price}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Grid>
        );

      case 1:
        const filteredBuses = filterBusesByRoute();
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{
                    fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.7rem' },
                    fontWeight: 600,
                    color: darkMode ? 'primary.light' : 'primary.main',
                  }}
                >
                  Select Your Bus
                </Typography>
                <Typography 
                  variant="subtitle1"
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    color: darkMode ? 'grey.400' : 'text.secondary',
                  }}
                >
                  From {formData.from} to {formData.to} • {formData.passengers} {formData.passengers === 1 ? 'passenger' : 'passengers'}
                </Typography>
              </Box>
            </Grid>
            {filteredBuses.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">
                  No buses available for the selected route and date. Please try different dates or routes.
                </Alert>
              </Grid>
            ) : (
              filteredBuses.map((bus) => (
                <Grid item xs={12} key={bus.id}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Paper
                      sx={{
                        p: 3,
                        cursor: 'pointer',
                        bgcolor: formData.selectedBus?.id === bus.id 
                          ? (darkMode ? 'rgba(25, 118, 210, 0.15)' : 'rgba(25, 118, 210, 0.08)')
                          : (darkMode ? 'rgba(255,255,255,0.05)' : 'background.paper'),
                        '&:hover': {
                          bgcolor: darkMode 
                            ? 'rgba(255,255,255,0.1)' 
                            : 'rgba(0,0,0,0.05)',
                        },
                        border: formData.selectedBus?.id === bus.id 
                          ? '2px solid' 
                          : '1px solid',
                        borderColor: formData.selectedBus?.id === bus.id
                          ? 'primary.main'
                          : (darkMode ? 'rgba(255,255,255,0.1)' : 'divider'),
                      }}
                      onClick={() => setFormData({ ...formData, selectedBus: bus })}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <DirectionsBus 
                              color="primary" 
                              sx={{ fontSize: '2rem' }}
                            />
                            <Typography 
                              variant="h6"
                              sx={{
                                fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.4rem' },
                                fontWeight: 600,
                                color: darkMode ? 'white' : 'text.primary',
                              }}
                            >
                              {bus.name} - {bus.type}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                            {bus.amenities.map((amenity, index) => (
                              <Chip
                                key={index}
                                label={amenity}
                                size="small"
                                sx={{
                                  fontSize: '0.9rem',
                                  bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                  color: darkMode ? 'white' : 'text.primary',
                                }}
                              />
                            ))}
                          </Box>
                          <Typography 
                            variant="body1"
                            sx={{
                              fontSize: { xs: '1rem', sm: '1.1rem' },
                              color: darkMode ? 'grey.400' : 'text.secondary',
                              mb: 1,
                            }}
                          >
                            {bus.departureTime} - {bus.arrivalTime}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: { xs: 'flex-start', sm: 'flex-end' },
                            height: '100%',
                            justifyContent: 'space-between'
                          }}>
                            <Typography 
                              variant="h6"
                              sx={{
                                fontSize: { xs: '1.2rem', sm: '1.3rem' },
                                color: darkMode ? 'primary.light' : 'primary.main',
                                fontWeight: 600,
                              }}
                            >
                              KES {bus.price}
                            </Typography>
                            <Typography 
                              variant="body2"
                              sx={{
                                fontSize: '1rem',
                                color: darkMode ? 'grey.400' : 'text.secondary',
                              }}
                            >
                              {bus.availableSeats} seats available
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </motion.div>
                </Grid>
              ))
            )}
            {formData.selectedBus && (
              <Grid item xs={12}>
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: darkMode ? 'rgba(25, 118, 210, 0.15)' : 'rgba(25, 118, 210, 0.08)',
                  borderRadius: 1,
                }}>
                  <Typography 
                    variant="h6"
                    sx={{
                      fontSize: { xs: '1.1rem', sm: '1.2rem' },
                      color: darkMode ? 'primary.light' : 'primary.main',
                      mb: 1,
                    }}
                  >
                    Booking Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Bus: {formData.selectedBus.name} ({formData.selectedBus.type})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Time: {formData.selectedBus.departureTime} - {formData.selectedBus.arrivalTime}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Passengers: {formData.passengers}
                      </Typography>
                      <Typography 
                        variant="h6"
                        sx={{
                          fontSize: '1.2rem',
                          color: darkMode ? 'primary.light' : 'primary.main',
                          fontWeight: 600,
                        }}
                      >
                        Total: KES {formData.selectedBus.price * formData.passengers}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            )}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                error={!formData.name}
                sx={{
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '1.1rem', sm: '1.2rem' },
                    color: darkMode ? 'grey.400' : 'text.secondary',
                  },
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '1.1rem', sm: '1.2rem' },
                    color: darkMode ? 'white' : 'text.primary',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={!formData.email}
                sx={{
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '1.1rem', sm: '1.2rem' },
                    color: darkMode ? 'grey.400' : 'text.secondary',
                  },
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '1.1rem', sm: '1.2rem' },
                    color: darkMode ? 'white' : 'text.primary',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                error={!formData.phone}
                sx={{
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '1.1rem', sm: '1.2rem' },
                    color: darkMode ? 'grey.400' : 'text.secondary',
                  },
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '1.1rem', sm: '1.2rem' },
                    color: darkMode ? 'white' : 'text.primary',
                  },
                }}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Payment integration will be implemented here
              </Alert>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'background.paper',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Booking Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      Route: {formData.from} → {formData.to}
                    </Typography>
                    <Typography variant="body1">
                      Bus: {formData.selectedBus.name} ({formData.selectedBus.type})
                    </Typography>
                    <Typography variant="body1">
                      Date: {formData.date?.toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1">
                      Time: {formData.selectedBus.departureTime} - {formData.selectedBus.arrivalTime}
                    </Typography>
                    <Typography variant="body1">
                      Passengers: {formData.passengers}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 2, color: 'primary.main' }}>
                      Total Amount: KES {formData.selectedBus.price * formData.passengers}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: darkMode ? '#121212' : 'background.default',
        color: darkMode ? 'white' : 'text.primary',
      }}
    >
      <AppBar 
        position="static" 
        sx={{ 
          bgcolor: darkMode ? '#1a1a1a' : theme.palette.primary.main,
          boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1.4rem', sm: '1.6rem', md: '1.8rem' },
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            Book Your Trip
          </Typography>
          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper
          elevation={darkMode ? 8 : 1}
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: darkMode ? '#1a1a1a' : 'background.paper',
          }}
        >
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel={!isMobile}
            orientation={isMobile ? 'vertical' : 'horizontal'}
            sx={{
              mb: 4,
              '& .MuiStepLabel-label': {
                color: darkMode ? 'grey.400' : 'text.secondary',
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                fontWeight: 500,
              },
              '& .MuiStepLabel-completed': {
                color: darkMode ? 'primary.light' : 'primary.main',
              },
              '& .MuiStepLabel-active': {
                color: darkMode ? 'primary.light' : 'primary.main',
                fontWeight: 600,
              },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit}>
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              {activeStep !== 0 && (
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
              )}
              <Button
                variant="contained"
                onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                sx={{
                  bgcolor: darkMode ? 'primary.dark' : 'primary.main',
                  color: 'white',
                  fontSize: { xs: '1.1rem', sm: '1.2rem' },
                  fontWeight: 600,
                  py: { xs: 1.2, sm: 1.5 },
                  px: { xs: 3, sm: 4 },
                  '&:hover': {
                    bgcolor: darkMode ? 'primary.main' : 'primary.dark',
                  },
                }}
              >
                {activeStep === steps.length - 1 ? 'Book Now' : 'Next'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Booking;