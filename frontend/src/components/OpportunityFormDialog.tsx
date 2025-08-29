// @ts-nocheck
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useEffect, useState } from 'react';
import api from '@/services/api';

export default function OpportunityFormDialog({ open, onClose, initial, onSaved }: { open: boolean; onClose: () => void; initial?: any; onSaved: (opp: any) => void }) {
  const [title, setTitle] = useState('');
  const [search, setSearch] = useState('');
  const [matches, setMatches] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [stage, setStage] = useState('new');
  const [value, setValue] = useState('');
  const DEMO = ((import.meta as any).env?.VITE_DEMO ?? '1') === '1';

  useEffect(() => {
    if (!open) return;
    const o = initial || {};
    setTitle(o.title || '');
    setStage(o.status || 'new');
    setValue(o.value || '');
    setCustomerId(o.customer_id || '');
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const run = async () => {
      if (DEMO) { setMatches([{ _id:'contact-001', name:'Johnson, Alice' }, { _id:'contact-002', name:'Smith, Bob' }]); return; }
      try {
        const res = await api.get('/api/v1/contacts/list', { params: { q: search, limit: 20 } });
        setMatches(res.data.items || []);
      } catch { setMatches([]); }
    };
    run();
  }, [open, search]);

  const save = () => {
    const payload: any = { _id: initial?._id, title, status: stage, value };
    if (customerId) payload.customer_id = customerId;
    onSaved(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial?._id ? 'Edit Opportunity' : 'New Opportunity'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12}><TextField fullWidth size="small" label="Title" value={title} onChange={e=>setTitle(e.target.value)} /></Grid>
          <Grid item xs={12}><TextField fullWidth size="small" label="Find contact" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, email, or phone" /></Grid>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Contact</InputLabel>
              <Select label="Contact" value={customerId} onChange={e=>setCustomerId(String(e.target.value))}>
                {matches.map((m)=> (<MenuItem key={m._id} value={m._id}>{m.name || `${m.last_name || ''}, ${m.first_name || ''}`}</MenuItem>))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Stage</InputLabel>
              <Select label="Stage" value={stage} onChange={e=>setStage(e.target.value)}>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="unscheduled">Unscheduled</MenuItem>
                <MenuItem value="estimate_scheduled">Estimate Scheduled</MenuItem>
                <MenuItem value="estimate_sent">Estimate Sent</MenuItem>
                <MenuItem value="estimate_viewed">Estimate Viewed</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Value" value={value} onChange={e=>setValue(e.target.value)} /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={save}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}


