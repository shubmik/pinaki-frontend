import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/member/Dashboard';
import KYCUpload from './pages/member/KYCUpload';
import Transactions from './pages/member/Transactions';
import AdminDashboard from './pages/admin/AdminDashboard';
import MemberList from './pages/admin/MemberList';
import MemberDetail from './pages/admin/MemberDetail';
import ManualPayment from './pages/admin/ManualPayment';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  // If logged in → go to correct dashboard
  if (user && ['super_admin','staff_admin'].includes(user.role)) return <Navigate to="/admin" replace />;
  if (user && user.role === 'member') return <Navigate to="/dashboard" replace />;
  // Not logged in → show landing page
  return <Home />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{
          duration: 3500,
          style: { background: '#1a1a2e', color: '#fff', borderRadius: '12px', fontSize: '14px' }
        }} />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> {/* PUBLIC — no auth needed */}

          {/* Member routes */}
          <Route path="/dashboard"    element={<ProtectedRoute role="member"><Dashboard /></ProtectedRoute>} />
          <Route path="/kyc"          element={<ProtectedRoute role="member"><KYCUpload /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute role="member"><Transactions /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin"                       element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/members"               element={<ProtectedRoute role="admin"><MemberList /></ProtectedRoute>} />
          <Route path="/admin/members/:memberId"     element={<ProtectedRoute role="admin"><MemberDetail /></ProtectedRoute>} />
          <Route path="/admin/payment"               element={<ProtectedRoute role="admin"><ManualPayment /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
