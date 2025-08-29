// @ts-nocheck
import { useEffect, useState } from 'react';
import { Typography, Box, Tabs, Tab, Paper, Grid, List, ListItem, ListItemText } from '@mui/material';
import api from '@/services/api';

function TabPanel({ children, value, index }: any) {
  return <div role="tabpanel" hidden={value !== index}>{value === index && <Box pt={2}>{children}</Box>}</div>;
}

export default function DispatchBoard() {
  const [value, setValue] = useState(0);
  const [unassigned, setUnassigned] = useState<any[]>([]);
  const [inProgress, setInProgress] = useState<any[]>([]);
  const [done, setDone] = useState<any[]>([]);
  const DEMO = ((import.meta as any).env?.VITE_DEMO ?? '1') === '1';

  useEffect(()=>{
    const run = async ()=>{
      if (DEMO) { setUnassigned([{ _id:'demo-1', title:'Alice' }]); setInProgress([{ _id:'demo-2', title:'Bob' }]); setDone([{ _id:'demo-3', title:'Carol' }]); return; }
      try { const res = await api.get('/api/v1/jobs/list', { params: { limit: 200 } }); const items = res.data.items || []; setUnassigned(items.filter((j:any)=> j.status==='created' || j.status==='unscheduled')); setInProgress(items.filter((j:any)=> j.status==='scheduled' || j.status==='in_progress')); setDone(items.filter((j:any)=> j.status==='completed')); } catch { setUnassigned([]); setInProgress([]); setDone([]); }
    };
    run();
  }, []);
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Dispatch Board</Typography>
      <Tabs value={value} onChange={(_, v) => setValue(v)}>
        <Tab label="Board" />
        <Tab label="Calendar" />
      </Tabs>
      <TabPanel value={value} index={0}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><Paper sx={{ p:2 }}><Typography variant="subtitle2">Unassigned</Typography><List dense>{unassigned.map((j)=> (<ListItem key={j._id} divider><ListItemText primary={j.customer_name || j.title} /></ListItem>))}</List></Paper></Grid>
          <Grid item xs={12} md={4}><Paper sx={{ p:2 }}><Typography variant="subtitle2">In Progress</Typography><List dense>{inProgress.map((j)=> (<ListItem key={j._id} divider><ListItemText primary={j.customer_name || j.title} /></ListItem>))}</List></Paper></Grid>
          <Grid item xs={12} md={4}><Paper sx={{ p:2 }}><Typography variant="subtitle2">Done</Typography><List dense>{done.map((j)=> (<ListItem key={j._id} divider><ListItemText primary={j.customer_name || j.title} /></ListItem>))}</List></Paper></Grid>
        </Grid>
      </TabPanel>
      <TabPanel value={value} index={1}><Paper sx={{ p:2 }}>Calendar timeline view…</Paper></TabPanel>
    </Box>
  );
}