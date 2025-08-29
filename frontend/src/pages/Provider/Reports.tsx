// @ts-nocheck
import { useEffect, useState } from 'react';
import { Typography, Box, Tabs, Tab, Paper, List, ListItem, ListItemText, MenuItem, TextField } from '@mui/material';
import api from '@/services/api';

function TabPanel({ children, value, index }: any) {
  return <div role="tabpanel" hidden={value !== index}>{value === index && <Box pt={2}>{children}</Box>}</div>;
}

export default function ReportsPage() {
  const [value, setValue] = useState(0);
  const [range, setRange] = useState('month_to_date');
  const [summary, setSummary] = useState<any>({});

  useEffect(()=>{
    const run = async()=>{
      const DEMO = ((import.meta as any).env?.VITE_DEMO ?? '1') === '1';
      if (DEMO) { setSummary({ jobsCompleted: '67', totalPayments: '$9,676.64' }); return; }
      try { const res = await api.get('/api/v1/reports/summary', { params: { range } }); setSummary(res.data || {}); } catch { setSummary({}); }
    };
    run();
  }, [range]);
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Reports</Typography>
      <Box sx={{ mb:1 }}>
        <TextField select size="small" label="Range" value={range} onChange={(e)=>setRange(e.target.value)} sx={{ width: 200 }}>
          <MenuItem value="today">Today</MenuItem>
          <MenuItem value="week_to_date">Week to date</MenuItem>
          <MenuItem value="month_to_date">Month to date</MenuItem>
          <MenuItem value="last_30">Last 30 days</MenuItem>
        </TextField>
      </Box>
      <Tabs value={value} onChange={(_, v) => setValue(v)}>
        <Tab label="Operations" />
        <Tab label="Financial" />
        <Tab label="Technician" />
        <Tab label="Marketing" />
      </Tabs>
      <TabPanel value={value} index={0}><Paper sx={{ p:2 }}>
        <List dense>
          <ListItem><ListItemText primary="Jobs Completed" secondary={summary.jobsCompleted || '—'} /></ListItem>
          <ListItem><ListItemText primary="Scheduled Count" secondary={summary.scheduledCount || '—'} /></ListItem>
        </List>
      </Paper></TabPanel>
      <TabPanel value={value} index={1}><Paper sx={{ p:2 }}>
        <List dense>
          <ListItem><ListItemText primary="Total Payments" secondary={summary.totalPayments || '—'} /></ListItem>
          <ListItem><ListItemText primary="AR Total" secondary={summary.arTotal || '—'} /></ListItem>
        </List>
      </Paper></TabPanel>
      <TabPanel value={value} index={2}><Paper sx={{ p:2 }}>Utilization, first-time fix…</Paper></TabPanel>
      <TabPanel value={value} index={3}><Paper sx={{ p:2 }}>Lead sources, CAC, ROAS…</Paper></TabPanel>
    </Box>
  );
}