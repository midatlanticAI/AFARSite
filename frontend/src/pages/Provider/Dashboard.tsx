// @ts-nocheck
import { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Chip, Divider, LinearProgress, Stack, Button, List, ListItem, ListItemText, TextField, MenuItem } from '@mui/material';
import api from '@/services/api';

function StatCard({ title, value, delta }: { title: string; value: string; delta?: string }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
        <Typography variant="h5" sx={{ mt: 0.5 }}>{value}</Typography>
        {delta && <Typography variant="caption" color={delta.startsWith('-') ? 'error.main' : 'success.main'}>{delta}</Typography>}
      </CardContent>
    </Card>
  );
}

export default function ProviderDashboard() {
  const [range, setRange] = useState('month_to_date');
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    const run = async () => {
      try {
        const DEMO = ((import.meta as any).env?.VITE_DEMO ?? '1') === '1';
        if (DEMO) {
          setStats({
            revenuePace: '$32,602.47', revenuePaceDelta: '+18.8% from last month',
            jobsCompleted: '67', jobsCompletedDelta: '+13.6% from last month',
            newCustomers: '98', newCustomersDelta: '+19.5% from last month',
            totalPayments: '$9,676.64', totalPaymentsDelta: '-7.8% from last month',
            totalRevenue: '$12,620.31',
            arTotal: '$28,554.44',
            scheduledCount: 18,
            events: [
              { time: '8:00 AM - 10:00 AM', title: 'Otezya, Katrina', sub: 'Maklean' },
              { time: '8:00 AM - 10:00 AM', title: 'Roberson, Ben', sub: '—' },
            ],
          });
          return;
        }
        const res = await (await import('@/services/api')).default.get('/api/v1/reports/summary', { params: { range } });
        setStats(res.data || {});
      } catch {
        setStats({});
      }
    };
    run();
  }, [range]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'start', sm: 'center' }} mb={2} gap={1}>
        <Typography variant="h6">Today is {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Typography>
        <TextField select size="small" label="Range" value={range} onChange={(e)=>setRange(e.target.value)} sx={{ width: 200 }}>
          <MenuItem value="today">Today</MenuItem>
          <MenuItem value="week_to_date">Week to date</MenuItem>
          <MenuItem value="month_to_date">Month to date</MenuItem>
          <MenuItem value="last_30">Last 30 days</MenuItem>
        </TextField>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}><StatCard title="Revenue Pace" value={stats.revenuePace || '—'} delta={stats.revenuePaceDelta} /></Grid>
        <Grid item xs={12} md={4}><StatCard title="Jobs Completed" value={stats.jobsCompleted || '—'} delta={stats.jobsCompletedDelta} /></Grid>
        <Grid item xs={12} md={4}><StatCard title="New Customers" value={stats.newCustomers || '—'} delta={stats.newCustomersDelta} /></Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total Payments</Typography>
              <Typography variant="h5" sx={{ mt: 0.5 }}>{stats.totalPayments || '—'}</Typography>
              <Typography variant="caption" color="error.main">{stats.totalPaymentsDelta}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total Revenue</Typography>
              <Typography variant="h5" sx={{ mt: 0.5 }}>{stats.totalRevenue || '—'}</Typography>
              <Box mt={1}>
                {/* simple stacked bar */}
                <Box sx={{ display:'flex', height: 10, borderRadius: 1, overflow:'hidden' }}>
                  <Box flex={41} sx={{ bgcolor:'#4fc3f7' }} />
                  <Box flex={11} sx={{ bgcolor:'#64b5f6' }} />
                  <Box flex={14} sx={{ bgcolor:'#90caf9' }} />
                  <Box flex={6} sx={{ bgcolor:'#b3e5fc' }} />
                  <Box flex={4} sx={{ bgcolor:'#e1f5fe' }} />
                  <Box flex={3} sx={{ bgcolor:'#bbdefb' }} />
                  <Box flex={21} sx={{ bgcolor:'#e3f2fd' }} />
                </Box>
                <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                  <Chip size="small" label="41% Refrigerator" />
                  <Chip size="small" label="11% Washer" />
                  <Chip size="small" label="14% Range" />
                  <Chip size="small" label="6% MW" />
                  <Chip size="small" label="4% Freezer" />
                  <Chip size="small" label="3% Compactor" />
                  <Chip size="small" label="Others" />
                </Stack>
              </Box>
              <Button size="small" sx={{ mt:1 }}>View Full Report</Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Your Reminders</Typography>
              <Typography variant="body2" sx={{ mt:1 }}>No unresolved reminders.</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Show Me The Money</Typography>
              <Typography variant="h5" sx={{ mt: 0.5 }}>{stats.arTotal || '—'}</Typography>
              <Box mt={1}><LinearProgress variant="determinate" value={35} /></Box>
              <List dense>
                <ListItem><ListItemText primary="18% < 30 days" secondary="$5,137.08" /></ListItem>
                <ListItem><ListItemText primary="19% 31-90 days" secondary="$5,430.42" /></ListItem>
                <ListItem><ListItemText primary="63% > 91 days" secondary="$17,986.94" /></ListItem>
              </List>
              <Button size="small">View Full Report</Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Kickback</Typography>
              <Typography variant="body2" sx={{ mt:1 }}>Congrats! You met the payments quota — 5% off next month.</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" color="text.secondary">Events</Typography>
                <Chip label={`Scheduled ${stats.scheduledCount ?? 0}`} size="small" />
              </Stack>
              <Divider sx={{ my:1 }} />
              <List dense>
                {(stats.events || []).map((e: any, i: number) => (
                  <ListItem key={i} divider>
                    <ListItemText primary={e.time} secondary={`${e.title}${e.sub?` — ${e.sub}`:''}`} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}


