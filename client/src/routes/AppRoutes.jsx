import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts - Static Imports to avoid layout flickering
import PublicLayout from '../layouts/PublicLayout';
import ResidentLayout from '../layouts/ResidentLayout';
import AdminLayout from '../layouts/AdminLayout';
import SecurityLayout from '../layouts/SecurityLayout';
import SuperAdminLayout from '../layouts/SuperAdminLayout';

// Guards - Static Imports
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import SecurityRoute from './SecurityRoute';
import SuperAdminRoute from './SuperAdminRoute';

// Public Pages (Lazy Loaded)
const Home = lazy(() => import('../pages/Home'));
const About = lazy(() => import('../pages/About'));
const Contact = lazy(() => import('../pages/Contact'));
const Gallery = lazy(() => import('../pages/Gallery'));
const Events = lazy(() => import('../pages/Events'));
const EventDetails = lazy(() => import('../pages/EventDetails'));
const Notices = lazy(() => import('../pages/Notices'));
const NoticeDetails = lazy(() => import('../pages/NoticeDetails'));
const Downloads = lazy(() => import('../pages/Downloads'));
const FloorPlans = lazy(() => import('../pages/FloorPlans'));
const ChatAssistant = lazy(() => import('../pages/ChatAssistant'));
const Login = lazy(() => import('../pages/Login'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const OtpVerification = lazy(() => import('../pages/OtpVerification'));

// Resident Pages (Lazy Loaded)
const ResidentDashboard = lazy(() => import('../pages/resident/Dashboard'));
const ResidentProfile = lazy(() => import('../pages/resident/Profile'));
const ResidentDocuments = lazy(() => import('../pages/resident/Documents'));
const ResidentDownloads = lazy(() => import('../pages/resident/Downloads'));
const ResidentComplaints = lazy(() => import('../pages/resident/Complaints'));
const ResidentComplaintDetails = lazy(() => import('../pages/resident/ComplaintDetails'));
const ResidentPayments = lazy(() => import('../pages/resident/Payments'));
const ResidentPaymentHistory = lazy(() => import('../pages/resident/PaymentHistory'));
const ResidentEvents = lazy(() => import('../pages/resident/Events'));
const ResidentChatbot = lazy(() => import('../pages/resident/Chatbot'));
const ResidentSettings = lazy(() => import('../pages/resident/Settings'));

// Committee Admin Pages (Lazy Loaded)
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const ManageNotices = lazy(() => import('../pages/admin/ManageNotices'));
const CreateNotice = lazy(() => import('../pages/admin/CreateNotice'));
const EditNotice = lazy(() => import('../pages/admin/EditNotice'));
const ManageDocuments = lazy(() => import('../pages/admin/ManageDocuments'));
const UploadDocument = lazy(() => import('../pages/admin/UploadDocument'));
const ManageEvents = lazy(() => import('../pages/admin/ManageEvents'));
const CreateEvent = lazy(() => import('../pages/admin/CreateEvent'));
const EditEvent = lazy(() => import('../pages/admin/EditEvent'));
const ManageComplaints = lazy(() => import('../pages/admin/ManageComplaints'));
const ManageResidents = lazy(() => import('../pages/admin/ManageResidents'));
const ManagePayments = lazy(() => import('../pages/admin/ManagePayments'));
const ManageGallery = lazy(() => import('../pages/admin/ManageGallery'));
const ChatbotTraining = lazy(() => import('../pages/admin/ChatbotTraining'));
const Analytics = lazy(() => import('../pages/admin/Analytics'));

// Security Pages (Lazy Loaded)
const SecurityDashboard = lazy(() => import('../pages/security/Dashboard'));
const ActiveVisitors = lazy(() => import('../pages/security/ActiveVisitors'));
const VisitorHistory = lazy(() => import('../pages/security/VisitorHistory'));
const IncidentLogs = lazy(() => import('../pages/security/IncidentLogs'));
const SecuritySettings = lazy(() => import('../pages/security/Settings'));

// Super Admin Pages (Lazy Loaded)
const SuperAdminDashboard = lazy(() => import('../pages/superadmin/SuperAdminDashboard'));
const UserManagement = lazy(() => import('../pages/superadmin/UserManagement'));
const RoleManagement = lazy(() => import('../pages/superadmin/RoleManagement'));
const StorageManagement = lazy(() => import('../pages/superadmin/StorageManagement'));
const AuditLogs = lazy(() => import('../pages/superadmin/AuditLogs'));
const PortalSettings = lazy(() => import('../pages/superadmin/PortalSettings'));

function AppRoutes() {
  const loadingSpinner = (
    <div className="min-h-[75vh] flex flex-col justify-center items-center gap-4 bg-slate-50 dark:bg-slate-950 transition-theme">
      <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      <span className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest animate-pulse">
        Suyash Portal Loading...
      </span>
    </div>
  );

  return (
    <Suspense fallback={loadingSpinner}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="notices" element={<Notices />} />
          <Route path="notices/:id" element={<NoticeDetails />} />
          <Route path="downloads" element={<Downloads />} />
          <Route path="floor-plans" element={<FloorPlans />} />
          <Route path="chat-assistant" element={<ChatAssistant />} />
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="verify-otp" element={<OtpVerification />} />
        </Route>

        {/* Resident Protected Routes */}
        <Route path="resident" element={<ProtectedRoute />}>
          <Route element={<ResidentLayout />}>
            <Route path="dashboard" element={<ResidentDashboard />} />
            <Route path="profile" element={<ResidentProfile />} />
            <Route path="documents" element={<ResidentDocuments />} />
            <Route path="downloads" element={<ResidentDownloads />} />
            <Route path="complaints" element={<ResidentComplaints />} />
            <Route path="complaints/:id" element={<ResidentComplaintDetails />} />
            <Route path="payments" element={<ResidentPayments />} />
            <Route path="payment-history" element={<ResidentPaymentHistory />} />
            <Route path="events" element={<ResidentEvents />} />
            <Route path="events/:id" element={<EventDetails />} />
            <Route path="chatbot" element={<ResidentChatbot />} />
            <Route path="settings" element={<ResidentSettings />} />
          </Route>
        </Route>

        {/* Committee Admin Protected Routes */}
        <Route path="admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="notices" element={<ManageNotices />} />
            <Route path="notices/new" element={<CreateNotice />} />
            <Route path="notices/:id/edit" element={<EditNotice />} />
            <Route path="documents" element={<ManageDocuments />} />
            <Route path="documents/upload" element={<UploadDocument />} />
            <Route path="events" element={<ManageEvents />} />
            <Route path="events/new" element={<CreateEvent />} />
            <Route path="events/:id/edit" element={<EditEvent />} />
            <Route path="complaints" element={<ManageComplaints />} />
            <Route path="residents" element={<ManageResidents />} />
            <Route path="payments" element={<ManagePayments />} />
            <Route path="gallery" element={<ManageGallery />} />
            <Route path="chatbot-training" element={<ChatbotTraining />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Route>

        {/* Security Protected Routes */}
        <Route path="security" element={<SecurityRoute />}>
          <Route element={<SecurityLayout />}>
            <Route path="dashboard" element={<SecurityDashboard />} />
            <Route path="active-visitors" element={<ActiveVisitors />} />
            <Route path="visitor-history" element={<VisitorHistory />} />
            <Route path="incident-logs" element={<IncidentLogs />} />
            <Route path="settings" element={<SecuritySettings />} />
          </Route>
        </Route>

        {/* Super Admin Protected Routes */}
        <Route path="superadmin" element={<SuperAdminRoute />}>
          <Route element={<SuperAdminLayout />}>
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="roles" element={<RoleManagement />} />
            <Route path="storage" element={<StorageManagement />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="settings" element={<PortalSettings />} />
          </Route>
        </Route>

        {/* Fallback to Home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
