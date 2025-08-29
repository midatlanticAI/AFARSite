// @ts-nocheck
import { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Divider, Stack, List, ListItem, ListItemText } from '@mui/material';
import api from '@/services/api';

export default function VoiceProPage() {
  const [jobId, setJobId] = useState('');
  const [customer, setCustomer] = useState({ name:'', first_name:'', last_name:'', phone:'', email:'', address:{ address1:'', city:'', state:'', zip_code:'' } });
  const [appliance, setAppliance] = useState({ type:'', failure:'' });
  const [timeWindow, setTimeWindow] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('scheduled');
  const [result, setResult] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const refreshMessages = async ()=>{
    try { const res = await api.get('/api/v1/voice/messages'); setMessages(res.data.items || []); } catch { setMessages([]); }
  };

  const createJob = async ()=>{
    try {
      const payload:any = { call_id:`voice-${Date.now()}`, customer, appliance, language:'en' };
      const res = await api.post('/api/v1/voice/create_job_from_voice', payload);
      setResult(res.data);
      if (res.data?.job_id) setJobId(res.data.job_id);
    } catch {}
  };

  const addNote = async ()=>{
    if (!jobId) return;
    try { const res = await api.post('/api/v1/voice/append_note', { job_id: jobId, note, author:'VoicePro' }); setResult(res.data); } catch {}
  };
  const schedule = async ()=>{
    if (!jobId) return;
    try { const res = await api.post('/api/v1/voice/schedule_tech', { job_id: jobId, time_window: timeWindow }); setResult(res.data); } catch {}
  };
  const updateStatus = async ()=>{
    if (!jobId) return;
    try { const res = await api.post('/api/v1/voice/update_job_status', { job_id: jobId, status }); setResult(res.data); } catch {}
  };
  const getDiagFee = async ()=>{
    try { const res = await api.get('/api/v1/voice/get_diagnostic_fee'); setResult(res.data); } catch {}
  };

  React.useEffect(()=>{ refreshMessages(); }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>VoicePro</Typography>
      <Paper sx={{ p:2, mb:2 }}>
        <Typography variant="subtitle1" gutterBottom>Create Job From Voice</Typography>
        <Grid container spacing={1}>
          <Grid item xs={12} md={6}><TextField size="small" fullWidth label="Customer Name" value={customer.name} onChange={(e)=>setCustomer({...customer, name:e.target.value})} /></Grid>
          <Grid item xs={12} md={3}><TextField size="small" fullWidth label="Phone" value={customer.phone} onChange={(e)=>setCustomer({...customer, phone:e.target.value})} /></Grid>
          <Grid item xs={12} md={3}><TextField size="small" fullWidth label="Email" value={customer.email} onChange={(e)=>setCustomer({...customer, email:e.target.value})} /></Grid>
          <Grid item xs={12} md={4}><TextField size="small" fullWidth label="Address 1" value={customer.address.address1} onChange={(e)=>setCustomer({...customer, address:{ ...customer.address, address1:e.target.value }})} /></Grid>
          <Grid item xs={12} md={2}><TextField size="small" fullWidth label="City" value={customer.address.city} onChange={(e)=>setCustomer({...customer, address:{ ...customer.address, city:e.target.value }})} /></Grid>
          <Grid item xs={6} md={2}><TextField size="small" fullWidth label="State" value={customer.address.state} onChange={(e)=>setCustomer({...customer, address:{ ...customer.address, state:e.target.value }})} /></Grid>
          <Grid item xs={6} md={2}><TextField size="small" fullWidth label="Zip" value={customer.address.zip_code} onChange={(e)=>setCustomer({...customer, address:{ ...customer.address, zip_code:e.target.value }})} /></Grid>
          <Grid item xs={12} md={3}><TextField size="small" fullWidth label="Appliance Type" value={appliance.type} onChange={(e)=>setAppliance({...appliance, type:e.target.value})} /></Grid>
          <Grid item xs={12} md={3}><TextField size="small" fullWidth label="Failure" value={appliance.failure} onChange={(e)=>setAppliance({...appliance, failure:e.target.value})} /></Grid>
          <Grid item xs={12}><Button variant="contained" onClick={createJob}>Create From Voice</Button></Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p:2, mb:2 }}>
        <Typography variant="subtitle1" gutterBottom>Job Actions</Typography>
        <Stack direction={{ xs:'column', sm:'row' }} spacing={1}>
          <TextField size="small" label="Job ID" value={jobId} onChange={(e)=>setJobId(e.target.value)} sx={{ minWidth: 240 }} />
          <TextField size="small" label="Note" value={note} onChange={(e)=>setNote(e.target.value)} />
          <Button variant="outlined" onClick={addNote}>Add Note</Button>
        </Stack>
        <Stack direction={{ xs:'column', sm:'row' }} spacing={1} sx={{ mt:1 }}>
          <TextField size="small" label="Time Window" value={timeWindow} onChange={(e)=>setTimeWindow(e.target.value)} />
          <Button variant="outlined" onClick={schedule}>Schedule</Button>
          <TextField size="small" label="Status" value={status} onChange={(e)=>setStatus(e.target.value)} />
          <Button variant="outlined" onClick={updateStatus}>Update Status</Button>
          <Button variant="text" onClick={getDiagFee}>Get Diagnostic Fee</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p:2 }}>
        <Typography variant="subtitle2">Last Result</Typography>
        <pre style={{ whiteSpace:'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
      </Paper>

      <Paper sx={{ p:2, mt:2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="subtitle1">Voice Messages</Typography><Button size="small" onClick={refreshMessages}>Refresh</Button></Stack>
        <List dense>{messages.map((m:any)=> (<ListItem key={m._id || m.id} divider><ListItemText primary={(m.From || m.from || 'Unknown') + ' • ' + (m.duration || '')} secondary={(m.transcription || '').slice(0,120)} /></ListItem>))}</List>
      </Paper>
    </Box>
  );
}


