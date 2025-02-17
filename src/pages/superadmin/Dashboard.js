import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
} from '@mui/material';
import {
  Business,
  SupervisorAccount,
  AttachMoney,
  Edit,
  Delete,
  Add as AddIcon,
  Speed,
  Timeline,
  Warning,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import DashboardLayout from '../../layouts/DashboardLayout';
import RealTimeOptimizer from '../../components/RealTimeOptimizer';
import ConflictPrevention from '../../components/ConflictPrevention';
import AdvancedAnalytics from '../../components/AdvancedAnalytics';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardData, setDashboardData] = useState({
    agencies: [],
    statistics: {
      totalAgencies: 0,
      totalAdmins: 0,
      totalRevenue: 0,
    },
    optimization: {
      routeEfficiency: 0,
      conflictRate: 0,
      systemHealth: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [agenciesResponse, analyticsResponse, optimizationResponse] = await Promise.all([
        fetch('/api/agencies/summary'),
        fetch('/api/analytics/dashboard'),
        fetch('/api/optimization/status'),
      ]);

      const [agencies, analytics, optimization] = await Promise.all([
        agenciesResponse.json(),
        analyticsResponse.json(),
        optimizationResponse.json(),
      ]);

      setDashboardData({
        agencies: agencies.data,
        statistics: analytics.data,
        optimization: optimization.data,
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Super Admin Dashboard</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            color="primary"
          >
            Add New Agency
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Statistics Cards */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Business sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Agencies
                    </Typography>
                    <Typography variant="h5">
                      {dashboardData.statistics.totalAgencies}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SupervisorAccount sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Admins
                    </Typography>
                    <Typography variant="h5">
                      {dashboardData.statistics.totalAdmins}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoney sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Revenue
                    </Typography>
                    <Typography variant="h5">
                      {new Intl.NumberFormat('rw-RW', {
                        style: 'currency',
                        currency: 'RWF'
                      }).format(dashboardData.statistics.totalRevenue)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* System Health Indicators */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange} centered>
                <Tab label="System Overview" />
                <Tab label="Real-Time Optimization" />
                <Tab label="Conflict Prevention" />
                <Tab label="Advanced Analytics" />
              </Tabs>

              <Box sx={{ mt: 2 }}>
                {activeTab === 0 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <AgencyDistributionChart data={dashboardData.agencies} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <AgencyManagementTable agencies={dashboardData.agencies} />
                    </Grid>
                  </Grid>
                )}
                {activeTab === 1 && <RealTimeOptimizer />}
                {activeTab === 2 && <ConflictPrevention />}
                {activeTab === 3 && <AdvancedAnalytics />}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
};

const AgencyDistributionChart = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  return (
    <Paper sx={{ p: 2, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Agency Distribution
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={150}
            fill="#8884d8"
            dataKey="bookingsCount"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};

const AgencyManagementTable = ({ agencies }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Agency Management
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Agency Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Admins</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {agencies.map((agency) => (
            <TableRow key={agency._id}>
              <TableCell>{agency.name}</TableCell>
              <TableCell>
                <Button
                  size="small"
                  variant="contained"
                  color={agency.status === 'active' ? 'success' : 'error'}
                  sx={{ fontSize: '0.75rem' }}
                >
                  {agency.status}
                </Button>
              </TableCell>
              <TableCell>{agency.adminCount}</TableCell>
              <TableCell>
                <IconButton size="small" color="primary">
                  <Edit />
                </IconButton>
                <IconButton size="small" color="error">
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default SuperAdminDashboard; 
 