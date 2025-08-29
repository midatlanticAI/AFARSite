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
import ContactsPage from '@/pages/Provider/Contacts';
import ContactDetailPage from '@/pages/Provider/ContactDetail';
import JobDetailPage from '@/pages/Provider/JobDetail';
import SchedulePage from '@/pages/Provider/Schedule';
import CalendarPage from '@/pages/Provider/Calendar';
import ResourcesPage from '@/pages/Provider/Resources';
import ProviderDashboard from '@/pages/Provider/Dashboard';
import VoiceProPage from '@/pages/Provider/VoicePro';
import ChatProPage from '@/pages/Provider/ChatPro';
import SocialProPage from '@/pages/Provider/SocialPro';
import RepairProPage from '@/pages/Provider/RepairPro';
import MyApplianceHome from '@/pages/Customer/MyApplianceHome';
import MyApplianceProfile from '@/pages/Customer/MyApplianceProfile';
import ProfileAppliances from '@/pages/Customer/ProfileAppliances';
import DonorTechnician from '@/pages/Donor/Technician';
import DonorTechnicianLogin from '@/pages/Donor/TechnicianLogin';
import DonorMyApplianceHome from '@/pages/Donor/MyApplianceHome';
import DonorMyApplianceHomeCorporate from '@/pages/Donor/MyApplianceHomeCorporate';
import DonorMyApplianceLogin from '@/pages/Donor/MyApplianceLogin';
import DonorMyApplianceProfile from '@/pages/Donor/MyApplianceProfile';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Typography mt={10} textAlign="center">Unauthorized</Typography>} />

        <Route element={<RouteGuard allowed={["admin", "dispatcher", "technician", "billing"]} />}> 
          <Route path="/provider" element={<ProviderLayout />}>
            <Route index element={<Navigate to="jobs" replace />} />
            <Route path="dashboard" element={<ProviderDashboard />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="contact/:id" element={<ContactDetailPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="job/:id" element={<JobDetailPage />} />
            <Route path="dispatch" element={<DispatchBoard />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="resources" element={<ResourcesPage />} />
            <Route path="voicepro" element={<VoiceProPage />} />
            <Route path="chatpro" element={<ChatProPage />} />
            <Route path="socialpro" element={<SocialProPage />} />
            <Route path="repairpro" element={<RepairProPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
        </Route>

        <Route element={<RouteGuard allowed={["customer"]} />}> 
          <Route path="/my" element={<CustomerLayout />}>
            <Route index element={<CustomerHome />} />
          </Route>
        </Route>

        {/* Public MyAppliance routes (can later guard via customer role) */}
        <Route path="/myappliance" element={<MyApplianceHome />} />
        <Route path="/profile" element={<MyApplianceProfile />} />
        <Route path="/profile/appliances" element={<ProfileAppliances />} />

        {/* Donor adapter routes for quick access/testing */}
        <Route path="/technician" element={<DonorTechnician />} />
        <Route path="/technician-login" element={<DonorTechnicianLogin />} />
        <Route path="/myappliance-home" element={<DonorMyApplianceHome />} />
        <Route path="/myappliance-home-corporate" element={<DonorMyApplianceHomeCorporate />} />
        <Route path="/myappliance-login" element={<DonorMyApplianceLogin />} />
        <Route path="/myappliance-profile" element={<DonorMyApplianceProfile />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
} 