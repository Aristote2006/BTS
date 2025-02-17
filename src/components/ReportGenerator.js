import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  PictureAsPdf,
  TableChart,
  Download,
  DateRange,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const ReportGenerator = () => {
  const [reportType, setReportType] = useState('bookings');
  const [format, setFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
  });
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'bookings', label: 'Booking Report' },
    { value: 'revenue', label: 'Revenue Report' },
    { value: 'routes', label: 'Route Performance' },
    { value: 'drivers', label: 'Driver Performance' },
    { value: 'schedules', label: 'Schedule Analysis' },
    { value: 'customers', label: 'Customer Analysis' },
  ];

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: reportType,
          format,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }),
      });

      if (format === 'pdf') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report.pdf`;
        a.click();
      } else {
        const data = await response.json();
        const csvContent = "data:text/csv;charset=utf-8," + data.csvContent;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${reportType}-report.csv`);
        document.body.appendChild(link);
        link.click();
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Report Generator
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              label="Report Type"
              onChange={(e) => setReportType(e.target.value)}
            >
              {reportTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Format</InputLabel>
            <Select
              value={format}
              label="Format"
              onChange={(e) => setFormat(e.target.value)}
            >
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
            </Select>
          </FormControl>
        </Grid>
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
        <Grid item xs={12}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Download />}
            onClick={generateReport}
            disabled={loading}
            fullWidth
          >
            Generate Report
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ReportGenerator; 