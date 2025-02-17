import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  DirectionsBus as BusIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  AccountCircle,
  CalendarToday,
  History,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './DashboardLayout.css';

const drawerWidth = 280;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  boxShadow: 'none',
  borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
}));

const DashboardLayout = ({ children }) => {
  const [open, setOpen] = useState(window.innerWidth > 960);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const handleResize = () => {
      setOpen(window.innerWidth > 960);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleOverlayClick = () => {
    if (window.innerWidth <= 960) {
      setOpen(false);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/customer/dashboard' },
    { text: 'Book Ticket', icon: <BusIcon />, path: '/customer/booking' },
    { text: 'My Bookings', icon: <ReceiptIcon />, path: '/customer/bookings' },
    { text: 'Travel History', icon: <History />, path: '/customer/history' },
    { text: 'Calendar', icon: <CalendarToday />, path: '/customer/calendar' },
    { text: 'Profile', icon: <PersonIcon />, path: '/customer/profile' },
  ];

  return (
    <Box sx={{ display: 'flex' }} className="dashboard-layout">
      <StyledAppBar position="fixed">
        <Toolbar className="toolbar">
          <IconButton
            color="primary"
            onClick={handleDrawerToggle}
            edge="start"
            className="menu-button"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" color="primary" className="app-title">
            Rwanda Bus Booking
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box className="toolbar-icons">
            <IconButton color="primary" className="notification-icon">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              onClick={handleProfileMenuOpen}
              className="profile-button"
            >
              <Avatar src={user?.avatar} alt={user?.name}>
                {user?.name?.charAt(0)}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </StyledAppBar>

      <div 
        className={`drawer-overlay ${open && window.innerWidth <= 960 ? 'visible' : ''}`}
        onClick={handleOverlayClick}
      />

      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        className={`dashboard-drawer ${open ? 'open' : 'closed'}`}
      >
        <Box className="drawer-header">
          <Avatar
            src={user?.avatar}
            alt={user?.name}
            className="user-avatar"
          />
          <Box className="user-info">
            <Typography variant="subtitle1">{user?.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>
        <Divider />
        <List className="menu-list">
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              className="menu-item"
            >
              <ListItemIcon className="menu-icon">
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Box className="drawer-footer">
          <ListItem button onClick={handleLogout} className="logout-button">
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </Box>
      </Drawer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        className="profile-menu"
      >
        <MenuItem onClick={() => navigate('/customer/profile')}>
          <AccountCircle className="menu-icon" />
          Profile
        </MenuItem>
        <MenuItem onClick={() => navigate('/customer/settings')}>
          <SettingsIcon className="menu-icon" />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} className="logout-menu-item">
          <LogoutIcon className="menu-icon" />
          Logout
        </MenuItem>
      </Menu>

      <Main className={`main-content ${!open ? 'drawer-closed' : ''}`}>
        {children}
      </Main>
    </Box>
  );
};

export default DashboardLayout; 