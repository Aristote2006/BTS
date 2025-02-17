import React, { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { Snackbar, Alert } from '@mui/material';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    socket.onNotification((notification) => {
      setNotifications(prev => [...prev, notification]);
    });

    socket.onBookingUpdate((update) => {
      const message = update.type === 'new' 
        ? 'New booking received!'
        : 'Booking status updated';
      
      setNotifications(prev => [...prev, { 
        message,
        severity: 'info',
        ...update 
      }]);
    });
  }, [socket]);

  useEffect(() => {
    if (notifications.length > 0 && !open) {
      setCurrentNotification(notifications[0]);
      setOpen(true);
    }
  }, [notifications, open]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    setNotifications(prev => prev.slice(1));
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {currentNotification && (
        <Alert 
          onClose={handleClose} 
          severity={currentNotification.severity || 'info'}
          sx={{ width: '100%' }}
        >
          {currentNotification.message}
        </Alert>
      )}
    </Snackbar>
  );
};

export default Notifications; 