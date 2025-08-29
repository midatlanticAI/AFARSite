// @ts-nocheck
import { useState } from 'react';
import { Typography, Box, Tabs, Tab, Paper } from '@mui/material';

function TabPanel({ children, value, index }: any) {
  return <div role="tabpanel" hidden={value !== index}>{value === index && <Box pt={2}>{children}</Box>}</div>;
}

export default function BillingPage() {
  const [value, setValue] = useState(0);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const DEMO = ((import.meta as any).env?.VITE_DEMO ?? '1') === '1';

  const load = async () => {
    if (DEMO) { setInvoices([{ _id:'inv-001', number:'10001', status:'unpaid' }]); setPayments([]); setRefunds([]); return; }
    try { const inv = await api.get('/api/v1/billing/invoices', { params: { limit: 200 } }); setInvoices(inv.data.items || []); } catch { setInvoices([]); }
    try { const pay = await api.get('/api/v1/billing/payments', { params: { limit: 200 } }); setPayments(pay.data.items || []); } catch { setPayments([]); }
    try { const rf = await api.get('/api/v1/billing/refunds', { params: { limit: 200 } }); setRefunds(rf.data.items || []); } catch { setRefunds([]); }
  };

  useEffect(()=>{ load(); }, []);
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Billing</Typography>
      <Tabs value={value} onChange={(_, v) => setValue(v)}>
        <Tab label="Invoices" />
        <Tab label="Payments" />
        <Tab label="Refunds" />
        <Tab label="QuickBooks Sync" />
      </Tabs>
      <TabPanel value={value} index={0}>
        <Paper sx={{ p:2 }}>
          {invoices.length === 0 ? 'No invoices' : invoices.map((i:any)=> (
            <Box key={i._id} sx={{ display:'flex', justifyContent:'space-between', py:0.5, borderBottom:'1px solid #eee' }}>
              <span>Invoice {i.number || i._id}</span>
              <span>{i.status}</span>
            </Box>
          ))}
        </Paper>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Paper sx={{ p:2 }}>
          {payments.length === 0 ? 'No payments' : payments.map((p:any)=> (
            <Box key={p._id} sx={{ display:'flex', justifyContent:'space-between', py:0.5, borderBottom:'1px solid #eee' }}>
              <span>${p.amount_usd}</span>
              <span>{p.method}</span>
            </Box>
          ))}
        </Paper>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Paper sx={{ p:2 }}>
          {refunds.length === 0 ? 'No refunds' : refunds.map((r:any)=> (
            <Box key={r._id} sx={{ display:'flex', justifyContent:'space-between', py:0.5, borderBottom:'1px solid #eee' }}>
              <span>${r.amount_usd}</span>
              <span>{r.reason || ''}</span>
            </Box>
          ))}
        </Paper>
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Paper sx={{ p:2 }}>QuickBooks bulk sync controls coming soon…</Paper>
      </TabPanel>
    </Box>
  );
}