import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router } from 'react-router-dom';
import theme from './theme';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CustomThemeProvider>
        <AuthProvider>
          <Router>
            <Navigation />
            <AppRoutes />
          </Router>
        </AuthProvider>
      </CustomThemeProvider>
    </ThemeProvider>
  );
}

export default App;
