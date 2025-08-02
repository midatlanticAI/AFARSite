// @ts-nocheck
import { Grid, Card, CardContent, Typography } from '@mui/material';

const cards = [
  { title: 'Next Appointment', value: 'Aug 12, 10:00 AM' },
  { title: 'Open Invoices', value: '$120.00' },
  { title: 'Triage Center', value: 'Start' },
];

export default function CustomerHome() {
  return (
    <Grid container spacing={2}>
      {cards.map((c) => (
        <Grid item xs={12} sm={4} key={c.title}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">{c.title}</Typography>
              <Typography variant="h6">{c.value}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
} 