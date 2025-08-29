import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Paper, Grid, TextField, Button, Snackbar, Alert } from '@mui/material';
import MyApplianceNavigation from '@/components/MyApplianceNavigation';
import users from '@/services/demoStore';

export default function MyApplianceProfile() {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{open:boolean; message:string; severity:'success'|'error'}>({open:false,message:'',severity:'success'});
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', address: '',
  });

  useEffect(() => {
    const u = users[0];
    setProfile({
      name: `${u.first_name} ${u.last_name}`,
      email: u.email,
      phone: u.phone_number || '',
      address: `${u.address.street}, ${u.address.city}, ${u.address.state} ${u.address.zip}`,
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSnackbar({ open: true, message: 'Profile updated (demo)', severity: 'success' });
    }, 400);
  };

  return (
    <>
      <MyApplianceNavigation />
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            MyAppliance Profile
          </Typography>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Name" name="name" value={profile.name} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email" name="email" value={profile.email} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Phone" name="phone" value={profile.phone} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Address" name="address" value={profile.address} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" disabled={loading}> {loading ? 'Saving...' : 'Save'} </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({...s, open:false}))}>
          <Alert onClose={() => setSnackbar(s => ({...s, open:false}))} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}


