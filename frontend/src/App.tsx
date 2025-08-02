// @ts-nocheck
import { Routes, Route, Navigate } from 'react-router-dom';
import ProviderLayout from '@/layouts/ProviderLayout';
import CustomerLayout from '@/layouts/CustomerLayout';
import JobsPage from '@/pages/Provider/Jobs';
import DispatchBoard from '@/pages/Provider/Dispatch';
import BillingPage from '@/pages/Provider/Billing';
import ReportsPage from '@/pages/Provider/Reports';
import CustomerHome from '@/pages/Customer/Home';
import { AuthProvider } from '@/contexts/AuthContext';
import RouteGuard from '@/components/RouteGuard';
import LoginPage from '@/pages/Login';
import { Typography } from '@mui/material';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Typography mt={10} textAlign="center">Unauthorized</Typography>} />

        <Route element={<RouteGuard allowed={["admin", "dispatcher", "technician", "billing"]} />}> 
          <Route path="/provider" element={<ProviderLayout />}>
            <Route index element={<Navigate to="jobs" replace />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="dispatch" element={<DispatchBoard />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
        </Route>

        <Route element={<RouteGuard allowed={["customer"]} />}> 
          <Route path="/my" element={<CustomerLayout />}>
            <Route index element={<CustomerHome />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
} 