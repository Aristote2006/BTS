import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  InputAdornment, 
  IconButton,
  Paper,
  Divider,
  Alert,
  Checkbox,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock, 
  Person, 
  Google, 
  Facebook,
  Phone
} from '@mui/icons-material';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };
  const validatePhoneNumber = (phone) => {
    // Rwandan phone number format: +250xxxxxxxxx or 07xxxxxxxx
    const phoneRegex = /^(\+250|07)\d{8}$/;
    return phoneRegex.test(phone);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Validation checks
      if (!formData.name.trim()) {
        setError('Name is required');
        return;
      }
      if (!formData.email.trim()) {
        setError('Email is required');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (!agreeToTerms) {
        setError('Please agree to the Terms and Conditions');
        return;
      }
      if (!validatePhoneNumber(formData.phoneNumber)) {
        setError('Please enter a valid phone number');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      setIsLoading(true);
      
      // Format phone number if needed
      const formattedPhone = formData.phoneNumber.startsWith('+') 
        ? formData.phoneNumber 
        : formData.phoneNumber.startsWith('07')
          ? `+250${formData.phoneNumber.slice(2)}`
          : `+250${formData.phoneNumber}`;

      // Prepare registration data
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phoneNumber: formattedPhone,
        password: formData.password,
        role: 'customer' // Set default role as customer
      };

      const response = await authAPI.register(registrationData);
      
      if (response.success) {
        // Show success message
        setError('');
        const successMessage = 'Account created successfully! Redirecting...';
        setError(successMessage);
        
        // Store user data in context and localStorage
        login(response.data);
        
        // Clear form
        setFormData({
          name: '',
          email: '',
          phoneNumber: '',
          password: '',
          confirmPassword: ''
        });
        setAgreeToTerms(false);
        
        // Add a slight delay before navigation for better UX
        setTimeout(() => {
          // Navigate to appropriate dashboard based on role
          const userRole = response.data.role?.toLowerCase();
          const dashboardPath = userRole === 'admin' ? '/admin/dashboard' 
            : userRole === 'driver' ? '/driver/dashboard'
            : userRole === 'conveyor' ? '/conveyor/dashboard'
            : userRole === 'superadmin' ? '/superadmin/dashboard'
            : '/customer/dashboard';
            
          navigate(dashboardPath);
        }, 2000); // 2 second delay
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSocialSignup = (provider) => {
    // Add social signup logic here
    console.log(`${provider} signup attempted`);
  };

  return (
    <div className="signup-page">
      <div className="slideshow-container">
        <div className="slide"></div>
        <div className="slide"></div>
      </div>
      <Container maxWidth="xs">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper elevation={3} className="signup-paper">
            <Box className="signup-box">
              <Typography variant="h4" className="signup-title">
                Create Account
              </Typography>
              <Typography variant="body1" className="signup-subtitle">
                Join our community today
              </Typography>

              {error && (
                <Alert severity="error" className="signup-alert">
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="signup-form">
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person className="input-icon" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email className="input-icon" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  placeholder="+250780000000"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone className="input-icon" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="input-icon" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="input-icon" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="terms-checkbox"
                    />
                  }
                  label={
                    <Typography variant="body2" className="terms-text">
                      I agree to the <Link to="/terms" className="terms-link">Terms and Conditions</Link>
                    </Typography>
                  }
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  className="signup-button"
                  disabled={isLoading || !agreeToTerms}
                  sx={{
                    mt: 2,
                    mb: 2,
                    height: 48,
                    backgroundColor: '#1a237e',
                    '&:hover': {
                      backgroundColor: '#0d47a1',
                    },
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              <Divider className="divider">
                <Typography variant="body2">OR</Typography>
              </Divider>

              <Box className="social-buttons">
                <Button
                  variant="outlined"
                  className="google-button"
                  startIcon={<Google />}
                  onClick={() => handleSocialSignup('Google')}
                >
                  Google
                </Button>
                <Button
                  variant="outlined"
                  className="facebook-button"
                  startIcon={<Facebook />}
                  onClick={() => handleSocialSignup('Facebook')}
                >
                  Facebook
                </Button>
              </Box>

              <Box className="login-prompt">
                <Typography variant="body2">
                  Already have an account?
                </Typography>
                <Link to="/login" className="login-link">
                  Sign In
                </Link>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </div>
  );
};

export default Signup;
