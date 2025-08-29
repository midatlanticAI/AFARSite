// @ts-nocheck
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, TextField, Switch, FormControlLabel, Button, Chip, Stack, IconButton, Snackbar, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

type Contact = any;

export default function ContactFormDialog({ open, onClose, initial, onSaved }: {
  open: boolean;
  onClose: () => void;
  initial?: Contact;
  onSaved: (payload: any) => Promise<void> | void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isCompany, setIsCompany] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [pocName, setPocName] = useState('');
  const [phones, setPhones] = useState<any[]>([{ number: '', can_text: true }]);
  const [emails, setEmails] = useState<string[]>(['']);
  const [service, setService] = useState<any>({});
  const [billing, setBilling] = useState<any>({});
  const [taxExempt, setTaxExempt] = useState(false);
  const [source, setSource] = useState('');
  const [special, setSpecial] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const MAX_PHONES = 3;
  const MAX_EMAILS = 3;
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (open) {
      const c = initial || {};
      setFirstName(c.first_name || '');
      setLastName(c.last_name || '');
      setIsCompany(!!c.is_company);
      setPhones(c.phones?.length ? c.phones : [{ number: '', can_text: true }]);
      setEmails(c.emails?.length ? c.emails : ['']);
      setService(c.service_address || {});
      setBilling(c.billing_address || {});
      setTaxExempt(!!c.tax_exempt);
      setSource(c.source || '');
      setSpecial(c.special_instructions || '');
      setTags(c.tags || []);
      setCompanyName(c.name || '');
      setPocName(c.first_name || c.last_name ? `${c.first_name || ''} ${c.last_name || ''}`.trim() : '');
    }
  }, [open, initial]);

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
    const cleanedEmails = emails.map(e => (e || '').trim()).filter(e => !!e);
    const cleanedPhones = phones
      .map((p:any) => ({ ...p, number: (p.number || '').trim() }))
      .filter((p:any) => p.number.length >= 3);

    const normalizeAddress = (addr: any) => {
      const a = addr || {};
      const countryRaw = (a.country || '').trim();
      let country = countryRaw;
      if (!country) country = 'US';
      const m = countryRaw.toLowerCase();
      if (m === 'united states' || m === 'usa' || m === 'u.s.' || m === 'united states of america') country = 'US';
      if (country.length > 2) country = 'US';
      const clean = (v:any) => {
        if (v === undefined || v === null) return undefined;
        const s = String(v).trim();
        return s.length ? s : undefined;
      };
      return {
        address1: clean(a.address1),
        address2: clean(a.address2),
        city: clean(a.city),
        state: clean(a.state),
        zip_code: clean(a.zip_code),
        country,
      };
    };

    const payload = {
      id: initial?._id,
      first_name: isCompany ? undefined : firstName,
      last_name: isCompany ? undefined : lastName,
      name: isCompany ? (companyName || undefined) : undefined,
      is_company: isCompany,
      phones: cleanedPhones,
      emails: cleanedEmails,
      primary_phone: cleanedPhones?.[0]?.number,
      primary_email: cleanedEmails?.[0] || undefined,
      service_address: normalizeAddress(service),
      billing_address: normalizeAddress(billing),
      tax_exempt: taxExempt,
      source,
      special_instructions: special,
      tags,
      additional_contacts: isCompany && pocName ? [{ name: pocName }] : [],
      idempotency_key: `contact-${initial?._id || 'new'}-${Date.now()}`,
    };
    try {
      setSaving(true);
      await onSaved(payload);
      onClose();
    } catch (e:any) {
      const detail = e?.response?.data?.detail;
      let msg: any = detail || e?.message || 'Failed to save contact';
      if (Array.isArray(detail)) {
        msg = detail.map((it:any)=> {
          const loc = Array.isArray(it?.loc) ? it.loc.join('.') : '';
          return `${loc ? loc+': ' : ''}${it?.msg || JSON.stringify(it)}`;
        }).join('; ');
      } else if (typeof msg === 'object') {
        msg = JSON.stringify(msg);
      }
      // Also log raw error for debugging
      try { console.error('Contact save error', e?.response?.data || e); } catch {}
      setErrorMsg(String(msg));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{initial?._id ? 'Edit Contact' : 'New Contact'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}><FormControlLabel control={<Switch checked={isCompany} onChange={(e)=>setIsCompany(e.target.checked)} />} label="Company" /></Grid>
          {!isCompany && (<>
            <Grid item xs={12} md={6}><TextField label="First Name" size="small" fullWidth value={firstName} onChange={(e)=>setFirstName(e.target.value)} /></Grid>
            <Grid item xs={12} md={6}><TextField label="Last Name" size="small" fullWidth value={lastName} onChange={(e)=>setLastName(e.target.value)} /></Grid>
          </>)}
          {isCompany && (<>
            <Grid item xs={12} md={6}><TextField label="Company Name" size="small" fullWidth value={companyName} onChange={(e)=>setCompanyName(e.target.value)} /></Grid>
            <Grid item xs={12} md={6}><TextField label="POC (Point of Contact)" size="small" fullWidth value={pocName} onChange={(e)=>setPocName(e.target.value)} helperText="Optional" /></Grid>
          </>)}

          <Grid item xs={12}><strong>Phones</strong></Grid>
          {phones.map((p, i) => (
            <Grid key={i} item xs={12} container spacing={1} alignItems="center">
              <Grid item xs={8}><TextField size="small" label={`Phone ${i+1}`} fullWidth value={p.number} onChange={(e)=>{ const n=[...phones]; n[i]={...n[i], number:e.target.value}; setPhones(n);} } /></Grid>
              <Grid item xs={4}><FormControlLabel control={<Switch checked={!!p.can_text} onChange={(e)=>{ const n=[...phones]; n[i]={...n[i], can_text:e.target.checked}; setPhones(n);} } />} label="Can text" /></Grid>
            </Grid>
          ))}
          <Grid item xs={12}><IconButton size="small" onClick={addPhone} disabled={phones.length >= MAX_PHONES}><AddIcon fontSize="small" /> Add phone</IconButton></Grid>

          <Grid item xs={12}><strong>Emails</strong></Grid>
          {emails.map((em, i) => (
            <Grid key={i} item xs={12}><TextField size="small" label={`Email ${i+1}`} fullWidth value={em} onChange={(e)=>{ const n=[...emails]; n[i]=e.target.value; setEmails(n);} } /></Grid>
          ))}
          <Grid item xs={12}><IconButton size="small" onClick={addEmail} disabled={emails.length >= MAX_EMAILS}><AddIcon fontSize="small" /> Add email</IconButton></Grid>

          <Grid item xs={12}><strong>Service Address</strong></Grid>
          <Grid item xs={12} md={6}><TextField size="small" label="Address 1" fullWidth value={service.address1||''} onChange={(e)=>setService({...service,address1:e.target.value})} /></Grid>
          <Grid item xs={12} md={6}><TextField size="small" label="Address 2" fullWidth value={service.address2||''} onChange={(e)=>setService({...service,address2:e.target.value})} /></Grid>
          <Grid item xs={12} md={3}><TextField size="small" label="City" fullWidth value={service.city||''} onChange={(e)=>setService({...service,city:e.target.value})} /></Grid>
          <Grid item xs={12} md={2}><TextField size="small" label="State" fullWidth value={service.state||''} onChange={(e)=>setService({...service,state:e.target.value})} /></Grid>
          <Grid item xs={12} md={3}><TextField size="small" label="Zip" fullWidth value={service.zip_code||''} onChange={(e)=>setService({...service,zip_code:e.target.value})} /></Grid>
          <Grid item xs={12} md={2}><TextField size="small" label="Country" fullWidth value={service.country||''} onChange={(e)=>setService({...service,country:e.target.value})} /></Grid>

          <Grid item xs={12}><strong>Billing Address</strong></Grid>
          <Grid item xs={12} md={6}><TextField size="small" label="Address 1" fullWidth value={billing.address1||''} onChange={(e)=>setBilling({...billing,address1:e.target.value})} /></Grid>
          <Grid item xs={12} md={6}><TextField size="small" label="Address 2" fullWidth value={billing.address2||''} onChange={(e)=>setBilling({...billing,address2:e.target.value})} /></Grid>
          <Grid item xs={12} md={3}><TextField size="small" label="City" fullWidth value={billing.city||''} onChange={(e)=>setBilling({...billing,city:e.target.value})} /></Grid>
          <Grid item xs={12} md={2}><TextField size="small" label="State" fullWidth value={billing.state||''} onChange={(e)=>setBilling({...billing,state:e.target.value})} /></Grid>
          <Grid item xs={12} md={3}><TextField size="small" label="Zip" fullWidth value={billing.zip_code||''} onChange={(e)=>setBilling({...billing,zip_code:e.target.value})} /></Grid>
          <Grid item xs={12} md={2}><TextField size="small" label="Country" fullWidth value={billing.country||''} onChange={(e)=>setBilling({...billing,country:e.target.value})} /></Grid>

          <Grid item xs={12} md={4}><TextField size="small" label="Source" fullWidth value={source} onChange={(e)=>setSource(e.target.value)} /></Grid>
          <Grid item xs={12} md={4}><FormControlLabel control={<Switch checked={taxExempt} onChange={(e)=>setTaxExempt(e.target.checked)} />} label="Tax Exempt" /></Grid>
          <Grid item xs={12}><TextField size="small" label="Special Instructions" fullWidth multiline rows={3} value={special} onChange={(e)=>setSpecial(e.target.value)} /></Grid>
          <Grid item xs={12}>
            <Stack direction="row" gap={1} flexWrap="wrap">
              {tags.map((t, i) => <Chip key={i} label={t} />)}
              <IconButton size="small" onClick={addTag}><AddIcon fontSize="small" /> Add tag</IconButton>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>Save</Button>
      </DialogActions>
      <Snackbar open={!!errorMsg} autoHideDuration={4000} onClose={()=>setErrorMsg('')}>
        <Alert severity="error" variant="filled" onClose={()=>setErrorMsg('')}>{errorMsg}</Alert>
      </Snackbar>
    </Dialog>
  );
}


