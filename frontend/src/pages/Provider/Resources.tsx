// @ts-nocheck
import { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Paper, Button, Stack } from '@mui/material';
import api from '@/services/api';

function TabPanel({ children, value, index }: any) {
  return <div role="tabpanel" hidden={value !== index}>{value === index && <Box pt={2}>{children}</Box>}</div>;
}

export default function ResourcesPage() {
  const [value, setValue] = useState(0);
  const [readiness, setReadiness] = useState<any>(null);
  useEffect(()=>{ (async()=>{ try { const res = await api.get('/api/v1/status/readiness'); setReadiness(res.data); } catch { setReadiness({ ok:false }); } })(); }, []);
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Resources</Typography>
      <Tabs value={value} onChange={(_, v) => setValue(v)}>
        <Tab label="Tech Grid" />
        <Tab label="Unassigned" />
        <Tab label="Coverage" />
        <Tab label="Pro Tools" />
        <Tab label="System Status" />
      </Tabs>
      <TabPanel value={value} index={0}><Paper sx={{ p:2 }}>Grid of technicians with color-coded jobs…</Paper></TabPanel>
      <TabPanel value={value} index={1}><Paper sx={{ p:2 }}>Unassigned jobs bucket…</Paper></TabPanel>
      <TabPanel value={value} index={2}><Paper sx={{ p:2 }}>Coverage heatmap…</Paper></TabPanel>
      <TabPanel value={value} index={3}>
        <Paper sx={{ p:2 }}>
          <Typography variant="subtitle1" gutterBottom>BizPro Integrations</Typography>
          <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
            <Button variant="outlined" href="#/provider/voicepro">VoicePro</Button>
            <Button variant="outlined" href="#/provider/chatpro">ChatPro</Button>
            <Button variant="outlined" href="#/provider/socialpro">SocialPro</Button>
            <Button variant="outlined" href="#/provider/repairpro">RepairPro</Button>
          </Box>
        </Paper>
      </TabPanel>
      <TabPanel value={value} index={4}>
        <Paper sx={{ p:2 }}>
          <Typography variant="subtitle1" gutterBottom>System Readiness</Typography>
          <Stack direction="row" spacing={2} sx={{ mb:1 }}>
            <Button size="small" variant="outlined" onClick={async()=>{ try { const res = await api.get('/api/v1/status/readiness'); setReadiness(res.data); } catch {} }}>Refresh</Button>
            <Button size="small" variant="text" href="http://127.0.0.1:8001/voicepro/voicepro/logs" target="_blank">Open VoicePro</Button>
          </Stack>
          <pre style={{ whiteSpace:'pre-wrap', margin:0 }}>{JSON.stringify(readiness, null, 2)}</pre>
        </Paper>
      </TabPanel>
    </Box>
  );
}


