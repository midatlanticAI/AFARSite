// @ts-nocheck
import { Outlet, NavLink } from 'react-router-dom';
import { Box, Drawer, List, ListItemButton, Toolbar, Typography, Button, Stack, Divider, Menu, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContactFormDialog from '@/components/ContactFormDialog';
import JobQuickCreateDialog from '@/components/JobQuickCreateDialog';
import OpportunityFormDialog from '@/components/OpportunityFormDialog';
import api from '@/services/api';
import { useState } from 'react';

const drawerWidth = 220;

export default function ProviderLayout() {
  const [openContact, setOpenContact] = useState(false);
  const [openJob, setOpenJob] = useState(false);
  const [openOpp, setOpenOpp] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const handleMenuOpen = (e: any) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer variant="permanent" sx={{ width: drawerWidth, [`& .MuiDrawer-paper`]: { width: drawerWidth } }}>
        <Toolbar>
          <Typography variant="h6">SitePro</Typography>
        </Toolbar>
        <Stack direction="column" spacing={1} sx={{ p: 2, pt: 0 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onMouseEnter={handleMenuOpen}
            onClick={handleMenuOpen}
            aria-haspopup
            aria-controls={menuOpen ? 'quick-add-menu' : undefined}
            aria-expanded={menuOpen ? 'true' : undefined}
          >
            Add New
          </Button>
          <Menu
            id="quick-add-menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            MenuListProps={{ onMouseLeave: handleMenuClose }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <MenuItem onClick={()=>{ handleMenuClose(); setOpenOpp(true); }}>Opportunity</MenuItem>
            <MenuItem onClick={()=>{ handleMenuClose(); setOpenJob(true); }}>Job</MenuItem>
            <MenuItem onClick={()=>{ handleMenuClose(); setOpenContact(true); }}>Customer</MenuItem>
          </Menu>
        </Stack>
        <Divider sx={{ my: 1 }} />
        <List>
          <ListItemButton component={NavLink} to="dashboard">Dashboard</ListItemButton>
          <ListItemButton component={NavLink} to="contacts">Contacts</ListItemButton>
          <ListItemButton component={NavLink} to="jobs">Jobs</ListItemButton>
          <ListItemButton component={NavLink} to="dispatch">Dispatch Board</ListItemButton>
          <ListItemButton component={NavLink} to="schedule">Schedule</ListItemButton>
          <ListItemButton component={NavLink} to="calendar">Calendar</ListItemButton>
          <ListItemButton component={NavLink} to="resources">Resources</ListItemButton>
          <ListItemButton component={NavLink} to="billing">Billing</ListItemButton>
          <ListItemButton component={NavLink} to="reports">Reports</ListItemButton>
          <Divider sx={{ my:1 }} />
          <ListItemButton component={NavLink} to="voicepro">VoicePro</ListItemButton>
          <ListItemButton component={NavLink} to="chatpro">ChatPro</ListItemButton>
          <ListItemButton component={NavLink} to="socialpro">SocialPro</ListItemButton>
          <ListItemButton component={NavLink} to="repairpro">RepairPro</ListItemButton>
          <ListItemButton component="a" href="http://127.0.0.1:8001/voicepro/voicepro/logs" target="_blank" rel="noopener noreferrer">VoicePro Dashboard (Deployed)</ListItemButton>
        </List>
        <ContactFormDialog open={openContact} onClose={()=>setOpenContact(false)} onSaved={async (payload)=>{ await api.post('/api/v1/contacts/upsert', payload); setOpenContact(false); }} />
        <JobQuickCreateDialog open={openJob} onClose={()=>setOpenJob(false)} onCreated={()=> setOpenJob(false)} />
        <OpportunityFormDialog open={openOpp} onClose={()=>setOpenOpp(false)} onSaved={async (_)=> setOpenOpp(false)} />
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
} 