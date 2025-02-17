import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
} from '@mui/material';
import {
  ViewDay,
  ViewWeek,
  ViewMonth,
  DirectionsBus,
  Person,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const ScheduleCalendar = () => {
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [view, setView] = useState('week');
  const [date, setDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, [date, view]);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedules');
      const data = await response.json();
      const formattedSchedules = data.data.map(schedule => ({
        ...schedule,
        start: new Date(`${schedule.date}T${schedule.departureTime}`),
        end: new Date(`${schedule.date}T${schedule.departureTime}`),
        title: `${schedule.route.from} → ${schedule.route.to}`,
      }));
      setSchedules(formattedSchedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const handleSelectEvent = (schedule) => {
    setSelectedSchedule(schedule);
    setDialogOpen(true);
  };

  const ScheduleDetails = () => (
    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Schedule Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6">
              {selectedSchedule?.route.from} → {selectedSchedule?.route.to}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="textSecondary">Date</Typography>
            <Typography>
              {format(new Date(selectedSchedule?.date), 'MMMM d, yyyy')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="textSecondary">Departure Time</Typography>
            <Typography>{selectedSchedule?.departureTime}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="textSecondary">Bus Number</Typography>
            <Typography>{selectedSchedule?.busNumber}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="textSecondary">Driver</Typography>
            <Typography>{selectedSchedule?.driverName}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="textSecondary">Available Seats</Typography>
            <Typography>{selectedSchedule?.availableSeats}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="textSecondary">Status</Typography>
            <Typography>{selectedSchedule?.status}</Typography>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    switch (event.status) {
      case 'completed':
        backgroundColor = '#4caf50';
        break;
      case 'cancelled':
        backgroundColor = '#f44336';
        break;
      case 'inProgress':
        backgroundColor = '#ff9800';
        break;
    }
    return { style: { backgroundColor } };
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Schedule Calendar</Typography>
          <Box>
            <Tooltip title="Day View">
              <IconButton onClick={() => setView('day')}>
                <ViewDay />
              </IconButton>
            </Tooltip>
            <Tooltip title="Week View">
              <IconButton onClick={() => setView('week')}>
                <ViewWeek />
              </IconButton>
            </Tooltip>
            <Tooltip title="Month View">
              <IconButton onClick={() => setView('month')}>
                <ViewMonth />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Calendar
          localizer={localizer}
          events={schedules}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          tooltipAccessor={(event) => `${event.title} - ${event.status}`}
        />
      </Paper>
      <ScheduleDetails />
    </Box>
  );
};

export default ScheduleCalendar; 