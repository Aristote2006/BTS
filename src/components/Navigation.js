import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Container,
  useScrollTrigger,
  Avatar,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { motion, AnimatePresence } from 'framer-motion';
import './Navigation.css';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { title: 'Home', path: '/' },
    { title: 'Routes', path: '/routes' },
    { title: 'Schedule', path: '/schedule' },
    { title: 'About', path: '/about' },
    { title: 'Contact', path: '/contact' },
  ];

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <AppBar 
      position="fixed" 
      className={`navbar ${isScrolled ? 'scrolled' : ''}`}
      elevation={isScrolled ? 4 : 0}
      style={{ backgroundColor: '#3f51b5' }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters className="toolbar">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="logo-link">
              <span className="logo-text">Rwanda</span>
              <span className="logo-accent">Bus</span>
            </Link>
          </motion.div>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }} className="nav-links-container">
            {navItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Button
                  component={Link}
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.title}
                </Button>
              </motion.div>
            ))}
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: navItems.length * 0.1 }}
            >
              <Button
                className="auth-button"
                onClick={handleMenuOpen}
                startIcon={<AccountCircleIcon />}
              >
                Login
              </Button>
            </motion.div>
          </Box>

          <IconButton
            className="menu-button"
            onClick={toggleDrawer}
            sx={{ display: { xs: 'flex', md: 'none' } }}
          >
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Toolbar>
      </Container>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        className="auth-menu"
      >
        <MenuItem component={Link} to="/login" onClick={handleMenuClose}>Login</MenuItem>
        <MenuItem component={Link} to="/register" onClick={handleMenuClose}>Sign Up</MenuItem>
      </Menu>

      <Drawer
        anchor="right"
        open={isOpen}
        onClose={toggleDrawer}
        className="mobile-drawer"
      >
        <Box className="drawer-content">
          {navItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ListItem
                component={Link}
                to={item.path}
                onClick={toggleDrawer}
                className={`drawer-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <ListItemText primary={item.title} />
              </ListItem>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: navItems.length * 0.1 }}
          >
            <ListItem
              component={Link}
              to="/login"
              onClick={toggleDrawer}
              className="drawer-auth"
            >
              <ListItemText primary="Login" />
            </ListItem>
          </motion.div>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navigation;
