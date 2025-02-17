import React, { useState, useEffect, useRef } from 'react';
import Navigation from '../components/Navigation';
import { motion, AnimatePresence } from 'framer-motion';
import './Home.css';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Autocomplete,
  IconButton,
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import MapIcon from '@mui/icons-material/Map';
import SecurityIcon from '@mui/icons-material/Security';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PaymentsIcon from '@mui/icons-material/Payments';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import '../components/Testimonials.css';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const testimonialRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2071&auto=format&fit=crop',
      title: 'Travel Smarter, Book Faster',
      subtitle: 'Your journey begins with a simple booking'
    },
    {
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop',
      title: 'Explore Rwanda in Comfort',
      subtitle: 'Premium buses at your service'
    },
    {
      image: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?q=80&w=2072&auto=format&fit=crop',
      title: 'Safe and Reliable Travel',
      subtitle: 'Your safety is our priority'
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'alvin the chipmunks',
      role: 'Regular Traveler',
      image: './alvin.png',
      text: 'The best bus booking experience I\'ve ever had! The service is exceptional and the buses are always on time.',
      rating: 5
    },
    {
      id: 2,
      name: 'Angeline',
      role: 'Business Traveler',
      image: './ange.png',
      text: 'Incredibly reliable service. The online booking system is seamless and user-friendly.',
      rating: 5
    },
    {
      id: 3,
      name: 'Dox-P',
      role: 'Student',
      image: './doxp.jpg',
      text: 'As a student who travels frequently, this service has made my journeys so much easier and affordable.',
      rating: 5
    },
    {
      id: 4,
      name: 'Huguette',
      role: 'Tourist',
      image: './huguette.webp',
      text: 'Outstanding service! The buses are comfortable and the staff is very helpful.',
      rating: 5
    },

    {
      id: 5,
      name: 'Lionel',
      role: 'Tourist',
      image: './lionel.jpg',
      text: 'Outstanding service! The buses are comfortable and the staff is very helpful.',
      rating: 5
    }
  ];


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextTestimonial, 5000);
    return () => clearInterval(timer);
  }, []);

  const cities = [
    'Kigali', 'Butare', 'Gisenyi', 'Ruhengeri', 'Cyangugu', 'Kibuye'
  ];

  const features = [
    {
      icon: <DirectionsBusIcon />,
      title: 'Modern Fleet',
      description: 'Latest buses with premium comfort and amenities'
    },
    {
      icon: <SecurityIcon />,
      title: 'Safe Travel',
      description: 'Professional drivers and maintained vehicles'
    },
    {
      icon: <LocalOfferIcon />,
      title: 'Best Prices',
      description: 'Competitive rates and regular promotions'
    },
    {
      icon: <SupportAgentIcon />,
      title: '24/7 Support',
      description: 'Always here to help with your booking needs'
    }
  ];

  const popularRoutes = [
    {
      from: 'Kigali',
      to: 'Butare',
      price: '5000 RWF',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069'
    },
    {
      from: 'Kigali',
      to: 'Gisenyi',
      price: '7000 RWF',
      image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=2076&auto=format&fit=crop'
    },
    {
      from: 'Butare',
      to: 'Cyangugu',
      price: '6000 RWF',
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2071'
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <Box className="home">
      <Navigation />
      
      {/* Hero Slider Section */}
      <Box className="hero-slider" sx={{ height: "calc(100vh - 64px)" }}>
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentSlide}
            className="hero-slide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ backgroundImage: `url(${heroSlides[currentSlide].image})` }}
          >
            <Container maxWidth="lg" sx={{ padding: "30px 0 100px" }}>
              <motion.div
                className="hero-content"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                sx={{ 
                  padding: "40px",
                  borderRadius: "15px",
                  background: "rgba(0, 0, 0, 0.7)",
                  backdropFilter: "blur(10px)"
                }}
              >
                <Typography 
                  variant="h1" 
                  className="hero-title"
                  sx={{ 
                    marginBottom: "20px",
                    textAlign: "center",
                    width: "100%"
                  }}
                >
                  {heroSlides[currentSlide].title}
                </Typography>
                <Typography 
                  variant="h5" 
                  className="hero-subtitle"
                  sx={{ 
                    marginBottom: "30px",
                    textAlign: "center",
                    width: "100%"
                  }}
                >
                  {heroSlides[currentSlide].subtitle}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%"
                  }}
                >
                  <Button 
                    variant="contained" 
                    className="hero-button"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ padding: "40px 30px" }}
                  >
                    Book Now
                  </Button>
                </Box>
              </motion.div>
            </Container>
          </motion.div>
        </AnimatePresence>
        <div className="slider-dots">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`slider-dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </Box>

      {/* Search Section */}
      <Box className="search-section" sx={{ marginTop: "40px" }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="search-card">
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Autocomplete
                      options={cities}
                      renderInput={(params) => (
                        <TextField {...params} label="From" fullWidth />
                      )}
                      className="search-input"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Autocomplete
                      options={cities}
                      renderInput={(params) => (
                        <TextField {...params} label="To" fullWidth />
                      )}
                      className="search-input"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      type="date"
                      fullWidth
                      label="Travel Date"
                      InputLabelProps={{ shrink: true }}
                      className="search-input"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                      variant="contained"
                      fullWidth
                      className="search-button"
                      startIcon={<SearchIcon />}
                    >
                      Search Buses
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </Box>

      {/* Popular Routes Section */}
      <Box className="popular-routes-section">
        <Container maxWidth="lg">
          <Typography variant="h2" className="section-title">
            Popular Routes
          </Typography>
          <Grid container spacing={4}>
            {popularRoutes.map((route, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  className="route-card"
                  whileHover={{ y: -10 }}
                >
                  <div className="route-image" style={{ backgroundImage: `url(${route.image})` }}>
                    <div className="route-overlay">
                      <Typography variant="h6">{route.from} to {route.to}</Typography>
                      <Typography variant="subtitle1">From {route.price}</Typography>
                    </div>
                  </div>
                  <Button 
                    variant="contained" 
                    className="book-route-button"
                    endIcon={<ArrowForwardIcon />}
                  >
                    Book Now
                  </Button>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box className="testimonials-section">
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography variant="h2" className="section-title">
              What Our Customers Say
            </Typography>
            <Typography variant="h2" className="section-subtitle">
              Real experiences from our valued customers
            </Typography>
          </motion.div>

          <Box className="testimonials-slider">
            <IconButton 
              className="slider-arrow prev"
              onClick={prevTestimonial}
            >
              <ArrowBackIosIcon />
            </IconButton>

            <Box className="testimonials-container">
              <AnimatePresence mode='wait'>
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="testimonial-card"
                >
                  <div className="testimonial-content">
                    <div className="testimonial-quote">"</div>
                    <Typography className="testimonial-text">
                      {testimonials[currentTestimonial].text}
                    </Typography>
                    <div className="testimonial-rating">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, index) => (
                        <StarIcon key={index} className="star-icon" />
                      ))}
                    </div>
                  </div>
                  <div className="testimonial-author">
                    <img 
                      src={testimonials[currentTestimonial].image} 
                      alt={testimonials[currentTestimonial].name} 
                      className="testimonial-image"
                    />
                    <div className="author-info">
                      <Typography variant="h6" className="author-name">
                        {testimonials[currentTestimonial].name}
                      </Typography>
                      <Typography variant="subtitle2" className="author-role">
                        {testimonials[currentTestimonial].role}
                      </Typography>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </Box>

            <IconButton 
              className="slider-arrow next"
              onClick={nextTestimonial}
            >
              <ArrowForwardIosIcon />
            </IconButton>

            <div className="testimonial-dots">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box className="features-section">
        <Container maxWidth="lg">
          <Typography variant="h2" className="section-title">
            Why Choose Us
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  className="feature-card"
                  whileHover={{ y: -10 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="feature-icon">{feature.icon}</div>
                  <Typography variant="h6">{feature.title}</Typography>
                  <Typography>{feature.description}</Typography>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Statistics Section */}
      <Box className="stats-section">
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {[
              { number: '10K+', label: 'Happy Customers' },
              { number: '50+', label: 'Daily Routes' },
              { number: '100+', label: 'Modern Buses' },
              { number: '4.8', label: 'Customer Rating', icon: <StarIcon /> }
            ].map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  className="stat-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Typography variant="h3">{stat.number}</Typography>
                  <Typography variant="subtitle1">{stat.label}</Typography>
                  {stat.icon && <div className="stat-icon">{stat.icon}</div>}
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Download App Section */}
      <Box className="app-section">
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Typography variant="h2">Download Our App</Typography>
                <Typography variant="subtitle1">
                  Get the best booking experience with our mobile app
                </Typography>
                <Box className="app-buttons">
                  <Button variant="contained" className="app-store-button">
                    App Store
                  </Button>
                  <Button variant="contained" className="play-store-button">
                    Play Store
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.img
                src="/app-mockup.png"
                alt="Mobile App"
                className="app-mockup"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box className="footer">
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" className="footer-title">
                About Us
              </Typography>
              <Typography variant="body2">
                Rwanda Bus Booking is your trusted partner for comfortable and safe travel across Rwanda.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" className="footer-title">
                Quick Links
              </Typography>
              <ul className="footer-links">
                <li>About Us</li>
                <li>Contact</li>
                <li>Terms & Conditions</li>
                <li>Privacy Policy</li>
              </ul>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" className="footer-title">
                Contact Us
              </Typography>
              <Typography variant="body2">
                Email: cavakenneth58@gmail.com<br />
                Phone: +250 784 227 283<br />
                Address: Rubavu, Rwanda
              </Typography>
            </Grid>
          </Grid>
          <Box className="footer-bottom">
            <Typography variant="body2" align="center">
              © 2024 Rwanda Bus Booking. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
