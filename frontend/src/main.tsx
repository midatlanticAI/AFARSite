// @ts-nocheck
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import App from './App';
import '@/styles/global.css';
import '@/i18n/setup';
import { Snackbar, Alert } from '@mui/material';

function GlobalErrorSnackbar() {
  const [open, setOpen] = React.useState(false);
  const [msg, setMsg] = React.useState('');

  React.useEffect(() => {
    const handler = (e: any) => {
      setMsg(e?.detail?.message || 'Request failed');
      setOpen(true);
    };
    window.addEventListener('api-error', handler as any);
    return () => window.removeEventListener('api-error', handler as any);
  }, []);

  return (
    <Snackbar open={open} autoHideDuration={4000} onClose={()=>setOpen(false)}>
      <Alert severity="error" variant="filled" onClose={()=>setOpen(false)}>{msg}</Alert>
    </Snackbar>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
        <GlobalErrorSnackbar />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
); 