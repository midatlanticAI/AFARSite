// @ts-nocheck
import { Box, Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [token, setToken] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();

  const handleSubmit = () => {
    const fallback = token ||
      // dev token: role admin
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'+
      'eyJzdWIiOiJkZXYtdXNlciIsInJvbGUiOiJhZG1pbiJ9.'+
      'devtokenplaceholder';
    login(fallback);
    nav('/provider');
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={10} gap={2}>
      <Typography variant="h6">Enter JWT (dev stub)</Typography>
      <TextField value={token} onChange={(e) => setToken(e.target.value)} fullWidth sx={{ maxWidth: 400 }} />
      <Button variant="contained" onClick={handleSubmit}>Login</Button>
    </Box>
  );
} 