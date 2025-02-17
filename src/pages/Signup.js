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
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation checks
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
    try {
      // Prepare registration data
      const registrationData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password
      };

      // Call registration API
      const response = await authAPI.register(registrationData);
      
      // Handle successful registration
      if (response.success) {
        // Store the token and user data
        login(response.data);
        
        // Show success message or redirect
        navigate('/dashboard');
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
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
                  placeholder="+250700000000"
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
