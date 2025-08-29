// @ts-nocheck
import { useEffect, useState } from 'react';
import { Box, Typography, TextField, IconButton, Button, Chip, Stack, Link, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BreadcrumbsNav from '@/components/BreadcrumbsNav';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import api from '@/services/api';
import ContactFormDialog from '@/components/ContactFormDialog';
import { useNavigate } from 'react-router-dom';

export default function ContactsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState(() => localStorage.getItem('contacts_q') || '');
  const [alpha, setAlpha] = useState<string>(() => localStorage.getItem('contacts_alpha') || 'All');
  const navigate = useNavigate();
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [toDelete, setToDelete] = useState<any | null>(null);
  const DEMO = ((import.meta as any).env?.VITE_DEMO ?? '1') === '1';

  const displayName = (r:any) => r?.name || `${r?.last_name || ''}${(r?.last_name && r?.first_name)?', ':''}${r?.first_name || ''}`;
  const fullAddress = (a:any) => [a?.address1, a?.address2, `${a?.city || ''} ${a?.state || ''} ${a?.zip_code || ''}`.trim(), a?.country].filter(Boolean).join('\n');
  const columns = [
    { field: 'name', headerName: 'Name', width: 280, sortable: true, renderCell:(p:any)=> (
      <Stack direction="row" alignItems="center" spacing={1} sx={{ py:0.5 }}>
        <PersonOutlineIcon fontSize="small" color="action" />
        <Link component="button" onClick={(e)=>{ e.stopPropagation(); navigate(`/provider/contact/${p.row._id}`); }} underline="hover">
          {displayName(p.row)}
        </Link>
      </Stack>
    )},
    { field: 'service_address', headerName: 'Service Address', width: 320, sortable:false, renderCell:(p:any)=> (
      <Typography variant="body2" sx={{ whiteSpace:'pre-line' }}>{fullAddress(p?.row?.service_address || {})}</Typography>
    )},
    { field: 'phone_email', headerName: 'Phone/Email', width: 260, sortable:false, renderCell:(p:any)=> {
      const phone = p?.row?.primary_phone || p?.row?.phones?.[0]?.number;
      const email = p?.row?.primary_email || (p?.row?.emails || [])[0];
      return (
        <Stack>
          <Link href={phone?`tel:${phone}`:undefined} underline="hover">{phone || '—'}</Link>
          <Link href={email?`mailto:${email}`:undefined} underline="hover">{email || '—'}</Link>
        </Stack>
      );
    }},
    { field: 'last_service', headerName: 'Last Completed Service', width: 280, sortable:false, valueGetter:()=> '' },
    { field: 'actions', headerName: 'Actions', width: 160, sortable:false, filterable:false, renderCell:(p:any)=> (
      <Stack direction="row" gap={1}>
        <Button size="small" onClick={(e)=>{ e.stopPropagation(); navigate(`/provider/contact/${p.row._id}`); }}>View</Button>
        <Button size="small" variant="outlined" onClick={(e)=>{ e.stopPropagation(); setEditing(p.row); setOpenForm(true); }}>Edit</Button>
        <Button size="small" color="error" onClick={(e)=>{ e.stopPropagation(); setToDelete(p.row); }}>Delete</Button>
      </Stack>
    )},
  ];

  const fetchData = async () => {
    const demo = [
      { _id: 'contact-001', customer_number: 1001, name: 'Alice Johnson', primary_phone: '555-111-0001', primary_email: 'alice@example.com', service_address:{city:'Fredericksburg',state:'VA'}, tags:['vip'] },
      { _id: 'contact-002', customer_number: 1002, name: 'Bob Smith', primary_phone: '555-111-0002', primary_email: 'bob@example.com', service_address:{city:'Stafford',state:'VA'}, tags:['pm'] },
    ];
    if (DEMO) { setRows(demo); return; }
    try {
      const res = await api.get('/api/v1/contacts/list', { params: { q } });
      const items = res.data.items || [];
      setRows(items.length ? items : demo);
    } catch { setRows(demo); }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { localStorage.setItem('contacts_q', q); }, [q]);
  useEffect(() => { localStorage.setItem('contacts_alpha', alpha); }, [alpha]);

  const alphaKeys = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
  const filtered = rows.filter(r => {
    if (alpha === 'All') return true;
    const n = (displayName(r) || '').trim();
    return n.toUpperCase().startsWith(alpha);
  });

  return (
    <Box sx={{ display:'flex', flexDirection:'column', height:'calc(100vh - 112px)' }}>
      <BreadcrumbsNav items={[{ label: 'Dashboard', to: '/provider/dashboard' }, { label: 'Contacts' }]} />
      <Typography variant="h5" gutterBottom>Contacts</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField size="small" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <IconButton color="primary" onClick={fetchData}><SearchIcon /></IconButton>
        <Button variant="outlined" onClick={async()=>{ try { const res = await api.get('/api/v1/contacts/export', { responseType: 'blob' }); const blob = new Blob([res.data], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'contacts.csv'; a.click(); URL.revokeObjectURL(url); } catch {} }}>Export</Button>
        <Button variant="outlined" component="label">Import CSV<input type="file" accept=".csv,text/csv" hidden onChange={async (e:any)=>{ const file = e.target.files?.[0]; if(!file) return; const form = new FormData(); form.append('file', file); try { await api.post('/api/v1/contacts/import', form); await fetchData(); } catch {} e.target.value=''; }} /></Button>
        <Button variant="contained" onClick={()=>{ setEditing(null); setOpenForm(true); }}>New Contact</Button>
      </Box>
      <Box sx={{ display:'flex', alignItems:'center', gap:1, flexWrap:'wrap', mb:1 }}>
        {alphaKeys.map(k => (
          <Button key={k} size="small" variant={alpha===k?'contained':'outlined'} onClick={()=>setAlpha(k)}>{k}</Button>
        ))}
        <Box sx={{ flex:1 }} />
      </Box>
      <Box sx={{ flex:1, minHeight: 0 }}>
        <DataGrid
          rows={filtered}
          getRowId={(r) => r._id}
          columns={columns}
          onRowClick={(p) => navigate(`/provider/contact/${p.row._id}`)}
          disableRowSelectionOnClick
          initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
          pageSizeOptions={[10,25,50]}
          disableColumnMenu
          density="comfortable"
        />
      </Box>
      <ContactFormDialog
        open={openForm}
        initial={editing}
        onClose={()=>setOpenForm(false)}
        onSaved={async (payload)=>{ await api.post('/api/v1/contacts/upsert', payload); await fetchData(); }}
      />
      <Dialog open={!!toDelete} onClose={()=>setToDelete(null)}>
        <DialogTitle>Delete Contact</DialogTitle>
        <DialogContent>Are you sure you want to delete {displayName(toDelete||{})}?</DialogContent>
        <DialogActions>
          <Button onClick={()=>setToDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={async ()=>{ try { await api.post('/api/v1/contacts/delete', { customer_id: toDelete._id }); } catch {} finally { setToDelete(null); await fetchData(); } }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


