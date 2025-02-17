import React, { useState } from 'react';
import { Container, Typography, Paper, Grid, Button, Avatar } from '@mui/material';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user')); // Assuming user data is stored in localStorage
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || ''); // Default to user's picture

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Container maxWidth="md" sx={{ marginTop: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: 'primary.main' }}>
        Profile
      </Typography>
      <Paper elevation={3} sx={{ padding: 4, borderRadius: '8px', backgroundColor: 'rgba(44, 2, 2, 0.7)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sx={{ textAlign: 'center' }}>
            <Avatar
              src={profilePicture}
              alt="Profile Picture"
              sx={{ width: 100, height: 100, margin: '0 auto', border: '2px solid', borderColor: 'primary.main' }}
            />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="profile-picture-upload"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="profile-picture-upload">
              <Button variant="contained" component="span" sx={{ marginTop: 2, backgroundColor: 'primary.main', color: 'white' }}>
                Change Profile Picture
              </Button>
            </label>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ color: 'text.primary', margin: 1 }}>
              Name: {user.name}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ color: 'text.primary', margin: 1 }}>
              Email: {user.email}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ color: 'text.primary', margin: 1 }}>
              Role: {user.role}
            </Typography>
          </Grid>
        </Grid>
        <Button
          variant="contained"
          sx={{ marginTop: 2, backgroundColor: 'primary.main', color: 'white' }}
          onClick={() => alert('Edit Profile functionality to be implemented')}
        >
          Edit Profile
        </Button>
      </Paper>
    </Container>
  );
};

export default Profile; 