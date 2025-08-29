// @ts-nocheck
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Tabs, Tab, Typography, Paper, Button, Grid, TextField, Stack, FormControlLabel, Switch, List, ListItem, ListItemText, Divider, Chip, Link, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import BreadcrumbsNav from '@/components/BreadcrumbsNav';
import api from '@/services/api';

function TabPanel({ children, value, index }: any) {
  return <div role="tabpanel" hidden={value !== index}>{value === index && <Box pt={2}>{children}</Box>}</div>;
}

export default function JobDetailPage() {
  const { id } = useParams();
  const [value, setValue] = useState(0);
  const [data, setData] = useState<any>(null);
  const DEMO = ((import.meta as any).env?.VITE_DEMO ?? '1') === '1';
  const [schedule, setSchedule] = useState('');
  const [charges, setCharges] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [newCharge, setNewCharge] = useState<any>({ desc: '', amount: '' });
  const [newPayment, setNewPayment] = useState<any>({ method: 'card', amount: '' });
  const [noteText, setNoteText] = useState('');
  const [attachList, setAttachList] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [contact, setContact] = useState<any>(null);
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSms, setSendSms] = useState(false);
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [reminders, setReminders] = useState<any[]>([]);
  const [newReminder, setNewReminder] = useState<any>({ when: '', frequency: 'once' });
  const nav = useNavigate();
  const [wonDate, setWonDate] = useState<string | null>(null);

  useEffect(() => {
    if (DEMO) {
      setData({ job: { _id: id, status: 'scheduled', customer_id: 'contact-001', customer_name: 'Alice Johnson', email:'alice@example.com', phone:'555-111-0001', service_address:{ address1:'123 Main St', city:'Fredericksburg', state:'VA', zip_code:'22401' }, appliance:{ type:'Refrigerator', failure:'Not cooling' } }, notes: [{ _id:'n1', author:'tech', channel:'job', text:'Arrived on site' }], invoices: [{ _id:'i1', number:'10001', status:'unpaid' }] });
      setContact({ _id:'contact-001', name:'Johnson, Alice', emails:['alice@example.com'], phones:[{ number:'555-111-0001', can_text:true }], special_instructions:'Gate code 1234' });
      setSchedule('10:00-12:00');
      setCharges([{ _id:'c1', desc:'Diagnostic Fee', amount: '90.00' }]);
      setPayments([]);
      setAttachList([{ _id:'a1', name:'photo1.jpg' }]);
      setHistory([{ _id:'h1', ts: new Date().toISOString(), text:'Job created' }]);
      return;
    }
    const run = async () => {
      const res = await api.get(`/api/v1/jobs/${id}`);
      setData(res.data);
      try { const pay = await api.get('/api/v1/billing/payments', { params: { invoice_id: (res.data?.invoices||[])[0]?._id } }); setPayments(pay.data.items || []); } catch { setPayments([]); }
      if (res.data?.job?.customer_id) {
        try { const c = await api.get(`/api/v1/contacts/${res.data.job.customer_id}`); setContact(c.data); } catch {}
        try { const o = await api.get('/api/v1/opportunities/list', { params: { customer_id: res.data.job.customer_id } });
          const won = (o.data.items || []).filter((x:any)=> (x.status||'').toLowerCase()==='won').sort((a:any,b:any)=> (new Date(b.updated_at||b.created_at||0).getTime() - new Date(a.updated_at||a.created_at||0).getTime()));
          setWonDate(won.length ? (won[0].updated_at || won[0].created_at) : null);
        } catch {}
      }
      try { const r = await api.get('/api/v1/reminders/list', { params: { job_id: id } }); setReminders(r.data.items || []); } catch {}
    };
    run();
  }, [id]);

  if (!data) return <Typography>Loading…</Typography>;

  const { job, notes, invoices } = data;
  const statusColor: Record<string, any> = {
    created: 'default', // unscheduled -> gray
    unscheduled: 'default',
    scheduled: 'info',
    in_progress: 'success',
    on_hold: 'warning',
    completed: 'secondary',
  };
  const mapAddress = (job?.service_address || contact?.service_address);
  const addrText = mapAddress ? `${mapAddress.address1 || ''} ${mapAddress.city || ''} ${mapAddress.state || ''} ${mapAddress.zip_code || ''}`.trim() : '';
  const mapHref = addrText ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addrText)}` : undefined;

  return (
    <Box>
      <BreadcrumbsNav items={[{ label: 'Dashboard', to: '/provider/dashboard' }, { label: 'Jobs', to: '/provider/jobs' }, { label: `Job #${job.number || job._id}` }]} />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" gutterBottom>Job #{job.number || job._id}</Typography>
        <Stack direction="row" gap={1}>
          <FormControlLabel control={<Switch defaultChecked />} label="Customer-visible" />
        </Stack>
      </Stack>
      <Paper sx={{ p:2, mb:2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Stack direction="row" gap={1} alignItems="center">
              <Chip label={(job.status || 'unscheduled').replaceAll('_',' ')} color={statusColor[job.status || 'unscheduled']} size="small" />
              <Typography variant="body1">{job.appliance?.type || 'Appliance'}{job.appliance?.failure ? ` — ${job.appliance.failure}`: ''}</Typography>
            </Stack>
            {wonDate && (<Typography variant="caption" color="text.secondary">Opportunity won: {wonDate}</Typography>)}
            <Typography sx={{ mt:1 }}>Contact: {contact? (<Link component={RouterLink} to={`/provider/contact/${contact._id}`}>{contact.name || job.customer_name}</Link>) : (job.customer_name || '—')}</Typography>
            <Typography>Email: {job.email ? <Link href={`mailto:${job.email}`}>{job.email}</Link> : (contact?.emails?.[0] ? <Link href={`mailto:${contact.emails[0]}`}>{contact.emails[0]}</Link> : '—')}</Typography>
            <Typography>Phone: {job.phone ? <Link href={`tel:${job.phone}`}>{job.phone}</Link> : (contact?.phones?.[0]?.number ? <Link href={`tel:${contact.phones[0].number}`}>{contact.phones[0].number}</Link> : '—')}</Typography>
            <Typography>Address: {addrText || '—'} {mapHref && (<Link href={mapHref} target="_blank" rel="noopener" sx={{ ml:1 }}>Map</Link>)}</Typography>
            <Typography sx={{ mt:1 }} color="text.secondary">Special instructions: {contact?.special_instructions || '—'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" gap={1}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={job.status || 'unscheduled'} onChange={async (e)=>{ const next = String(e.target.value); setData({ ...data, job: { ...job, status: next } }); if(!DEMO){ try{ await api.post('/api/v1/voice/update_job_status', { job_id: job._id, status: next }); } catch {} } }}>
                  <MenuItem value="created">Unscheduled</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="on_hold">On Hold</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      <Tabs value={value} onChange={(_, v) => setValue(v)}>
        <Tab label="Messages" />
        <Tab label="Job Details" />
        <Tab label="Charges & Payments" />
        <Tab label="Notes" />
        <Tab label="Attachments" />
        <Tab label="History" />
        <Tab label="Invoice" />
      </Tabs>

      <TabPanel value={value} index={0}>
        <Typography variant="subtitle1" gutterBottom>Send message to customer</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Subject" value={msgSubject} onChange={e=>setMsgSubject(e.target.value)} /></Grid>
          <Grid item xs={12}><TextField fullWidth size="small" label="Message" multiline rows={6} value={msgBody} onChange={e=>setMsgBody(e.target.value)} /></Grid>
          <Grid item xs={12} md={3}><FormControlLabel control={<Switch checked={sendEmail} onChange={(e)=>setSendEmail(e.target.checked)} />} label="Email" /></Grid>
          <Grid item xs={12} md={3}><FormControlLabel control={<Switch checked={sendSms} onChange={(e)=>setSendSms(e.target.checked)} />} label="SMS" /></Grid>
          <Grid item xs={12}><Button variant="contained" onClick={async ()=>{
            if (DEMO) return;
            try { await api.post('/api/v1/contacts/message', { customer_id: job.customer_id, email: sendEmail, sms: sendSms, subject: msgSubject, body: msgBody }); } catch {}
          }}>Send</Button></Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography>Status: {job.status}</Typography>
              <Typography sx={{ mt: 1 }}>Customer: {job.customer_name || '—'}</Typography>
              <Typography>Phone: {job.phone || '—'}</Typography>
              <Typography>Email: {job.email || '—'}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography>Schedule</Typography>
              <Box mt={1} display="flex" gap={1}>
                <TextField size="small" placeholder="Time window e.g. 10-12" value={schedule} onChange={e=>setSchedule(e.target.value)} />
                <Button variant="outlined" onClick={async()=>{ if(DEMO) return; try { await api.post('/api/v1/voice/schedule_tech', { job_id: job._id, time_window: schedule, tech_id: undefined }); } catch {} }}>Set</Button>
              </Box>
              <Divider sx={{ my:2 }} />
              <Typography variant="subtitle1">Reminders</Typography>
              <List dense>
                {reminders.map((r:any)=> (<ListItem key={r._id} divider><ListItemText primary={r.message || r.due_at} secondary={`When: ${r.due_at} • Every: ${r.frequency || 'once'}`} /></ListItem>))}
              </List>
              <Grid container spacing={1}>
                <Grid item xs={12} md={6}><TextField size="small" label="When (e.g., 2025-09-01 09:00)" fullWidth value={newReminder.when} onChange={e=>setNewReminder({...newReminder,when:e.target.value})} /></Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Frequency</InputLabel>
                    <Select label="Frequency" value={newReminder.frequency} onChange={e=>setNewReminder({...newReminder,frequency:e.target.value})}>
                      <MenuItem value="once">Once</MenuItem>
                      <MenuItem value="3d">Every 3 days</MenuItem>
                      <MenuItem value="15d">Every 15 days</MenuItem>
                      <MenuItem value="30d">Every 30 days</MenuItem>
                      <MenuItem value="60d">Every 60 days</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}><Button size="small" variant="outlined" onClick={async ()=>{
                  if (DEMO) { setReminders([...reminders, { _id:`r-${Date.now()}`, due_at:newReminder.when, frequency:newReminder.frequency }]); setNewReminder({ when:'', frequency:'once' }); return; }
                  try { await api.post('/api/v1/reminders/upsert', { job_id: id, due_at: newReminder.when, frequency: newReminder.frequency, channel: 'email' }); const r = await api.get('/api/v1/reminders/list', { params: { job_id: id } }); setReminders(r.data.items || []);} catch {}
                  setNewReminder({ when:'', frequency:'once' });
                }}>Add Reminder</Button></Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p:2 }}>
              <Typography variant="subtitle1">Charges</Typography>
              <List dense>
                {charges.map(c => (<ListItem key={c._id} divider><ListItemText primary={c.desc} secondary={`$${c.amount}`} /></ListItem>))}
              </List>
              <Grid container spacing={1}>
                <Grid item xs={8}><TextField size="small" label="Description" fullWidth value={newCharge.desc} onChange={e=>setNewCharge({...newCharge,desc:e.target.value})} /></Grid>
                <Grid item xs={4}><TextField size="small" label="Amount" fullWidth value={newCharge.amount} onChange={e=>setNewCharge({...newCharge,amount:e.target.value})} /></Grid>
                <Grid item xs={12}><Button size="small" variant="outlined" onClick={()=>{ if(newCharge.desc && newCharge.amount){ setCharges([...charges, { _id:`c-${Date.now()}`, ...newCharge }]); setNewCharge({ desc:'', amount:'' }); } }}>Add Charge</Button></Grid>
              </Grid>
              <Divider sx={{ my:1 }} />
              <Stack direction="row" gap={1} alignItems="center">
                <FormControlLabel control={<Switch />} label="PDF invoice" />
                <FormControlLabel control={<Switch />} label="Text customer when ready" />
                <Button size="small" variant="contained" onClick={async ()=>{
                  if (DEMO) return;
                  try {
                    const payload = { job_id: job._id, customer_id: job.customer_id, charges: charges.map(c=> ({ desc:c.desc, amount:c.amount })) } as any;
                    await api.post('/api/v1/billing/invoice', payload);
                  } catch {}
                }}>Generate Invoice</Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p:2 }}>
              <Typography variant="subtitle1">Payments</Typography>
              <List dense>
                {payments.map(p => (<ListItem key={p._id} divider><ListItemText primary={`$${p.amount}`} secondary={p.method} /></ListItem>))}
              </List>
              <Grid container spacing={1}>
                <Grid item xs={6}><TextField size="small" label="Amount" fullWidth value={newPayment.amount} onChange={e=>setNewPayment({...newPayment,amount:e.target.value})} /></Grid>
                <Grid item xs={6}><TextField size="small" label="Method" fullWidth value={newPayment.method} onChange={e=>setNewPayment({...newPayment,method:e.target.value})} /></Grid>
                <Grid item xs={12}><Button size="small" variant="outlined" onClick={async ()=>{ if(newPayment.amount){
                  if (DEMO) { setPayments([...payments, { _id:`p-${Date.now()}`, ...newPayment }]); setNewPayment({ amount:'', method:'card' }); return; }
                  try { await api.post('/api/v1/billing/payment', { job_id: job._id, customer_id: job.customer_id, amount_usd: parseFloat(newPayment.amount), method: newPayment.method, invoice_id: (invoices||[])[0]?._id }); const pay = await api.get('/api/v1/billing/payments', { params: { invoice_id: (invoices||[])[0]?._id } }); setPayments(pay.data.items || []); } catch {}
                  setNewPayment({ amount:'', method:'card' });
                } }}>Add Payment</Button></Grid>
              </Grid>
              <Divider sx={{ my:1 }} />
              <Button size="small">Request Payment (Text/Email)</Button>
              <Button size="small" sx={{ ml:1 }}>Enable Reminders</Button>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={3}>
        {(notes || []).map((n: any) => (
          <Paper key={n._id} sx={{ p: 2, mb: 1 }}>
            <Typography variant="caption">{n.author} • {n.channel}</Typography>
            <Typography>{n.text}</Typography>
          </Paper>
        ))}
        <Box mt={1} display="flex" gap={1}>
          <TextField fullWidth size="small" placeholder="Add note" value={noteText} onChange={e=>setNoteText(e.target.value)} />
          <Button variant="outlined" onClick={async ()=>{ if(!noteText) return; if (DEMO) { (notes||[]).unshift({ _id:`n-${Date.now()}`, author:'user', channel:'job', text:noteText }); setNoteText(''); setData({ ...data, notes:[...notes] }); return; } try { await api.post('/api/v1/voice/append_note', { job_id: job._id, author: 'user', note: noteText }); const res = await api.get(`/api/v1/jobs/${id}`); setData(res.data); setNoteText(''); } catch {} }}>Add</Button>
        </Box>
      </TabPanel>

      <TabPanel value={value} index={4}>
        <Typography variant="subtitle1" gutterBottom>Attachments</Typography>
        <List dense>
          {attachList.map(a => (<ListItem key={a._id} divider><ListItemText primary={a.name || a.path || a._id} secondary={a.public? 'Customer-visible':'Internal'} /></ListItem>))}
        </List>
        <Button size="small" variant="outlined" component="label" onChange={async (e:any)=>{ const file = e?.target?.files?.[0]; if(!file) return; if(DEMO){ setAttachList([...attachList,{ _id:`a-${Date.now()}`, name:file.name }]); return; } try { const form = new FormData(); form.append('file', file); form.append('customer_id', job.customer_id); const res = await api.post('/api/v1/files/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }); setAttachList([...attachList, { _id:`a-${Date.now()}`, name:file.name, path: res.data?.path }]); } catch {} }}>Upload<input type="file" hidden /></Button>
        <Button size="small" sx={{ ml:1 }}>Toggle Visibility</Button>
      </TabPanel>

      <TabPanel value={value} index={5}>
        <List dense>
          {history.map(h => (<ListItem key={h._id} divider><ListItemText primary={h.text} secondary={h.ts} /></ListItem>))}
        </List>
      </TabPanel>

      <TabPanel value={value} index={6}>
        {(invoices || []).length === 0 ? <Typography>No invoice.</Typography> : invoices.map((i: any) => (
          <Paper key={i._id} sx={{ p: 2, mb: 1 }}>
            <Typography>Invoice {i.number || i._id} — {i.status}</Typography>
          </Paper>
        ))}
      </TabPanel>
    </Box>
  );
}


