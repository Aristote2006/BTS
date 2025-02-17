import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  QrCodeScanner,
  DirectionsBus,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import DashboardLayout from '../../layouts/DashboardLayout';

const ConveyorDashboard = () => {
  const [ticketDialog, setTicketDialog] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [scanResult, setScanResult] = useState(null);

  const handleTicketVerification = () => {
    // Simulate ticket verification
    setScanResult({
      valid: true,
      passenger: 'John Doe',
      from: 'Kigali',
      to: 'Butare',
      seat: '12',
      date: '2024-02-20',
    });
    setTicketDialog(true);
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Conveyor Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Verify Ticket
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Enter Ticket Number"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    startIcon={<QrCodeScanner />}
                    onClick={handleTicketVerification}
                  >
                    Verify
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DirectionsBus sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Today's Bus
                    </Typography>
                    <Typography variant="h5">Kigali - Butare (10:00 AM)</Typography>
                    <Typography color="textSecondary">
                      Seats: 35/40
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Verifications */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Verifications
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Ticket ID</TableCell>
                    <TableCell>Passenger</TableCell>
                    <TableCell>Route</TableCell>
                    <TableCell>Seat</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { time: '09:30 AM', status: 'valid' },
                    { time: '09:15 AM', status: 'invalid' },
                    { time: '09:00 AM', status: 'valid' },
                  ].map((verification, index) => (
                    <TableRow key={index}>
                      <TableCell>{verification.time}</TableCell>
                      <TableCell>TK{2024000 + index}</TableCell>
                      <TableCell>John Doe</TableCell>
                      <TableCell>Kigali - Butare</TableCell>
                      <TableCell>Seat {12 + index}</TableCell>
                      <TableCell>
                        {verification.status === 'valid' ? (
                          <CheckCircle color="success" />
                        ) : (
                          <Warning color="error" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>

        {/* Ticket Verification Dialog */}
        <Dialog open={ticketDialog} onClose={() => setTicketDialog(false)}>
          <DialogTitle>
            Ticket Verification Result
          </DialogTitle>
          <DialogContent>
            {scanResult && (
              <Box sx={{ mt: 2 }}>
                {scanResult.valid ? (
                  <>
                    <Typography color="success.main" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CheckCircle sx={{ mr: 1 }} /> Valid Ticket
                    </Typography>
                    <Typography>Passenger: {scanResult.passenger}</Typography>
                    <Typography>Route: {scanResult.from} - {scanResult.to}</Typography>
                    <Typography>Seat: {scanResult.seat}</Typography>
                    <Typography>Date: {scanResult.date}</Typography>
                  </>
                ) : (
                  <Typography color="error" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Warning sx={{ mr: 1 }} /> Invalid Ticket
                  </Typography>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTicketDialog(false)}>Close</Button>
            {scanResult?.valid && (
              <Button variant="contained" color="primary">
                Check In Passenger
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
};

export default ConveyorDashboard; 