import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Alert, Paper } from '@mui/material';
import { authAPI } from '../services/api'; // Ensure this path is correct

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.sendResetCode({ identifier });
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || 'Failed to send reset code');
      }
    } catch (err) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
      <Paper elevation={3} style={{ padding: '2rem' }}>
        <Typography variant="h4" gutterBottom>
          Forgot Password
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">Reset code sent! Check your email or phone.</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email or Phone Number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Code'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default ForgotPassword; 