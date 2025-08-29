// @ts-nocheck
import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField, Button, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import api from '@/services/api';

export default function JobQuickCreateDialog({ open, onClose, onCreated }: { open: boolean; onClose: ()=>void; onCreated: ()=>void }) {
  const [customerId, setCustomerId] = useState('');
  const [search, setSearch] = useState('');
  const [matches, setMatches] = useState<any[]>([]);
  const [applianceType, setApplianceType] = useState('');
  const [failure, setFailure] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const DEMO = ((import.meta as any).env?.VITE_DEMO ?? '1') === '1';

  useEffect(()=>{
    if (!open) return;
    const run = async ()=>{
      if (DEMO) { setMatches([{ _id:'contact-001', name:'Johnson, Alice' }, { _id:'contact-002', name:'Smith, Bob' }]); return; }
      try {
        const res = await api.get('/api/v1/contacts/list', { params: { q: search, limit: 20 } });
        setMatches(res.data.items || []);
      } catch { setMatches([]); }
    };
    run();
  }, [open, search]);

  const createJob = async () => {
    const payload: any = {
      customer_id: customerId,
      appliance: { type: applianceType || undefined, failure: failure || undefined },
      email: email || undefined,
      phone: phone || undefined,
      status: 'created',
    };
    if (DEMO) { onClose(); onCreated(); return; }
    try { await api.post('/api/v1/jobs/create', payload); onCreated(); onClose(); } catch {}
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Job</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}><TextField size="small" fullWidth label="Find contact" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, email, or phone" /></Grid>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Contact</InputLabel>
              <Select label="Contact" value={customerId} onChange={e=>setCustomerId(String(e.target.value))}>
                {matches.map((m)=> (<MenuItem key={m._id} value={m._id}>{m.name || `${m.last_name || ''}, ${m.first_name || ''}`}</MenuItem>))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}><TextField size="small" label="Appliance Type" fullWidth value={applianceType} onChange={e=>setApplianceType(e.target.value)} /></Grid>
          <Grid item xs={12} md={6}><TextField size="small" label="Failure" fullWidth value={failure} onChange={e=>setFailure(e.target.value)} /></Grid>
          <Grid item xs={12} md={6}><TextField size="small" label="Email (optional)" fullWidth value={email} onChange={e=>setEmail(e.target.value)} /></Grid>
          <Grid item xs={12} md={6}><TextField size="small" label="Phone (optional)" fullWidth value={phone} onChange={e=>setPhone(e.target.value)} /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={createJob} disabled={!customerId}>Create</Button>
      </DialogActions>
    </Dialog>
  );
}


