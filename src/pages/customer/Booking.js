import React from 'react';
import BookingForm from '../../components/BookingForm'; // Ensure this path is correct

const Booking = () => {
  return (
    <div>
      <h1 style={{ textAlign: 'center', color: '#3f51b5' }}>Booking Page</h1>
      <BookingForm /> {/* Render the BookingForm component */}
    </div>
  );
};

export default Booking; 