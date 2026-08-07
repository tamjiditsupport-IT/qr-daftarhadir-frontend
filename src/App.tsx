import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Asatidz from './pages/Asatidz';
import Meetings from './pages/Meetings';
import MeetingDetail from './pages/MeetingDetail';
import Approvals from './pages/Approvals';
import MasterData from './pages/MasterData';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';
import Reports from './pages/Reports';
import SystemSettings from './pages/SystemSettings';
import Calendar from './pages/Calendar';
import MeetingMonitor from './pages/MeetingMonitor';
import AsatidzDetail from './pages/AsatidzDetail';
import RolesPermissions from './pages/RolesPermissions';
import Scanner from './pages/Scanner';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/asatidz" element={<Asatidz />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/meetings/:id" element={<MeetingDetail />} />
            <Route path="/meetings/:id/monitor" element={<MeetingMonitor />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/master-data" element={<MasterData />} />
            <Route path="/users" element={<Users />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/settings" element={<SystemSettings />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/asatidz/:id" element={<AsatidzDetail />} />
            <Route path="/roles-permissions" element={<RolesPermissions />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
