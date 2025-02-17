import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  Grid,
} from '@mui/material';
import {
  Visibility,
  Schedule,
  Payment,
  Edit,
  ExitToApp,
  Login,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';

const actionIcons = {
  login: <Login color="success" />,
  logout: <ExitToApp color="error" />,
  booking_created: <Schedule color="primary" />,
  payment_made: <Payment color="primary" />,
  profile_updated: <Edit />,
  route_viewed: <Visibility />,
};

const UserActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date(),
  });

  useEffect(() => {
    fetchActivities();
  }, [dateRange]);

  const fetchActivities = async () => {
    try {
      const response = await fetch(
        `/api/activities?startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`
      );
      const data = await response.json();
      setActivities(data.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const getActionColor = (action) => {
    const colors = {
      login: 'success',
      logout: 'error',
      booking_created: 'primary',
      booking_cancelled: 'warning',
      payment_made: 'info',
      profile_updated: 'secondary',
      route_viewed: 'default',
    };
    return colors[action] || 'default';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          User Activity Log
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Start Date"
              value={dateRange.startDate}
              onChange={(newDate) => setDateRange({ ...dateRange, startDate: newDate })}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <DatePicker
              label="End Date"
              value={dateRange.endDate}
              onChange={(newDate) => setDateRange({ ...dateRange, endDate: newDate })}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
        </Grid>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>IP Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity._id}>
                <TableCell>
                  {format(new Date(activity.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{activity.user.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {activity.user.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={actionIcons[activity.action]}
                    label={activity.action.replace('_', ' ')}
                    color={getActionColor(activity.action)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title={JSON.stringify(activity.details, null, 2)}>
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell>{activity.ipAddress}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UserActivityLog; 