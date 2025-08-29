// @ts-nocheck
import { useEffect, useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper, List, ListItem, ListItemText } from '@mui/material';
import api from '@/services/api';

function TabPanel({ children, value, index }: any) {
  return <div role="tabpanel" hidden={value !== index}>{value === index && <Box pt={2}>{children}</Box>}</div>;
}

export default function SchedulePage() {
  const [value, setValue] = useState(0);
  const [today, setToday] = useState<any[]>([]);
  const [overdue, setOverdue] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const DEMO = ((import.meta as any).env?.VITE_DEMO ?? '1') === '1';

  useEffect(()=>{
    const run = async ()=>{
      if (DEMO) {
        setToday([{ _id:'demo-1', title:'Johnson, Alice', window:'10-12' }]);
        setUpcoming([{ _id:'demo-2', title:'Smith, Bob', window:'1-3' }]);
        setCompleted([{ _id:'demo-3', title:'Davis, Carol', window:'9-11' }]);
        return;
      }
      try { const res = await api.get('/api/v1/jobs/list', { params: { limit: 200 } }); const items = res.data.items || []; setToday(items.filter((j:any)=> j.status==='scheduled')); setCompleted(items.filter((j:any)=> j.status==='completed')); setUpcoming(items.filter((j:any)=> j.status==='created' || j.status==='unscheduled')); setOverdue([]); } catch { setToday([]); setUpcoming([]); setCompleted([]); setOverdue([]); }
    };
    run();
  }, []);
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Schedule</Typography>
      <Tabs value={value} onChange={(_, v) => setValue(v)}>
        <Tab label="Today" />
        <Tab label="Overdue" />
        <Tab label="Upcoming" />
        <Tab label="Completed" />
      </Tabs>
      <TabPanel value={value} index={0}><Paper sx={{ p:2 }}><List dense>{today.map((e)=> (<ListItem key={e._id} divider><ListItemText primary={e.customer_name || e.title} secondary={e.window || ''} /></ListItem>))}</List></Paper></TabPanel>
      <TabPanel value={value} index={1}><Paper sx={{ p:2 }}><List dense>{overdue.map((e)=> (<ListItem key={e._id} divider><ListItemText primary={e.customer_name || e.title} /></ListItem>))}</List></Paper></TabPanel>
      <TabPanel value={value} index={2}><Paper sx={{ p:2 }}><List dense>{upcoming.map((e)=> (<ListItem key={e._id} divider><ListItemText primary={e.customer_name || e.title} /></ListItem>))}</List></Paper></TabPanel>
      <TabPanel value={value} index={3}><Paper sx={{ p:2 }}><List dense>{completed.map((e)=> (<ListItem key={e._id} divider><ListItemText primary={e.customer_name || e.title} /></ListItem>))}</List></Paper></TabPanel>
    </Box>
  );
}


