import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

const BookingHistory = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Trips
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography>Your booking history will appear here.</Typography>
      </Paper>
    </Box>
  );
};

export default BookingHistory;
