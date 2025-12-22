import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FundRequisitionForm from './components/AdminOfficer/FundRequisitionForm';
// // import RequestFundModal from '../../components/AdminOfficer/RequestFundModal';
import Login from './pages/Auth/Login';
import SuperadminDashboard from './pages/Superadmin/SuperadminDashboard';
import ManagerDashboard from './pages/Managers/ManagerDashboard';
import HOCLayout from './pages/HOC/HOCLayout';
import HOCHome from './pages/HOC/Home';
import HOCClients from './pages/HOC/Clients';
import HOCClientDetails from './pages/HOC/ClientDetails';
import HOCCases from './pages/HOC/Cases';
import HOCCaseDetails from './pages/HOC/CaseDetails';
import HOCFunds from './pages/HOC/Funds';
import HOCDocuments from './pages/HOC/Documents'; // HOC Documents Page
import HOCNotifications from './pages/HOC/Notifications';
import HOCSupport from './pages/HOC/Support';
import HOCReportThread from './pages/HOC/HOCReportThread';
import LawyerDashboard from './pages/Lawyers/LawyerDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminHome from './pages/Admin/AdminHome';
import ClientManagement from './pages/Admin/ClientManagement';
import AddClientForm from './components/AdminOfficer/AddClientForm';
import ClientDetails from './pages/Admin/ClientDetails';
import EditClientForm from './components/AdminOfficer/EditClientForm';
import AddCaseForm from './components/AdminOfficer/AddCaseForm';
import EditCaseForm from './components/AdminOfficer/EditCaseForm';
import CaseDetails from './pages/Admin/CaseDetails';
import CasesPage from './pages/Admin/CasesPage';
import FundRequisitionList from './pages/Admin/FundRequisitionList';
import Notifications from './pages/Admin/Notifications';
import Documents from './pages/Admin/Documents';
import Support from './pages/Admin/Support';
import Meetings from './pages/Admin/Meetings';
import Broadcast from './pages/Admin/Broadcast';
import Tasks from './pages/Admin/Tasks';
import TaskDetails from './pages/Admin/TaskDetails';
import ComplaintDetails from './pages/Admin/ComplaintDetails';
import OAuthCallback from './pages/OAuthCallback';
import ParalegalDashboard from './pages/Paralegals/ParalegalDashboard';
import ClientPortalLayout from './pages/Client/ClientPortalLayout';
import ClientOverview from './pages/Client/ClientOverview';
import ClientCases from './pages/Client/ClientCases';
import ClientMeetings from './pages/Client/ClientMeetings';
import ClientNotifications from './pages/Client/ClientNotifications';
import ClientComplaints from './pages/Client/ClientComplaints';
import ClientComplaintDetails from './pages/Client/ClientComplaintDetails';
import ClientPortalCaseView from './pages/Client/ClientPortalCaseView';
import ClientReportThread from './pages/Client/ClientReportThread';
import './App.css';

// Force update
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Public Client Portal Routes */}
        {/* Public Client Portal Routes */}
        <Route path="/client-portal/:shareToken" element={<ClientPortalLayout />}>
          <Route index element={<ClientOverview />} />
          <Route path="cases" element={<ClientCases />} />
          <Route path="meetings" element={<ClientMeetings />} />
          <Route path="notifications" element={<ClientNotifications />} />
          <Route path="complaints" element={<ClientComplaints />} />
          <Route path="complaints/:complaintId" element={<ClientComplaintDetails />} />
          <Route path="case/:caseId" element={<ClientPortalCaseView />} />
          <Route path="case/:caseId/report/:reportId" element={<ClientReportThread />} />
        </Route>

        {/* Role-based Routes */}
        <Route path="/superadmin/*" element={<SuperadminDashboard />} />
        <Route path="/manager/*" element={<ManagerDashboard />} />

        {/* HOC Routes */}
        <Route path="/hoc" element={<HOCLayout />}>
          <Route index element={<HOCHome />} />
          <Route path="clients" element={<HOCClients />} />
          <Route path="clients/:id" element={<HOCClientDetails />} />
          <Route path="cases" element={<HOCCases />} />
          <Route path="cases/add" element={<AddCaseForm />} />
          <Route path="cases/edit/:id" element={<EditCaseForm />} />
          <Route path="cases/:id" element={<HOCCaseDetails />} />
          <Route path="cases/:caseId/report/:reportId" element={<HOCReportThread />} />
          <Route path="funds" element={<HOCFunds />} />
          <Route path="funds/request" element={<FundRequisitionForm />} />
          <Route path="documents" element={<HOCDocuments />} />
          <Route path="notifications" element={<HOCNotifications />} />
          <Route path="support" element={<HOCSupport />} />
        </Route>

        <Route path="/lawyer/*" element={<LawyerDashboard />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<AdminHome />} />
          <Route path="clients" element={<ClientManagement />} />
          <Route path="clients/add" element={<AddClientForm />} />
          <Route path="clients/edit/:id" element={<EditClientForm />} />
          <Route path="clients/:id" element={<ClientDetails />} />
          <Route path="cases" element={<CasesPage />} />
          <Route path="cases/add" element={<AddCaseForm />} />
          <Route path="cases/edit/:id" element={<EditCaseForm />} />
          <Route path="cases/:id" element={<CaseDetails />} />
          <Route path="funds" element={<FundRequisitionList />} />
          <Route path="funds/request" element={<FundRequisitionForm />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="documents" element={<Documents />} />
          <Route path="support" element={<Support />} />
          <Route path="meetings" element={<Meetings />} />
          <Route path="broadcast" element={<Broadcast />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/:id" element={<TaskDetails />} />
          <Route path="complaints/:id" element={<ComplaintDetails />} />
        </Route>

        <Route path="/paralegal/*" element={<ParalegalDashboard />} />

        {/* OAuth Callback */}
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
