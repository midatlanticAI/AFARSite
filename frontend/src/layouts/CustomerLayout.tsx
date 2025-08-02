// @ts-nocheck
import { AppBar, Toolbar, Typography, Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

export default function CustomerLayout() {
  return (
    <Box>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>MyAppliance</Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
} 