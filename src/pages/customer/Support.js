import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Support = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Support
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography>Customer support information will be displayed here.</Typography>
      </Paper>
    </Box>
  );
};

export default Support;
