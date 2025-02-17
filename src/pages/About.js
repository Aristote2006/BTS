import React from 'react';
import { Container, Typography, Grid, Box, Card, CardContent } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import StarIcon from '@mui/icons-material/Star';
import './About.css';

const About = () => {
  const features = [
    {
      icon: <DirectionsBusIcon />,
      title: 'Modern Fleet',
      description: 'Our fleet consists of modern, well-maintained buses equipped with the latest amenities for your comfort.'
    },
    {
      icon: <SecurityIcon />,
      title: 'Safe Travel',
      description: 'Safety is our top priority. All our buses undergo regular maintenance and safety checks.'
    },
    {
      icon: <SupportAgentIcon />,
      title: '24/7 Support',
      description: 'Our customer support team is available round the clock to assist you with any queries.'
    },
    {
      icon: <StarIcon />,
      title: 'Premium Service',
      description: 'Experience premium service with comfortable seating, air conditioning, and professional staff.'
    }
  ];

  return (
    <div className="about-page">
      <div className="about-hero">
        <Container maxWidth="lg">
          <Typography variant="h2" className="about-title">
            About Rwanda Bus
          </Typography>
          <Typography variant="h5" className="about-subtitle">
            Your Trusted Travel Partner Since 2010
          </Typography>
        </Container>
      </div>

      <Container maxWidth="lg">
        <Box className="about-content">
          <Typography variant="h4" className="section-title">
            Our Story
          </Typography>
          <Typography variant="body1" className="section-text">
            Rwanda Bus started with a vision to revolutionize public transportation in Rwanda. 
            Over the years, we've grown to become the country's leading bus service provider, 
            connecting cities and communities with safe, reliable, and comfortable transportation.
          </Typography>

          <Grid container spacing={4} className="features-grid">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card className="feature-card">
                  <CardContent>
                    <div className="feature-icon">{feature.icon}</div>
                    <Typography variant="h6" className="feature-title">
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" className="feature-description">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box className="mission-section">
            <Typography variant="h4" className="section-title">
              Our Mission
            </Typography>
            <Typography variant="body1" className="section-text">
              To provide safe, reliable, and comfortable transportation services while contributing 
              to Rwanda's development through sustainable mobility solutions.
            </Typography>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default About; 