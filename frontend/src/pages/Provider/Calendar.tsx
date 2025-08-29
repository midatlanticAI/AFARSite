// @ts-nocheck
import { useEffect, useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper, List, ListItem, ListItemText } from '@mui/material';
import api from '@/services/api';

function TabPanel({ children, value, index }: any) {
  return <div role="tabpanel" hidden={value !== index}>{value === index && <Box pt={2}>{children}</Box>}</div>;
}

export default function CalendarPage() {
  const [value, setValue] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const DEMO = ((import.meta as any).env?.VITE_DEMO ?? '1') === '1';

  useEffect(()=>{
    const run = async ()=>{
      if (DEMO) { setItems([{ _id:'demo-1', title:'Johnson, Alice', date:'Today', window:'10-12' }]); return; }
      try { const res = await api.get('/api/v1/jobs/list', { params: { limit: 200 } }); setItems(res.data.items || []); } catch { setItems([]); }
    };
    run();
  }, []);
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Calendar</Typography>
      <Tabs value={value} onChange={(_, v) => setValue(v)}>
        <Tab label="Day" />
        <Tab label="Week" />
        <Tab label="Month" />
      </Tabs>
      <TabPanel value={value} index={0}><Paper sx={{ p:2 }}><List dense>{items.map((e)=> (<ListItem key={e._id} divider><ListItemText primary={e.customer_name || e.title} secondary={e.window || e.status} /></ListItem>))}</List></Paper></TabPanel>
      <TabPanel value={value} index={1}><Paper sx={{ p:2 }}><List dense>{items.map((e)=> (<ListItem key={e._id} divider><ListItemText primary={e.customer_name || e.title} secondary={e.window || e.status} /></ListItem>))}</List></Paper></TabPanel>
      <TabPanel value={value} index={2}><Paper sx={{ p:2 }}><List dense>{items.map((e)=> (<ListItem key={e._id} divider><ListItemText primary={e.customer_name || e.title} secondary={e.window || e.status} /></ListItem>))}</List></Paper></TabPanel>
    </Box>
  );
}


