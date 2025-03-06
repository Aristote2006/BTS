import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';

// Dashboard imports
import CustomerDashboard from './pages/customer/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import DriverDashboard from './pages/driver/Dashboard';
import ConveyorDashboard from './pages/conveyor/Dashboard';
import SuperAdminDashboard from './pages/superadmin/Dashboard';

// Other Pages
import Booking from './pages/customer/Booking';
import BookingHistory from './pages/customer/BookingHistory';
import TrackLocation from './pages/customer/TrackLocation';
import Support from './pages/customer/Support';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import Contact from './pages/Contact';
import Schedule from './pages/Schedule';
import RoutesPage from './pages/Routes';

// Create MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e',
    },
    secondary: {
      main: '#0d47a1',
    },
  },
});

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CustomThemeProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              
              {/* Dashboard Routes */}
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/driver/dashboard" element={<DriverDashboard />} />
              <Route path="/conveyor/dashboard" element={<ConveyorDashboard />} />
              <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Signup/>} />
              
              {/* Other Routes */}
              <Route path="/bookings" element={<Booking />} />
              <Route path="/history" element={<BookingHistory />} />
              <Route path="/track" element={<TrackLocation />} />
              <Route path="/support" element={<Support />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/schedule" element={<Schedule />} />
            </Routes>
          </ThemeProvider>
        </CustomThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;