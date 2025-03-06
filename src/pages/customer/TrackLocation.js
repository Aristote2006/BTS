import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const TrackLocation = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Track Location
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography>Bus tracking feature will be available here.</Typography>
      </Paper>
    </Box>
  );
};

export default TrackLocation;
