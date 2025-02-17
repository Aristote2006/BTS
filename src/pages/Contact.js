import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Card,
  CardContent
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log(formData);
  };

  const contactInfo = [
    {
      icon: <LocationOnIcon />,
      title: 'Our Location',
      details: 'Rubavu, Rwanda'
    },
    {
      icon: <PhoneIcon />,
      title: 'Phone Number',
      details: '+250 784 227 283'
    },
    {
      icon: <EmailIcon />,
      title: 'Email Address',
      details: 'cavakenneth58@gmail.com'
    }
  ];

  return (
    <div className="contact-page">
      <Container maxWidth="lg">
        <Typography variant="h2" className="page-title">
          Contact Us
        </Typography>
        
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSubmit} className="contact-form">
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                margin="normal"
                required
                multiline
                rows={4}
              />
              <Button 
                type="submit" 
                variant="contained" 
                className="submit-button"
              >
                Send Message
              </Button>
            </form>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box className="contact-info">
              {contactInfo.map((info, index) => (
                <Card key={index} className="info-card">
                  <CardContent>
                    <div className="info-icon">{info.icon}</div>
                    <Typography variant="h6" className="info-title">
                      {info.title}
                    </Typography>
                    <Typography variant="body1" className="info-details">
                      {info.details}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Contact; 