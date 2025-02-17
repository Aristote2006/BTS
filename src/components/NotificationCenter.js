import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import {
  Notifications,
  DirectionsBus,
  Warning,
  CheckCircle,
  Schedule,
  Person,
} from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';
import { format } from 'date-fns';

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocket();

  useEffect(() => {
    fetchNotifications();
    
    // Listen for real-time notifications
    socket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // Listen for schedule conflicts
    socket.on('scheduleConflict', (conflict) => {
      const notification = {
        type: 'conflict',
        title: 'Schedule Conflict Detected',
        message: `Conflict detected for ${conflict.driverName} on ${format(new Date(conflict.date), 'MMM dd, yyyy')}`,
        severity: 'warning',
        timestamp: new Date(),
        data: conflict
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.off('notification');
      socket.off('scheduleConflict');
    };
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data.data);
      setUnreadCount(data.data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'schedule':
        return <Schedule color="primary" />;
      case 'conflict':
        return <Warning color="error" />;
      case 'driver':
        return <Person color="info" />;
      case 'success':
        return <CheckCircle color="success" />;
      default:
        return <DirectionsBus />;
    }
  };

  const NotificationItem = ({ notification }) => (
    <ListItem
      button
      onClick={() => markAsRead(notification._id)}
      sx={{
        bgcolor: notification.read ? 'transparent' : 'action.hover',
        '&:hover': { bgcolor: 'action.selected' }
      }}
    >
      <ListItemIcon>
        {getNotificationIcon(notification.type)}
      </ListItemIcon>
      <ListItemText
        primary={notification.title}
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary">
              {notification.message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {format(new Date(notification.timestamp), 'MMM dd, yyyy HH:mm')}
            </Typography>
          </Box>
        }
      />
      {notification.severity && (
        <Chip
          size="small"
          label={notification.severity}
          color={
            notification.severity === 'warning' ? 'warning' : 
            notification.severity === 'error' ? 'error' : 'default'
          }
          sx={{ ml: 1 }}
        />
      )}
    </ListItem>
  );

  return (
    <>
      <IconButton color="inherit" onClick={() => setOpen(true)}>
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } }
        }}
      >
        <Box p={2}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {notifications.map((notification) => (
            <React.Fragment key={notification._id}>
              <NotificationItem notification={notification} />
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default NotificationCenter; 