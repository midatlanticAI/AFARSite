// @ts-nocheck
import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, Tabs, Tab, Paper, Chip, Link } from '@mui/material';
import api from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import ContactFormDialog from '@/components/ContactFormDialog';
import JobQuickCreateDialog from '@/components/JobQuickCreateDialog';
import OpportunityFormDialog from '@/components/OpportunityFormDialog';
import { demoOpps } from '@/services/demoStore';
import BreadcrumbsNav from '@/components/BreadcrumbsNav';
import { Box as MBox } from '@mui/material';

const statusColor: Record<string, any> = {
  created: 'default',
  unscheduled: 'default',
  scheduled: 'info',
  in_progress: 'success',
  on_hold: 'warning',
  completed: 'secondary',
};

const jobColumns = (nav: any) => [
  { field: '_id', headerName: '#', width: 120 },
  { field: 'title', headerName: 'Job', width: 220, valueGetter:(p:any)=> (p?.row?.title ?? 'Normal') },
  { field: 'customer_name', headerName: 'Contact', width: 220, renderCell:(p:any)=> (
    <Link component="button" onClick={(e)=>{ e.stopPropagation(); nav(`/provider/contacts?q=${encodeURIComponent(p.row.customer_name||'')}`); }}>{p.row.customer_name}</Link>
  ) },
  { field: 'assigned_to', headerName: 'Assigned to', width: 160 },
  { field: 'created_at', headerName: 'Created', width: 160 },
  { field: 'status', headerName: 'Status', width: 160, renderCell:(p:any)=> (<Chip size="small" label={(p.value||'').replaceAll('_',' ')} color={statusColor[p.value||'created']} />) },
];

const oppColumns = [
  { field: '_id', headerName: '#', width: 120 },
  { field: 'title', headerName: 'Opportunity', width: 260 },
  { field: 'customer_name', headerName: 'Contact', width: 220 },
  { field: 'status', headerName: 'Stage', width: 160 },
  { field: 'value', headerName: 'Value', width: 120 },
];

export default function JobsPage() {
  const [tab, setTab] = useState(0);
  const [rows, setRows] = useState<any[]>([]);
  const [opps, setOpps] = useState<any[]>([]);
  const nav = useNavigate();
  const [openNew, setOpenNew] = useState(false);
  const [openJob, setOpenJob] = useState(false);
  const [openOpp, setOpenOpp] = useState(false);
  const DEMO = ((import.meta as any).env?.VITE_DEMO ?? '1') === '1';

  useEffect(() => {
    const demoRows = [
      { _id: 'demo-001', title: 'Normal', customer_name: 'Alice Johnson', status: 'created' },
      { _id: 'demo-002', title: 'Normal', customer_name: 'Bob Smith', status: 'scheduled' },
      { _id: 'demo-003', title: 'Normal', customer_name: 'Carol Davis', status: 'completed' },
    ];
    if (DEMO) {
      setRows(demoRows);
      const stored = demoOpps.listAll();
      setOpps(stored.length ? stored : [
        { _id: 'opp-001', title: 'Refrigerator Repair', customer_name: 'Mary McIntosh', status: 'new', value: 0, customer_id: 'contact-001' },
        { _id: 'opp-002', title: 'Dishwasher Repair', customer_name: 'Rachael Pratt', status: 'lost', value: 0, customer_id: 'contact-002' },
      ]);
      if (!stored.length) { stored.push(...opps); }
      return;
    }
    const run = async () => {
      try {
        const res = await api.get('/api/v1/jobs/list');
        const items = res.data.items || [];
        setRows(items.length ? items : demoRows);
      } catch {
        setRows(demoRows);
      }
      try {
        const o = await api.get('/api/v1/opportunities/list', { params: { limit: 200 } });
        setOpps(o.data.items || []);
      } catch { setOpps([]); }
    };
    run();
  }, []);

  return (
    <Box>
      <BreadcrumbsNav items={[{ label: 'Dashboard', to: '/provider/dashboard' }, { label: 'Jobs' }]} />
      <Typography variant="h5" gutterBottom>Jobs</Typography>
      <Stack direction="row" gap={1} sx={{ mb:1 }}>
        <Button variant="contained" onClick={()=>setOpenJob(true)}>New Job</Button>
      </Stack>
      <Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{ mb:1 }}>
        <Tab label="Jobs" />
        <Tab label="Opportunities" />
        <Tab label="Invoices" />
      </Tabs>
      {tab===0 && (
        <>
          <Box sx={{ height: 520 }}>
            <DataGrid rows={rows} getRowId={(r) => r._id} columns={jobColumns(nav)} disableRowSelectionOnClick onRowDoubleClick={(p) => nav(`/provider/job/${p.row._id}`)} />
          </Box>
        </>
      )}
      {tab===1 && (
        <>
          <MBox sx={{ display:'flex', gap:1, mb:1, flexWrap:'wrap' }}>
            {['new','unscheduled','estimate_scheduled','estimate_sent','estimate_viewed','lost'].map(stage => (
              <Chip key={stage} label={`${stage.replaceAll('_',' ')}`} variant="outlined" />
            ))}
          </MBox>
          <Stack direction="row" mb={1} gap={1}>
            <Button variant="contained" onClick={()=>setOpenOpp(true)}>Add Opportunity</Button>
          </Stack>
          <Box sx={{ height: 520 }}>
            <DataGrid rows={opps} getRowId={(r)=> r._id} columns={oppColumns} disableRowSelectionOnClick />
          </Box>
          <OpportunityFormDialog open={openOpp} onClose={()=>setOpenOpp(false)} onSaved={async (o)=> {
            if (DEMO) { const item = { _id: o._id || `opp-${Date.now()}`, ...o }; setOpps([...opps, item]); demoOpps.add(item); return; }
            try { await api.post('/api/v1/opportunities/upsert', { customer_id: (o as any).customer_id || 'unknown', title: o.title, status: o.status || 'open' });
              const res = await api.get('/api/v1/opportunities/list', { params: { limit: 200 } }); setOpps(res.data.items || []);
            } catch {}
          }} />
        </>
      )}
      {tab===2 && (
        <Paper sx={{ p:2 }}>Invoices list coming soon…</Paper>
      )}
      <ContactFormDialog open={openNew} onClose={()=>setOpenNew(false)} onSaved={async (payload)=>{ await api.post('/api/v1/contacts/upsert', payload); }} />
      <JobQuickCreateDialog open={openJob} onClose={()=>setOpenJob(false)} onCreated={async ()=>{ try { const res = await api.get('/api/v1/jobs/list'); setRows(res.data.items || []); } catch {} }} />
    </Box>
  );
}