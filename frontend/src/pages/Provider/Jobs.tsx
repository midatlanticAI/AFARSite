// @ts-nocheck
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'customer', headerName: 'Customer', width: 150 },
  { field: 'status', headerName: 'Status', width: 130 },
];

const rows = [
  { id: '1', customer: 'Alice', status: 'created' },
  { id: '2', customer: 'Bob', status: 'scheduled' },
];

export default function JobsPage() {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Jobs</Typography>
      <Box sx={{ height: 400 }}>
        <DataGrid rows={rows} columns={columns} disableRowSelectionOnClick />
      </Box>
    </Box>
  );
} 