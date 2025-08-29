// @ts-nocheck
import { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Stack } from '@mui/material';
import api from '@/services/api';

export default function ChatProPage() {
  const [chatId, setChatId] = useState('');
  const [user, setUser] = useState({ user_id:'u1', name:'', phone:'', email:'' });
  const [appliance, setAppliance] = useState({ type:'', failure:'' });
  const [jobId, setJobId] = useState('');
  const [note, setNote] = useState('');
  const [result, setResult] = useState<any>(null);

  const createFromChat = async ()=>{
    try {
      const payload:any = { chat_id: chatId || `chat-${Date.now()}`, user, appliance };
      const res = await api.post('/api/v1/chat/create_job_from_chat', payload);
      setResult(res.data);
      if (res.data?.job_id) setJobId(res.data.job_id);
    } catch {}
  };
  const appendChatNote = async ()=>{
    if (!jobId) return;
    try { const res = await api.post('/api/v1/chat/append_chat_note', { job_id: jobId, note, author:'ChatPro' }); setResult(res.data); } catch {}
  };
  const escalate = async ()=>{
    if (!jobId) return;
    try { const res = await api.post('/api/v1/chat/escalate', { job_id: jobId }); setResult(res.data); } catch {}
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>ChatPro</Typography>
      <Paper sx={{ p:2, mb:2 }}>
        <Typography variant="subtitle1" gutterBottom>Create Job From Chat</Typography>
        <Grid container spacing={1}>
          <Grid item xs={12} md={4}><TextField size="small" fullWidth label="Chat ID" value={chatId} onChange={(e)=>setChatId(e.target.value)} /></Grid>
          <Grid item xs={12} md={4}><TextField size="small" fullWidth label="User Name" value={user.name} onChange={(e)=>setUser({...user, name:e.target.value})} /></Grid>
          <Grid item xs={12} md={2}><TextField size="small" fullWidth label="Phone" value={user.phone} onChange={(e)=>setUser({...user, phone:e.target.value})} /></Grid>
          <Grid item xs={12} md={2}><TextField size="small" fullWidth label="Email" value={user.email} onChange={(e)=>setUser({...user, email:e.target.value})} /></Grid>
          <Grid item xs={12} md={3}><TextField size="small" fullWidth label="Appliance Type" value={appliance.type} onChange={(e)=>setAppliance({...appliance, type:e.target.value})} /></Grid>
          <Grid item xs={12} md={3}><TextField size="small" fullWidth label="Failure" value={appliance.failure} onChange={(e)=>setAppliance({...appliance, failure:e.target.value})} /></Grid>
          <Grid item xs={12}><Button variant="contained" onClick={createFromChat}>Create From Chat</Button></Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p:2 }}>
        <Typography variant="subtitle1" gutterBottom>Job Actions</Typography>
        <Stack direction={{ xs:'column', sm:'row' }} spacing={1}>
          <TextField size="small" label="Job ID" value={jobId} onChange={(e)=>setJobId(e.target.value)} sx={{ minWidth: 240 }} />
          <TextField size="small" label="Note" value={note} onChange={(e)=>setNote(e.target.value)} />
          <Button variant="outlined" onClick={appendChatNote}>Add Chat Note</Button>
          <Button variant="outlined" onClick={escalate}>Escalate</Button>
        </Stack>
      </Paper>
      <Paper sx={{ p:2, mt:2 }}>
        <Typography variant="subtitle2">Last Result</Typography>
        <pre style={{ whiteSpace:'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
      </Paper>
    </Box>
  );
}


