import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Signup';
import About from '../pages/About';
import Contact from '../pages/Contact';
import CustomerDashboard from '../pages/customer/Dashboard';
import AdminDashboard from '../pages/admin/Dashboard';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/ProtectedRoute';
import BookingForm from '../components/BookingForm';
import Booking from '../pages/customer/Booking';
import Profile from '../pages/customer/Profile';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* Customer Dashboard Routes */}
      <Route 
        path="/customer/dashboard" 
        element={
          <ProtectedRoute role="customer">
            <CustomerDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/customer/bookings" 
        element={
          <ProtectedRoute role="customer">
            <CustomerDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/customer/booking" 
        element={
          <ProtectedRoute role="customer">
            <Booking />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/customer/profile" 
        element={
          <ProtectedRoute role="customer">
            <Profile />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Dashboard Routes */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 