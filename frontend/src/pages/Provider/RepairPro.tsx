// @ts-nocheck
import { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button } from '@mui/material';
import api from '@/services/api';

export default function RepairProPage() {
  const [jobId, setJobId] = useState('');
  const [appliance, setAppliance] = useState({ symptom:'' });
  const [result, setResult] = useState<any>(null);

  const triage = async ()=>{
    try { const res = await api.post('/api/v1/repair/triage_suggest', { appliance }); setResult(res.data); } catch {}
  };
  const dispatchSuggest = async ()=>{
    try { const res = await api.post('/api/v1/repair/dispatch_suggest', { job_id: jobId }); setResult(res.data); } catch {}
  };
  const parts = async ()=>{
    try { const res = await api.get('/api/v1/repair/parts_forecast', { params: { job_id: jobId } }); setResult(res.data); } catch {}
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>RepairPro</Typography>
      <Paper sx={{ p:2 }}>
        <Grid container spacing={1}>
          <Grid item xs={12} md={4}><TextField size="small" fullWidth label="Symptom" value={appliance.symptom} onChange={(e)=>setAppliance({ symptom:e.target.value })} /></Grid>
          <Grid item xs={12} md={2}><Button variant="contained" onClick={triage}>Triage Suggest</Button></Grid>
          <Grid item xs={12} md={3}><TextField size="small" fullWidth label="Job ID" value={jobId} onChange={(e)=>setJobId(e.target.value)} /></Grid>
          <Grid item xs={12} md={3}><Button variant="outlined" onClick={dispatchSuggest}>Dispatch Suggest</Button></Grid>
          <Grid item xs={12} md={3}><Button variant="outlined" onClick={parts}>Parts Forecast</Button></Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p:2, mt:2 }}>
        <Typography variant="subtitle2">Last Result</Typography>
        <pre style={{ whiteSpace:'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
      </Paper>
    </Box>
  );
}


