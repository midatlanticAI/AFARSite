// @ts-nocheck
import { Outlet, NavLink } from 'react-router-dom';
import { Box, Drawer, List, ListItemButton, Toolbar, Typography } from '@mui/material';

const drawerWidth = 220;

export default function ProviderLayout() {
  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer variant="permanent" sx={{ width: drawerWidth, [`& .MuiDrawer-paper`]: { width: drawerWidth } }}>
        <Toolbar>
          <Typography variant="h6">SitePro</Typography>
        </Toolbar>
        <List>
          <ListItemButton component={NavLink} to="jobs">Jobs</ListItemButton>
          <ListItemButton component={NavLink} to="dispatch">Dispatch Board</ListItemButton>
          <ListItemButton component={NavLink} to="billing">Billing</ListItemButton>
          <ListItemButton component={NavLink} to="reports">Reports</ListItemButton>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
} 