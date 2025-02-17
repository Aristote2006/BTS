import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Divider,
  Switch,
  Typography,
} from '@mui/material';
import {
  Menu as MenuIcon,
  DirectionsBus,
  Receipt,
  Schedule,
  LocationOn,
  History,
  Settings,
  ExitToApp,
  DarkMode,
  Dashboard,
  Person,
  Help,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './Sidebar.css';

const Sidebar = ({ open, onClose, onToggle, onLogout }) => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/customer/dashboard' },
    { text: 'Book a Trip', icon: <DirectionsBus />, path: '/customer/booking' },
    { text: 'My Bookings', icon: <Receipt />, path: '/customer/bookings' },
    { text: 'Bus Schedule', icon: <Schedule />, path: '/customer/schedule' },
    { text: 'Saved Locations', icon: <LocationOn />, path: '/customer/locations' },
    { text: 'History', icon: <History />, path: '/customer/history' },
    { text: 'Profile', icon: <Person />, path: '/customer/profile' },
    { text: 'Help & Support', icon: <Help />, path: '/customer/support' },
    { text: 'Settings', icon: <Settings />, path: '/customer/settings' },
  ];

  return (
    <>
      <Drawer
        variant="temporary"
        anchor="left"
        open={open}
        onClose={onClose}
        classes={{
          paper: `sidebar ${darkMode ? 'sidebar-dark' : ''}`
        }}
        PaperProps={{
          sx: {
            backgroundColor: darkMode ? '#1a1a2e' : '#ffffff',
          }
        }}
      >
        <Box className="sidebar-header">
          <Typography variant="h6">Bus Tracking</Typography>
        </Box>
        
        <Divider />
        
        <List className="sidebar-list">
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              className="sidebar-item"
            >
              <ListItemIcon className="sidebar-icon">{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>

        <Divider />

        <Box className="sidebar-footer">
          <Box className="theme-toggle">
            <DarkMode />
            <Switch
              checked={darkMode}
              onChange={toggleDarkMode}
              color="primary"
            />
            <Typography>Dark Mode</Typography>
          </Box>
          
          <ListItem
            button
            onClick={onLogout}
            className="logout-item"
          >
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar; 