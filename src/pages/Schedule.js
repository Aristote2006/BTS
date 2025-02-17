import React from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import './Schedule.css';

const Schedule = () => {
  const schedules = [
    {
      id: 1,
      route: 'Kigali - Musanze',
      departure: '08:00 AM',
      arrival: '10:00 AM',
      bus: 'Express 1',
      status: 'On Time'
    },
    {
      id: 2,
      route: 'Kigali - Butare',
      departure: '09:30 AM',
      arrival: '11:30 AM',
      bus: 'Express 2',
      status: 'Delayed'
    },
    {
      id: 3,
      route: 'Kigali - Gisenyi',
      departure: '10:00 AM',
      arrival: '01:00 PM',
      bus: 'Express 3',
      status: 'On Time'
    }
  ];

  return (
    <div className="schedule-page">
      <Container maxWidth="lg">
        <Typography variant="h2" className="page-title">
          Bus Schedule
        </Typography>
        <TableContainer component={Paper} className="schedule-table">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Route</TableCell>
                <TableCell>Departure</TableCell>
                <TableCell>Arrival</TableCell>
                <TableCell>Bus</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>{schedule.route}</TableCell>
                  <TableCell>{schedule.departure}</TableCell>
                  <TableCell>{schedule.arrival}</TableCell>
                  <TableCell>{schedule.bus}</TableCell>
                  <TableCell className={`status ${schedule.status.toLowerCase()}`}>
                    {schedule.status}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </div>
  );
};

export default Schedule; 