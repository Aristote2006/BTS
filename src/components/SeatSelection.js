import React, { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { Grid, Button, Typography } from '@mui/material';

const SeatSelection = ({ routeId, selectedSeats, onSeatSelect }) => {
  const [availableSeats, setAvailableSeats] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    // Listen for real-time seat updates
    socket.onSeatUpdate((data) => {
      if (data.routeId === routeId) {
        setAvailableSeats(data.availableSeats);
      }
    });

    // Initial seat fetch
    fetchAvailableSeats();
  }, [routeId, socket]);

  const fetchAvailableSeats = async () => {
    try {
      const response = await fetch(`/api/routes/${routeId}/seats`);
      const data = await response.json();
      setAvailableSeats(data.availableSeats);
    } catch (error) {
      console.error('Error fetching seats:', error);
    }
  };

  const handleSeatClick = (seatNumber) => {
    if (availableSeats.includes(seatNumber)) {
      onSeatSelect(seatNumber);
    }
  };

  return (
    <Grid container spacing={1}>
      {Array.from({ length: 40 }, (_, i) => i + 1).map((seatNumber) => (
        <Grid item xs={2} key={seatNumber}>
          <Button
            variant={selectedSeats.includes(seatNumber) ? "contained" : "outlined"}
            onClick={() => handleSeatClick(seatNumber)}
            disabled={!availableSeats.includes(seatNumber)}
            sx={{
              width: '100%',
              aspectRatio: '1',
              backgroundColor: !availableSeats.includes(seatNumber) ? '#f5f5f5' : undefined
            }}
          >
            {seatNumber}
          </Button>
        </Grid>
      ))}
    </Grid>
  );
};

export default SeatSelection; 