import React from 'react';
import { Container, Typography, Grid, Card, CardMedia, CardContent, Button } from '@mui/material';
import './Routes.css';

const RoutesPage = () => {
  const popularRoutes = [
    {
      id: 1,
      from: 'Kigali',
      to: 'Musanze',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop',
      price: '$15'
    },
    {
      id: 2,
      from: 'Kigali',
      to: 'Butare',
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2071&auto=format&fit=crop',
      price: '$12'
    },
    {
      id: 3,
      from: 'Kigali',
      to: 'Gisenyi',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop',
      price: '$18'
    }
  ];

  return (
    <div className="routes-page">
      <Container maxWidth="lg">
        <Typography variant="h2" className="page-title">
          Popular Routes
        </Typography>
        <Grid container spacing={4}>
          {popularRoutes.map((route) => (
            <Grid item xs={12} sm={6} md={4} key={route.id}>
              <Card className="route-card">
                <CardMedia
                  component="img"
                  height="200"
                  image={route.image}
                  alt={`${route.from} to ${route.to}`}
                />
                <CardContent>
                  <Typography variant="h5" className="route-title">
                    {route.from} → {route.to}
                  </Typography>
                  <Typography variant="h6" className="route-price">
                    From {route.price}
                  </Typography>
                  <Button variant="contained" className="book-route-btn">
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
};

export default RoutesPage; 