import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          py: 5,
        }}
      >
        <Typography variant="h1" sx={{ mb: 4, color: '#7c5dfa' }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ mb: 2, color: 'white' }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: 'rgba(255, 255, 255, 0.7)' }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #7c5dfa, #5c3af0)',
            px: 4,
            py: 1.5,
            borderRadius: '10px',
          }}
        >
          Go Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound; 