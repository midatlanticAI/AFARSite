import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KitchenIcon from '@mui/icons-material/Kitchen';
import HistoryIcon from '@mui/icons-material/History';
import { styled } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const VerticalAppBar = styled(AppBar)<{ bgcolor?: string }>(({ theme, bgcolor }) => ({
  width: '60px',
  right: 0,
  left: 'auto',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingTop: theme.spacing(2),
  backgroundColor: bgcolor || theme.palette.background.paper,
}));

interface MyApplianceNavigationProps {
  variant?: 'standard' | 'futuristic';
  backgroundColor?: string;
  color?: string;
}

const MyApplianceNavigation: React.FC<MyApplianceNavigationProps> = ({ 
  variant = 'standard', 
  backgroundColor, 
  color 
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/myappliance' },
    { text: 'Futuristic', icon: <HomeIcon />, path: '/myappliance-futuristic' },
    { text: 'Corporate', icon: <BusinessIcon />, path: '/myappliance-corporate' },
    { text: 'Profile', icon: <AccountCircleIcon />, path: '/profile' },
    { text: 'My Appliances', icon: <KitchenIcon />, path: '/profile/appliances' },
    { text: 'Service History', icon: <HistoryIcon />, path: '/myappliance-history' },
  ];

  if (variant === 'futuristic') {
    return (
      <>
        <VerticalAppBar 
          position="fixed" 
          bgcolor={backgroundColor}
        >
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ mb: 2, color: color }}
          >
            <MenuIcon />
          </IconButton>
          {navigationItems.map((item, index) => (
            <IconButton
              key={index}
              color="inherit"
              onClick={() => navigate(item.path)}
              sx={{ mb: 2, color: color }}
            >
              {item.icon}
            </IconButton>
          ))}
        </VerticalAppBar>
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: {
              bgcolor: backgroundColor,
              color: color,
            }
          }}
        >
          <Box sx={{ width: 250 }} role="presentation">
            <List>
              {navigationItems.map((item, index) => (
                <ListItem button key={index} onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}>
                  <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      </>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MyAppliance Hub
          </Typography>
          {navigationItems.map((item) => (
            <Button key={item.text} color="inherit" component={RouterLink} to={item.path}>
              {item.text}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {navigationItems.map((item, index) => (
              <ListItem button key={index} onClick={() => {
                navigate(item.path);
                setDrawerOpen(false);
              }}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default MyApplianceNavigation;


