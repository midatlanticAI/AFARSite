import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import WashIcon from '@mui/icons-material/LocalLaundryService';
import DishwasherIcon from '@mui/icons-material/Kitchen';
import MicrowaveIcon from '@mui/icons-material/Microwave';
import MyApplianceNavigation from '@/components/MyApplianceNavigation';

const themes = {
  neonCity: {
    name: 'Neon City',
    light: { primary: '#00ff00', secondary: '#ff00ff', background: '#f0f0f0', paper: '#ffffff', text: '#000000' },
    dark: { primary: '#00ff00', secondary: '#ff00ff', background: '#121212', paper: '#1e1e1e', text: '#ffffff' },
  },
};

export default function MyApplianceHome() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [currentTheme, setCurrentTheme] = useState('neonCity');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: string; message: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const theme = useTheme();

  const muiTheme = {
    palette: {
      mode,
      primary: { main: themes[currentTheme as keyof typeof themes][mode].primary },
      secondary: { main: themes[currentTheme as keyof typeof themes][mode].secondary },
      background: {
        default: themes[currentTheme as keyof typeof themes][mode].background,
        paper: themes[currentTheme as keyof typeof themes][mode].paper,
      },
      text: { primary: themes[currentTheme as keyof typeof themes][mode].text },
    },
  } as any;

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      setChatMessages([...chatMessages, { sender: 'User', message: currentMessage }]);
      setCurrentMessage('');
      setTimeout(() => {
        setChatMessages(prev => [...prev, { sender: 'Max', message: "I'm Max, your AI assistant. How can I help you today?" }]);
      }, 800);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: muiTheme.palette.background.default, color: muiTheme.palette.text.primary }}>
      <MyApplianceNavigation />
      <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            Welcome to Your MyAppliance Hub
          </Typography>
          <Box>
            <FormControlLabel
              control={<Switch checked={mode === 'dark'} onChange={() => setMode(mode === 'light' ? 'dark' : 'light')} icon={<Brightness7Icon />} checkedIcon={<Brightness4Icon />} />}
              label={mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
            />
            <Select value={currentTheme} onChange={(e) => setCurrentTheme(e.target.value)} sx={{ ml: 2, minWidth: 140 }}>
              <MenuItem value="neonCity">Neon City</MenuItem>
            </Select>
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', mb: 3, fontWeight: 600 }}>My Appliances</Typography>
              <Grid container spacing={3}>
                {['Refrigerator', 'Washer', 'Oven', 'Dishwasher', 'Microwave', 'Dryer'].map((appliance) => (
                  <Grid item xs={6} sm={4} key={appliance}>
                    <Box sx={{ textAlign: 'center' }}>
                      {appliance === 'Refrigerator' ? <AcUnitIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        : appliance === 'Washer' || appliance === 'Dryer' ? <WashIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        : appliance === 'Oven' ? <WhatshotIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        : appliance === 'Dishwasher' ? <DishwasherIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        : <MicrowaveIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
                      <Typography variant="subtitle1" sx={{ mt: 1 }}>{appliance}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', mb: 2, fontWeight: 600 }}>Quick Actions</Typography>
              <Button fullWidth variant="contained" color="primary" sx={{ mb: 2 }}>Request Service</Button>
              <Button fullWidth variant="outlined" color="primary" sx={{ mb: 2 }}>Schedule Maintenance</Button>
              <Button fullWidth variant="outlined" color="primary">View Service History</Button>
            </Paper>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', mb: 2, fontWeight: 600 }}>Smart Assistant</Typography>
              <Button fullWidth variant="contained" color="secondary" onClick={() => setChatOpen(true)}>Chat with Max</Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Fab color="secondary" aria-label="chat" sx={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => setChatOpen(true)}>
        <ChatIcon />
      </Fab>

      <Dialog open={chatOpen} onClose={() => setChatOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Chat with Max (AI Assistant)</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 300, overflowY: 'auto', mb: 2, mt: 2 }}>
            {chatMessages.map((msg, index) => (
              <Box key={index} sx={{ mb: 1, textAlign: msg.sender === 'User' ? 'right' : 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: msg.sender === 'User' ? 'primary.main' : 'secondary.main' }}>{msg.sender}:</Typography>
                <Typography variant="body1">{msg.message}</Typography>
              </Box>
            ))}
          </Box>
          <TextField fullWidth variant="outlined" placeholder="Type your message here..." value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChatOpen(false)}>Close</Button>
          <Button onClick={handleSendMessage} variant="contained" color="primary">Send</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


