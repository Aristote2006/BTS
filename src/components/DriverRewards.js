import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondary,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  EmojiEvents,
  Stars,
  LocalActivity,
  Whatshot,
  Timeline,
  WorkspacePremium,
} from '@mui/icons-material';

const DriverRewards = () => {
  const [rewards, setRewards] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [rewardHistory, setRewardHistory] = useState([]);

  useEffect(() => {
    fetchRewardsData();
  }, []);

  const fetchRewardsData = async () => {
    try {
      const [rewardsRes, leaderboardRes] = await Promise.all([
        fetch('/api/drivers/rewards'),
        fetch('/api/drivers/leaderboard')
      ]);
      const rewardsData = await rewardsRes.json();
      const leaderboardData = await leaderboardRes.json();
      
      setRewards(rewardsData.data);
      setLeaderboard(leaderboardData.data);
    } catch (error) {
      console.error('Error fetching rewards data:', error);
    }
  };

  const handleDriverSelect = async (driverId) => {
    try {
      const response = await fetch(`/api/drivers/${driverId}/rewards/history`);
      const data = await response.json();
      setRewardHistory(data.data);
      setSelectedDriver(driverId);
    } catch (error) {
      console.error('Error fetching reward history:', error);
    }
  };

  const DriverCard = ({ driver }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            {driver.name[0]}
          </Avatar>
          <Box>
            <Typography variant="h6">{driver.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              Points: {driver.points}
            </Typography>
          </Box>
        </Box>
        <Box mb={2}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Progress to Next Reward
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(driver.points % 100) * 100 / 100}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Chip
              icon={<Stars />}
              label={`Level ${Math.floor(driver.points / 100) + 1}`}
              color="primary"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={6}>
            <Chip
              icon={<LocalActivity />}
              label={`${driver.achievements} Achievements`}
              color="secondary"
              variant="outlined"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const LeaderboardSection = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Top Performers
        </Typography>
        <List>
          {leaderboard.map((driver, index) => (
            <ListItem
              key={driver._id}
              button
              onClick={() => handleDriverSelect(driver._id)}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: index < 3 ? 'warning.main' : 'grey.400' }}>
                  {index + 1}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={driver.name}
                secondary={`${driver.points} Points`}
              />
              <Box display="flex" alignItems="center">
                {index < 3 && <Whatshot color="warning" />}
                <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                  {driver.streak} Day Streak
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const RewardHistoryDialog = () => (
    <Dialog
      open={!!selectedDriver}
      onClose={() => setSelectedDriver(null)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Reward History</DialogTitle>
      <DialogContent>
        <List>
          {rewardHistory.map((reward) => (
            <ListItem key={reward._id}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: reward.type === 'achievement' ? 'success.main' : 'primary.main' }}>
                  {reward.type === 'achievement' ? <WorkspacePremium /> : <Stars />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={reward.title}
                secondary={
                  <>
                    <Typography variant="body2" color="textSecondary">
                      {reward.description}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(reward.date).toLocaleDateString()}
                    </Typography>
                  </>
                }
              />
              <Chip
                label={`+${reward.points} Points`}
                color="primary"
                size="small"
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSelectedDriver(null)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Driver Rewards Program
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {rewards.map((driver) => (
              <Grid item xs={12} sm={6} key={driver._id}>
                <DriverCard driver={driver} />
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={12} md={4}>
          <LeaderboardSection />
        </Grid>
      </Grid>
      <RewardHistoryDialog />
    </Box>
  );
};

export default DriverRewards; 