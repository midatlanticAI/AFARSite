// @ts-nocheck
import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Chip, Stack } from '@mui/material';
import api from '@/services/api';

export default function SocialProPage() {
  const [templateId, setTemplateId] = useState('welcome');
  const [variables, setVariables] = useState('{}');
  const [channels, setChannels] = useState('facebook,twitter');
  const [postId, setPostId] = useState('');
  const [queued, setQueued] = useState<number>(0);
  const [result, setResult] = useState<any>(null);

  const generate = async ()=>{
    try {
      const payload:any = { template_id: templateId, variables: JSON.parse(variables || '{}'), channels: channels.split(',').map(s=>s.trim()).filter(Boolean) };
      const res = await api.post('/api/v1/social/generate_post', payload);
      setResult(res.data);
      if (res.data?.post_id) setPostId(res.data.post_id);
    } catch {}
  };
  const publish = async ()=>{
    try { const res = await api.post('/api/v1/social/publish_post', { post_id: postId }); setResult(res.data); } catch {}
  };
  const refreshQueue = async ()=>{
    try { const res = await api.get('/api/v1/social/queue_status'); setQueued(res.data?.queued || 0); } catch { setQueued(0); }
  };

  useEffect(()=>{ refreshQueue(); }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>SocialPro</Typography>
      <Paper sx={{ p:2, mb:2 }}>
        <Grid container spacing={1}>
          <Grid item xs={12} md={4}><TextField size="small" fullWidth label="Template ID" value={templateId} onChange={(e)=>setTemplateId(e.target.value)} /></Grid>
          <Grid item xs={12} md={4}><TextField size="small" fullWidth label="Variables (JSON)" value={variables} onChange={(e)=>setVariables(e.target.value)} /></Grid>
          <Grid item xs={12} md={4}><TextField size="small" fullWidth label="Channels (csv)" value={channels} onChange={(e)=>setChannels(e.target.value)} /></Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={generate}>Generate</Button>
              <TextField size="small" label="Post ID" value={postId} onChange={(e)=>setPostId(e.target.value)} />
              <Button variant="outlined" onClick={publish} disabled={!postId}>Publish</Button>
              <Button variant="text" onClick={refreshQueue}>Queue Status</Button>
              <Chip label={`Queued ${queued}`} size="small" />
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p:2 }}>
        <Typography variant="subtitle2">Last Result</Typography>
        <pre style={{ whiteSpace:'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
      </Paper>
    </Box>
  );
}


