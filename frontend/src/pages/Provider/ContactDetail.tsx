// @ts-nocheck
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Grid, Chip, Paper, TextField, Switch, FormControlLabel, Button, Divider, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, InputLabel, FormControl, List, ListItem, ListItemText } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import api from '@/services/api';
import { demoOpps } from '@/services/demoStore';
import BreadcrumbsNav from '@/components/BreadcrumbsNav';

function TabPanel({ children, value, index }: any) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function ContactDetailPage() {
  const { id } = useParams();
  const [value, setValue] = useState(4); // Default to Jobs tab per spec
  const [contact, setContact] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const DEMO = ((import.meta as any).env?.VITE_DEMO ?? '1') === '1';
  const [phones, setPhones] = useState<any[]>([]);
  const [emails, setEmails] = useState<string[]>([]);
  const [serviceAddr, setServiceAddr] = useState<any>({});
  const [billingAddr, setBillingAddr] = useState<any>({});
  const [tags, setTags] = useState<string[]>([]);
  const MAX_PHONES = 3;
  const MAX_EMAILS = 3;
  const [isCompany, setIsCompany] = useState(false);
  const [taxExempt, setTaxExempt] = useState(false);
  const [source, setSource] = useState('');
  const [special, setSpecial] = useState('');
  const [openMerge, setOpenMerge] = useState(false);
  const [mergeTargetId, setMergeTargetId] = useState('');
  const [openInactive, setOpenInactive] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openServiceMap, setOpenServiceMap] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSms, setSendSms] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [additionalContacts, setAdditionalContacts] = useState<any[]>([]);
  const [newLocation, setNewLocation] = useState<any>({ address1: '', city: '', state: '', zip_code: '' });
  const [editingLocIdx, setEditingLocIdx] = useState<number | null>(null);
  const [editLoc, setEditLoc] = useState<any>({ address1: '', city: '', state: '', zip_code: '' });
  const [newPerson, setNewPerson] = useState<any>({ name: '', phone: '', email: '' });
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [newOpp, setNewOpp] = useState<any>({ title: '', stage: 'new' });
  const [notesList, setNotesList] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [newReminder, setNewReminder] = useState<any>({ when: '', frequency: 'once' });

  useEffect(() => {
    const run = async () => {
      if (DEMO) {
        const demo = {
          _id: id,
          customer_number: 1001,
          first_name: 'Alice',
          last_name: 'Johnson',
          phones: [{ number: '555-111-0001', can_text: true }],
          emails: ['alice@example.com'],
          service_address: { address1: '123 Main St', city: 'Fredericksburg', state: 'VA', zip_code: '22401' },
          billing_address: { address1: 'PO Box 1', city: 'Fredericksburg', state: 'VA', zip_code: '22401' },
          tags: ['vip'], source: 'Google', tax_exempt: false, is_company: false,
        };
        setContact(demo);
        setPhones(demo.phones);
        setEmails(demo.emails);
        setServiceAddr(demo.service_address);
        setBillingAddr(demo.billing_address);
        setTags(demo.tags);
        setIsCompany(demo.is_company);
        setTaxExempt(demo.tax_exempt);
        setSource(demo.source);
        setJobs([
          { _id: 'demo-001', title: 'Refrigerator Repair', status: 'completed' },
        ]);
        setInvoices([{ _id: 'inv-001', number: '10001', status: 'unpaid' }]);
        setPayments([]);
        setLocations([{ address1: '2246 Elm St', city: 'Stafford', state: 'VA', zip_code: '22554' }]);
        setAdditionalContacts([{ name: 'Property Manager', phone: '555-555-1212', email: 'pm@example.com' }]);
        setOpportunities(demoOpps.listByContact(id as string).length ? demoOpps.listByContact(id as string) : [{ _id: 'opp-001', title: 'Washer Replacement', stage: 'lost', customer_id: id }]);
        setNotesList([{ _id: 'n1', author: 'tech:Lou', text: 'Completed repair and tested.', ts: new Date().toISOString() }]);
        setReminders([{ _id: 'r1', when: '2025-09-01 09:00', frequency: '30d', text: 'Filter replacement follow-up' }]);
        return;
      }
      try {
        const res = await api.get(`/api/v1/contacts/${id}`);
        setContact(res.data);
        setPhones(res.data?.phones || []);
        setEmails(res.data?.emails || []);
        setServiceAddr(res.data?.service_address || {});
        setBillingAddr(res.data?.billing_address || {});
        setTags(res.data?.tags || []);
        setIsCompany(!!res.data?.is_company);
        setTaxExempt(!!res.data?.tax_exempt);
        setSource(res.data?.source || '');
        setSpecial(res.data?.special_instructions || '');
        setLocations(res.data?.service_locations || []);
        setAdditionalContacts(res.data?.additional_contacts || []);
      } catch { /* ignore in skeleton */ }
      try {
        const mres = await api.get('/api/v1/contacts/messages', { params: { customer_id: id } });
        setMessages(mres.data.items || []);
      } catch { setMessages([]); }
      try {
        const j = await api.get('/api/v1/jobs/list', { params: { limit: 100 } });
        setJobs((j.data.items || []).filter((x: any) => x.customer_id === id));
      } catch { setJobs([]); }
      try {
        const inv = await api.get('/api/v1/billing/invoices', { params: { customer_id: id } });
        setInvoices(inv.data.items || []);
      } catch { setInvoices([]); }
      try {
        const pay = await api.get('/api/v1/billing/payments', { params: { customer_id: id } });
        setPayments(pay.data.items || []);
      } catch { setPayments([]); }
      try {
        const rf = await api.get('/api/v1/billing/refunds', { params: { customer_id: id } });
        setRefunds(rf.data.items || []);
      } catch { setRefunds([]); }
      try {
        const opp = await api.get('/api/v1/opportunities/list', { params: { customer_id: id } });
        setOpportunities(opp.data.items || []);
      } catch { setOpportunities([]); }
      try {
        const rres = await api.get('/api/v1/reminders/list', { params: { customer_id: id } });
        setReminders((rres.data.items || []).map((r:any)=> ({ _id: r._id, when: r.due_at, frequency: r.frequency, text: r.message })));
      } catch { /* ignore */ }
    };
    run();
  }, [id]);

  if (!contact) return <Typography>Loading…</Typography>;

  const name = contact.name || `${contact.last_name || ''}, ${contact.first_name || ''}`.trim();
  const hasBlockingRecords = (jobs?.length || 0) > 0 || (invoices?.length || 0) > 0;

  const addPhone = () => {
    if (phones.length >= MAX_PHONES) return;
    setPhones([...phones, { number: '', can_text: true }]);
  };
  const addEmail = () => {
    if (emails.length >= MAX_EMAILS) return;
    setEmails([...emails, '']);
  };
  const addTag = () => setTags([...tags, 'new-tag']);
  const handleSave = async () => {
    const cleanedEmails = emails.map((e:string)=> (e||'').trim()).filter(Boolean);
    const cleanedPhones = phones.map((p:any)=> ({ ...p, number: (p.number||'').trim() })).filter((p:any)=> p.number.length >= 3);
    const payload = {
      id: contact._id,
      customer_number: contact.customer_number,
      first_name: contact.first_name,
      last_name: contact.last_name,
      name: contact.name,
      phones: cleanedPhones,
      emails: cleanedEmails,
      primary_phone: cleanedPhones?.[0]?.number,
      primary_email: cleanedEmails?.[0] || undefined,
      service_address: serviceAddr,
      billing_address: billingAddr,
      source, special_instructions: special,
      tax_exempt: taxExempt, is_company: isCompany,
      tags,
      service_locations: locations,
      additional_contacts: additionalContacts,
      idempotency_key: `contact-save-${contact._id || 'new'}`,
    };
    if (DEMO) { return; }
    try { await api.post('/api/v1/contacts/upsert', payload); try { const res = await api.get(`/api/v1/contacts/${id}`); setContact(res.data); } catch {} } catch {}
  };

  return (
    <Box>
      <BreadcrumbsNav items={[{ label: 'Dashboard', to: '/provider/dashboard' }, { label: 'Contacts', to: '/provider/contacts' }, { label: name }]} />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h5" gutterBottom>{name}</Typography>
        <Stack direction="row" gap={1}>
          <Button size="small" onClick={()=>setOpenMerge(true)}>Merge</Button>
          <Button size="small" color="warning" onClick={()=>setOpenInactive(true)}>Mark Inactive</Button>
          <Button size="small" color="error" disabled={hasBlockingRecords} onClick={()=>setOpenDelete(true)}>Delete</Button>
        </Stack>
      </Stack>
      <Tabs value={value} onChange={(_, v) => setValue(v)}>
        <Tab label="Messages" />
        <Tab label="Overview" />
        <Tab label="Locations & Contacts" />
        <Tab label="Opportunities" />
        <Tab label="Jobs" />
        <Tab label="Invoices" />
        <Tab label="Payments" />
        <Tab label="Refunds" />
        <Tab label="Notes" />
        <Tab label="Reminders" />
      </Tabs>

      <TabPanel value={value} index={0}>
        <Typography sx={{ mb: 1 }}>Email to: {(contact.emails || []).join(', ') || '—'}</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}><TextField label="Subject" size="small" fullWidth value={messageSubject} onChange={(e)=>setMessageSubject(e.target.value)} /></Grid>
          <Grid item xs={12}>
            <TextField label="Message" size="small" fullWidth multiline rows={6} value={messageBody} onChange={(e)=>setMessageBody(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}><FormControlLabel control={<Switch checked={sendEmail} onChange={(e)=>setSendEmail(e.target.checked)} />} label="Send Email" /></Grid>
          <Grid item xs={12} md={4}><FormControlLabel control={<Switch checked={sendSms} onChange={(e)=>setSendSms(e.target.checked)} />} label="Send SMS" /></Grid>
          <Grid item xs={12}><Button variant="contained" onClick={async ()=>{
            if (DEMO) return;
            try {
              await api.post('/api/v1/contacts/message', {
                customer_id: contact._id,
                sms: sendSms,
                email: sendEmail,
                subject: messageSubject,
                body: messageBody,
              });
              try { const mres = await api.get('/api/v1/contacts/messages', { params: { customer_id: id } }); setMessages(mres.data.items || []); } catch {}
            } catch {}
          }}>Send</Button></Grid>
        </Grid>
        <Divider sx={{ my:2 }} />
        <Typography variant="subtitle1" gutterBottom>Message History</Typography>
        <List dense>
          {messages.map((m:any)=>(
            <ListItem key={m._id} divider>
              <ListItemText primary={m.subject || (m.channels?.sms ? 'SMS' : 'Email')} secondary={`${new Date(m.ts).toLocaleString()} • ${(m.recipients?.emails||[]).join(', ')} ${(m.recipients?.phones||[]).join(', ')}`} />
            </ListItem>
          ))}
        </List>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper sx={{ p:2 }}>
              <Typography variant="subtitle1" gutterBottom>Core Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}><TextField label="Customer #" value={contact.customer_number || ''} fullWidth size="small" disabled /></Grid>
                <Grid item xs={12} md={3}><TextField label="First Name" value={contact.first_name || ''} onChange={(e)=>setContact({...contact, first_name:e.target.value})} fullWidth size="small" /></Grid>
                <Grid item xs={12} md={3}><TextField label="Last Name" value={contact.last_name || ''} onChange={(e)=>setContact({...contact, last_name:e.target.value})} fullWidth size="small" /></Grid>
                <Grid item xs={12} md={3}><FormControlLabel control={<Switch checked={isCompany} onChange={(e)=>setIsCompany(e.target.checked)} />} label="Company" /></Grid>
              </Grid>
              <Divider sx={{ my:2 }} />
              <Typography variant="subtitle2">Phones</Typography>
              <Stack spacing={1} mt={1}>
                {phones.map((p, idx)=> (
                  <Grid key={idx} container spacing={1} alignItems="center">
                    <Grid item xs={8} md={5}><TextField size="small" label={`Phone ${idx+1}`} value={p.number} onChange={(e)=>{ const n=[...phones]; n[idx]={...n[idx], number:e.target.value}; setPhones(n);} } fullWidth /></Grid>
                    <Grid item xs={4} md={3}><FormControlLabel control={<Switch checked={!!p.can_text} onChange={(e)=>{ const n=[...phones]; n[idx]={...n[idx], can_text:e.target.checked}; setPhones(n);} } />} label="Can text" /></Grid>
                  </Grid>
                ))}
                <IconButton size="small" onClick={addPhone} disabled={phones.length >= MAX_PHONES}><AddIcon fontSize="small" /> Add phone</IconButton>
              </Stack>
              <Divider sx={{ my:2 }} />
              <Typography variant="subtitle2">Emails</Typography>
              <Stack spacing={1} mt={1}>
                {emails.map((em, idx)=> (
                  <TextField key={idx} size="small" label={`Email ${idx+1}`} value={em} onChange={(e)=>{ const n=[...emails]; n[idx]=e.target.value; setEmails(n);} } fullWidth />
                ))}
                <IconButton size="small" onClick={addEmail} disabled={emails.length >= MAX_EMAILS}><AddIcon fontSize="small" /> Add email</IconButton>
              </Stack>
              <Divider sx={{ my:2 }} />
              <Typography variant="subtitle2">Service Address</Typography>
              <Grid container spacing={1} mt={1}>
                <Grid item xs={12} md={6}><TextField size="small" label="Address 1" value={serviceAddr.address1||''} onChange={(e)=>setServiceAddr({...serviceAddr,address1:e.target.value})} fullWidth /></Grid>
                <Grid item xs={12} md={6}><TextField size="small" label="Address 2" value={serviceAddr.address2||''} onChange={(e)=>setServiceAddr({...serviceAddr,address2:e.target.value})} fullWidth /></Grid>
                <Grid item xs={12} md={3}><TextField size="small" label="City" value={serviceAddr.city||''} onChange={(e)=>setServiceAddr({...serviceAddr,city:e.target.value})} fullWidth /></Grid>
                <Grid item xs={12} md={2}><TextField size="small" label="State" value={serviceAddr.state||''} onChange={(e)=>setServiceAddr({...serviceAddr,state:e.target.value})} fullWidth /></Grid>
                <Grid item xs={12} md={3}><TextField size="small" label="Zip" value={serviceAddr.zip_code||''} onChange={(e)=>setServiceAddr({...serviceAddr,zip_code:e.target.value})} fullWidth /></Grid>
                <Grid item xs={12} md={2}><TextField size="small" label="Country" value={serviceAddr.country||''} onChange={(e)=>setServiceAddr({...serviceAddr,country:e.target.value})} fullWidth /></Grid>
                <Grid item xs={6} md={3}><TextField size="small" label="Latitude" value={serviceAddr.latitude||''} onChange={(e)=>setServiceAddr({...serviceAddr,latitude:e.target.value})} fullWidth /></Grid>
                <Grid item xs={6} md={3}><TextField size="small" label="Longitude" value={serviceAddr.longitude||''} onChange={(e)=>setServiceAddr({...serviceAddr,longitude:e.target.value})} fullWidth /></Grid>
              </Grid>
              <Divider sx={{ my:2 }} />
              <Typography variant="subtitle2">Billing Address</Typography>
              <Grid container spacing={1} mt={1}>
                <Grid item xs={12} md={6}><TextField size="small" label="Address 1" value={billingAddr.address1||''} onChange={(e)=>setBillingAddr({...billingAddr,address1:e.target.value})} fullWidth /></Grid>
                <Grid item xs={12} md={6}><TextField size="small" label="Address 2" value={billingAddr.address2||''} onChange={(e)=>setBillingAddr({...billingAddr,address2:e.target.value})} fullWidth /></Grid>
                <Grid item xs={12} md={3}><TextField size="small" label="City" value={billingAddr.city||''} onChange={(e)=>setBillingAddr({...billingAddr,city:e.target.value})} fullWidth /></Grid>
                <Grid item xs={12} md={2}><TextField size="small" label="State" value={billingAddr.state||''} onChange={(e)=>setBillingAddr({...billingAddr,state:e.target.value})} fullWidth /></Grid>
                <Grid item xs={12} md={3}><TextField size="small" label="Zip" value={billingAddr.zip_code||''} onChange={(e)=>setBillingAddr({...billingAddr,zip_code:e.target.value})} fullWidth /></Grid>
                <Grid item xs={12} md={2}><TextField size="small" label="Country" value={billingAddr.country||''} onChange={(e)=>setBillingAddr({...billingAddr,country:e.target.value})} fullWidth /></Grid>
                <Grid item xs={6} md={3}><TextField size="small" label="Latitude" value={billingAddr.latitude||''} onChange={(e)=>setBillingAddr({...billingAddr,latitude:e.target.value})} fullWidth /></Grid>
                <Grid item xs={6} md={3}><TextField size="small" label="Longitude" value={billingAddr.longitude||''} onChange={(e)=>setBillingAddr({...billingAddr,longitude:e.target.value})} fullWidth /></Grid>
              </Grid>
              <Divider sx={{ my:2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}><TextField size="small" label="Source" value={source} onChange={(e)=>setSource(e.target.value)} fullWidth /></Grid>
                <Grid item xs={12} md={4}><FormControlLabel control={<Switch checked={taxExempt} onChange={(e)=>setTaxExempt(e.target.checked)} />} label="Tax Exempt" /></Grid>
              </Grid>
              <TextField size="small" label="Special Instructions" value={special} onChange={(e)=>setSpecial(e.target.value)} fullWidth multiline rows={3} sx={{ mt:2 }} />
              <Box mt={2}>
                <Typography variant="subtitle2">Tags</Typography>
                <Box mt={1} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {tags.map((t, i)=> <Chip key={i} label={t} />)}
                  <Button size="small" onClick={addTag} startIcon={<AddIcon />}>Add Tag</Button>
                </Box>
              </Box>
              <Box display="flex" gap={1} mt={2}>
                <Button variant="contained" onClick={handleSave}>Save</Button>
                <Button variant="outlined" color="warning" onClick={()=>setOpenInactive(true)}>Mark Inactive</Button>
                <Button variant="outlined" color="error" onClick={()=>setOpenDelete(true)}>Delete</Button>
                <Button variant="text" onClick={()=>setOpenMerge(true)}>Merge Contact</Button>
              </Box>
              <Box mt={2}>
                <Button variant="outlined" size="small" onClick={()=>setOpenServiceMap(true)}>Service Location</Button>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Overview</Typography>
              <List dense>
                <ListItem><ListItemText primary="Source" secondary={contact.source || '—'} /></ListItem>
                <ListItem><ListItemText primary="Tax" secondary={contact.tax_exempt ? 'Exempt' : 'Taxed'} /></ListItem>
                <ListItem><ListItemText primary="QuickBooks Last Update" secondary={contact.qb_last_updated || '—'} /></ListItem>
                <ListItem><ListItemText primary="Open Balance" secondary={typeof contact.open_balance_usd === 'number' ? `$${contact.open_balance_usd.toFixed(2)}` : '—'} /></ListItem>
                <ListItem button component="a" href={contact.qb_customer_center_url || '#'} target="_blank" rel="noopener">
                  <ListItemText primary="Customer Center" secondary={contact.qb_customer_center_url ? 'Open in QuickBooks' : '—'} />
                </ListItem>
                <ListItem><ListItemText primary="Contact History" secondary="Email/SMS history coming soon" /></ListItem>
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Tags</Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {(contact.tags || []).map((t: string) => <Chip key={t} label={t} />)}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={2}>
        <Typography variant="subtitle1" gutterBottom>Locations</Typography>
        <List dense>
          {locations.map((loc, i)=> (
            <ListItem key={i} divider>
              {editingLocIdx === i ? (
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={12} md={5}><TextField size="small" label="Address 1" fullWidth value={editLoc.address1 || ''} onChange={e=>setEditLoc({...editLoc, address1:e.target.value})} /></Grid>
                  <Grid item xs={12} md={2}><TextField size="small" label="City" fullWidth value={editLoc.city || ''} onChange={e=>setEditLoc({...editLoc, city:e.target.value})} /></Grid>
                  <Grid item xs={6} md={2}><TextField size="small" label="State" fullWidth value={editLoc.state || ''} onChange={e=>setEditLoc({...editLoc, state:e.target.value})} /></Grid>
                  <Grid item xs={6} md={2}><TextField size="small" label="Zip" fullWidth value={editLoc.zip_code || ''} onChange={e=>setEditLoc({...editLoc, zip_code:e.target.value})} /></Grid>
                  <Grid item xs={12} md={1} sx={{ display:'flex', gap: 0.5, justifyContent:'flex-end' }}>
                    <IconButton size="small" color="primary" onClick={()=>{ const next=[...locations]; next[i] = { ...next[i], ...editLoc }; setLocations(next); setEditingLocIdx(null); }}><CheckIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={()=>{ setEditingLocIdx(null); setEditLoc({ address1:'', city:'', state:'', zip_code:'' }); }}><CloseIcon fontSize="small" /></IconButton>
                  </Grid>
                </Grid>
              ) : (
                <Box sx={{ display:'flex', alignItems:'center', width:'100%', gap:1 }}>
                  <ListItemText primary={`${loc.address1 || ''}`} secondary={`${loc.city || ''}, ${loc.state || ''} ${loc.zip_code || ''}`} />
                  <IconButton size="small" onClick={()=>{ setEditingLocIdx(i); setEditLoc(loc); }}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={()=>{ const next=[...locations]; next.splice(i,1); setLocations(next); }}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
              )}
            </ListItem>
          ))}
        </List>
        <Grid container spacing={1} mt={1}>
          <Grid item xs={12} md={6}><TextField size="small" label="Address 1" fullWidth value={newLocation.address1} onChange={e=>setNewLocation({...newLocation,address1:e.target.value})} /></Grid>
          <Grid item xs={12} md={2}><TextField size="small" label="City" fullWidth value={newLocation.city} onChange={e=>setNewLocation({...newLocation,city:e.target.value})} /></Grid>
          <Grid item xs={12} md={2}><TextField size="small" label="State" fullWidth value={newLocation.state} onChange={e=>setNewLocation({...newLocation,state:e.target.value})} /></Grid>
          <Grid item xs={12} md={2}><TextField size="small" label="Zip" fullWidth value={newLocation.zip_code} onChange={e=>setNewLocation({...newLocation,zip_code:e.target.value})} /></Grid>
          <Grid item xs={12}><Button size="small" variant="outlined" onClick={()=>{ setLocations([...locations,newLocation]); setNewLocation({ address1:'',city:'',state:'',zip_code:''}); }}>Add Location</Button></Grid>
        </Grid>
        <Divider sx={{ my:2 }} />
        <Typography variant="subtitle1" gutterBottom>Additional Contacts</Typography>
        <List dense>
          {additionalContacts.map((p,i)=>(<ListItem key={i} divider><ListItemText primary={p.name} secondary={`${p.phone || ''} ${p.email || ''}`} /></ListItem>))}
        </List>
        <Grid container spacing={1} mt={1}>
          <Grid item xs={12} md={4}><TextField size="small" label="Name" fullWidth value={newPerson.name} onChange={e=>setNewPerson({...newPerson,name:e.target.value})} /></Grid>
          <Grid item xs={12} md={4}><TextField size="small" label="Phone" fullWidth value={newPerson.phone} onChange={e=>setNewPerson({...newPerson,phone:e.target.value})} /></Grid>
          <Grid item xs={12} md={4}><TextField size="small" label="Email" fullWidth value={newPerson.email} onChange={e=>setNewPerson({...newPerson,email:e.target.value})} /></Grid>
          <Grid item xs={12}><Button size="small" variant="outlined" onClick={()=>{ setAdditionalContacts([...additionalContacts,newPerson]); setNewPerson({ name:'', phone:'', email:''}); }}>Add Person</Button></Grid>
        </Grid>
        <Box mt={2}><Button variant="contained" size="small" onClick={handleSave}>Save Changes</Button></Box>
      </TabPanel>

      <TabPanel value={value} index={3}>
        <Typography variant="subtitle1" gutterBottom>Opportunities</Typography>
        <List dense>
          {opportunities.map((o)=> (<ListItem key={o._id} divider><ListItemText primary={o.title} secondary={`Stage: ${o.stage}`} /></ListItem>))}
        </List>
        <Grid container spacing={1} mt={1}>
          <Grid item xs={12} md={6}><TextField size="small" label="Title" fullWidth value={newOpp.title} onChange={e=>setNewOpp({...newOpp,title:e.target.value})} /></Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Stage</InputLabel>
              <Select label="Stage" value={newOpp.stage} onChange={e=>setNewOpp({...newOpp,stage:e.target.value})}>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="unscheduled">Unscheduled</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}><Button variant="outlined" size="small" onClick={async ()=>{
            const next = { id: undefined, title: newOpp.title, status: newOpp.stage, customer_id: id } as any;
            if (DEMO) {
              const item = { _id: `opp-${Date.now()}`, title: newOpp.title, stage: newOpp.stage, customer_id: id } as any;
              const list = [...opportunities, item]; setOpportunities(list); demoOpps.setForContact(id as string, list);
            } else {
              try { await api.post('/api/v1/opportunities/upsert', next); const res = await api.get('/api/v1/opportunities/list', { params: { customer_id: id } }); setOpportunities(res.data.items || []); } catch {}
            }
            setNewOpp({ title:'', stage:'new'});
          }}>Add</Button></Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={4}>
        {jobs.length === 0 ? <Typography>No jobs.</Typography> : jobs.map((j) => (
          <Paper key={j._id} sx={{ p: 2, mb: 1 }}>
            <Typography>Job #{j._id} — {j.status}</Typography>
          </Paper>
        ))}
      </TabPanel>

      <TabPanel value={value} index={5}>
        {invoices.length === 0 ? <Typography>No invoices.</Typography> : invoices.map((inv) => (
          <Paper key={inv._id} sx={{ p: 2, mb: 1 }}>
            <Typography>Invoice {inv.number || inv._id} — {inv.status}</Typography>
          </Paper>
        ))}
      </TabPanel>

      <TabPanel value={value} index={6}>
        {payments.length === 0 ? <Typography>No payments.</Typography> : payments.map((p) => (
          <Paper key={p._id} sx={{ p: 2, mb: 1 }}>
            <Typography>${p.amount_usd} via {p.method}</Typography>
          </Paper>
        ))}
      </TabPanel>

      <TabPanel value={value} index={7}>
        <Typography variant="subtitle1" gutterBottom>Refunds</Typography>
        {refunds.length === 0 ? <Typography>No refunds.</Typography> : refunds.map((r:any)=>(
          <Paper key={r._id} sx={{ p:2, mb:1 }}>
            <Typography>${r.amount_usd}</Typography>
          </Paper>
        ))}
      </TabPanel>

      <TabPanel value={value} index={8}>
        <Typography variant="subtitle1" gutterBottom>Notes</Typography>
        <List dense>
          {notesList.map((n)=> (<ListItem key={n._id} divider><ListItemText primary={n.text} secondary={`${n.author || 'user'} • ${n.ts}`} /></ListItem>))}
        </List>
        <Grid container spacing={1} mt={1}>
          <Grid item xs={12}><TextField size="small" fullWidth label="Add note" value={newNote} onChange={e=>setNewNote(e.target.value)} /></Grid>
          <Grid item xs={12}><Button size="small" variant="outlined" onClick={async()=>{ if(newNote){
            if (DEMO) { setNotesList([{ _id:`n-${Date.now()}`, text:newNote, author:'user', ts:new Date().toISOString() }, ...notesList]); setNewNote(''); return; }
            try { await api.post('/api/v1/contacts/notes/add', { customer_id: id, author: 'user', text: newNote }); setNotesList([{ _id:`n-${Date.now()}`, text:newNote, author:'user', ts:new Date().toISOString() }, ...notesList]); setNewNote(''); } catch {}
          } }}>Add Note</Button></Grid>
        </Grid>
        <Divider sx={{ my:2 }} />
        <Typography variant="subtitle1" gutterBottom>Attachments</Typography>
        <Button size="small" variant="outlined" component="label" onChange={async (e:any)=>{
          const file = e?.target?.files?.[0];
          if (!file || DEMO) return;
          try {
            const form = new FormData();
            form.append('file', file);
            form.append('customer_id', id as string);
            await api.post('/api/v1/files/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
          } catch {}
        }}>Upload<input type="file" hidden /></Button>
      </TabPanel>

      <TabPanel value={value} index={9}>
        <Typography variant="subtitle1" gutterBottom>Reminders</Typography>
        <List dense>
          {reminders.map((r)=> (<ListItem key={r._id} divider><ListItemText primary={r.text || r.when} secondary={`When: ${r.when} • Frequency: ${r.frequency}`} /></ListItem>))}
        </List>
        <Grid container spacing={1} mt={1}>
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
            if (DEMO) { setReminders([...reminders, { _id:`r-${Date.now()}`, ...newReminder }]); setNewReminder({ when:'', frequency:'once' }); return; }
            try { await api.post('/api/v1/reminders/upsert', { customer_id: id, due_at: newReminder.when, frequency: newReminder.frequency, channel: 'email' }); const rres = await api.get('/api/v1/reminders/list', { params: { customer_id: id } }); setReminders((rres.data.items || []).map((r:any)=> ({ _id: r._id, when: r.due_at, frequency: r.frequency, text: r.message })));
            } catch {}
            setNewReminder({ when:'', frequency:'once' });
          }}>Add Reminder</Button></Grid>
        </Grid>
      </TabPanel>

      {/* Merge / Inactive / Delete confirms */}
      <Dialog open={openMerge} onClose={()=>setOpenMerge(false)}>
        <DialogTitle>Merge Contacts</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb:1 }}>Merge this contact into another. Enter target contact ID:</Typography>
          <TextField size="small" fullWidth label="Target Contact ID" value={mergeTargetId} onChange={e=>setMergeTargetId(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenMerge(false)}>Cancel</Button>
          <Button onClick={async ()=>{ if (!DEMO && mergeTargetId) { try { await api.post('/api/v1/contacts/merge', { primary_id: contact._id, duplicate_id: mergeTargetId }); } catch {} } setOpenMerge(false); setMergeTargetId(''); }}>Merge</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openInactive} onClose={()=>setOpenInactive(false)}>
        <DialogTitle>Mark Inactive</DialogTitle>
        <DialogContent>Mark this contact as inactive. They won’t show in active lists.</DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenInactive(false)}>Cancel</Button>
          <Button color="warning" onClick={async ()=>{ if(!DEMO){ try { await api.post('/api/v1/contacts/deactivate', { customer_id: contact._id }); } catch {} } setOpenInactive(false); }}>Mark Inactive</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDelete} onClose={()=>setOpenDelete(false)}>
        <DialogTitle>Delete Contact</DialogTitle>
        <DialogContent>This will permanently delete the contact. Ensure no active jobs or invoices before deleting.</DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenDelete(false)}>Cancel</Button>
          <Button color="error" onClick={async ()=>{ if(!DEMO){ try { await api.post('/api/v1/contacts/delete', { customer_id: contact._id }); } catch {} } setOpenDelete(false); }}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Service location modal (map placeholder + predictions) */}
      <Dialog open={openServiceMap} onClose={()=>setOpenServiceMap(false)} fullWidth maxWidth="md">
        <DialogTitle>Service Location</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Map preview (placeholder). Address prediction dropdown:</Typography>
          <FormControl fullWidth size="small" sx={{ mt:1 }}>
            <InputLabel>Prediction</InputLabel>
            <Select label="Prediction" value="" onChange={(e)=>{
              const pick = e.target.value as any;
              setServiceAddr({ ...serviceAddr, address1: pick });
            }}>
              <MenuItem value={"123 Main St, Fredericksburg VA 22401"}>123 Main St, Fredericksburg VA 22401</MenuItem>
              <MenuItem value={"2246 Elm St, Stafford VA 22554"}>2246 Elm St, Stafford VA 22554</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mt:2, height: 240, bgcolor: '#f0f2f5', borderRadius: 1, display:'flex', alignItems:'center', justifyContent:'center' }}>Map goes here</Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenServiceMap(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


