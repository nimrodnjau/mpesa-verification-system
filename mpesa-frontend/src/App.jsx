import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VerifyPayment from './pages/VerifyPayment';
import TransactionHistory from './pages/TransactionHistory';
import BusinessDashboard from './pages/BusinessDashboard';
import RegisterBusiness from './pages/RegisterBusiness';
import WebhookSettings from './pages/WebhookSettings';
import Profile from './pages/Profile';  
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminBusinesses from './pages/AdminBusinesses';
import AdminAuditLogs from './pages/AdminAuditLogs';
import Reports from './pages/Reports';
import Invoices from './pages/Invoices';

// Route Guards
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

const BusinessRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (user.role !== 'business') return <Navigate to="/dashboard" />;
    return children;
};

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (user.role !== 'admin') return <Navigate to="/dashboard" />;
    return children;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        
                        {/* Protected Routes */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute><Dashboard /></ProtectedRoute>
                        } />
                        <Route path="/verify" element={
                            <ProtectedRoute><VerifyPayment /></ProtectedRoute>
                        } />
                        <Route path="/history" element={
                            <ProtectedRoute><TransactionHistory /></ProtectedRoute>
                        } />
                        <Route path="/profile" element={   
                            <ProtectedRoute><Profile /></ProtectedRoute>
                        } />
                        
                        {/* Business Routes */}
                        <Route path="/business" element={
                            <BusinessRoute><BusinessDashboard /></BusinessRoute>
                        } />
                        <Route path="/business/register" element={
                            <BusinessRoute><RegisterBusiness /></BusinessRoute>
                        } />
                        <Route path="/webhook-settings" element={
                            <BusinessRoute><WebhookSettings /></BusinessRoute>
                        } />
                        <Route path="/reports" element={
                            <BusinessRoute><Reports /></BusinessRoute>
                        } />
                        <Route path="/invoices" element={
                            <BusinessRoute><Invoices /></BusinessRoute>
                        } />
                        
                        {/* Admin Routes */}
                        <Route path="/admin" element={
                            <AdminRoute><AdminDashboard /></AdminRoute>
                        } />
                        <Route path="/admin/users" element={
                            <AdminRoute><AdminUsers /></AdminRoute>
                        } />
                        <Route path="/admin/businesses" element={
                            <AdminRoute><AdminBusinesses /></AdminRoute>
                        } />
                        <Route path="/admin/audit-logs" element={
                            <AdminRoute><AdminAuditLogs /></AdminRoute>
                        } />
                        
                        {/* 404 */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;