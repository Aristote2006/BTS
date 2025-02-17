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
  CircularProgress
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  Facebook as FacebookIcon
} from '@mui/icons-material';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      
      if (response.success) {
        const userData = {
          ...response.data,
          token: response.data.token
        };
        
        login(userData);
        
        switch (userData.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'driver':
            navigate('/driver/dashboard');
            break;
          case 'superadmin':
            navigate('/superadmin/dashboard');
            break;
          default:
            navigate('/customer/dashboard');
        }
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Add social login logic here
    console.log(`${provider} login attempted`);
  };

  return (
    <div className="login-page">
      <Container maxWidth="xs">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper elevation={3} className="login-paper">
            <Box className="login-box">
              <Typography variant="h4" className="login-title">
                Welcome Back
              </Typography>
              <Typography variant="body1" className="login-subtitle">
                Please sign in to continue
              </Typography>

              {error && (
                <Alert severity="error" className="login-alert">
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="login-form">
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

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  className="login-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <Link to="/forgot-password" className="forgot-password">
                  Forgot Password?
                </Link>
              </form>

              <Divider className="divider">
                <Typography variant="body2">OR</Typography>
              </Divider>

              <Box className="social-buttons">
                <Button
                  variant="outlined"
                  className="google-button"
                  startIcon={<GoogleIcon />}
                  onClick={() => handleSocialLogin('Google')}
                >
                  Google
                </Button>
                <Button
                  variant="outlined"
                  className="facebook-button"
                  startIcon={<FacebookIcon />}
                  onClick={() => handleSocialLogin('Facebook')}
                >
                  Facebook
                </Button>
              </Box>

              <Box className="signup-prompt">
                <Typography variant="body2">
                  Don't have an account?
                </Typography>
                <Link to="/register" className="signup-link">
                  Sign Up
                </Link>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </div>
  );
};

export default Login;
