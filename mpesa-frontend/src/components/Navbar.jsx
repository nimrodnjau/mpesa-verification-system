import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // ✅ Show role badge
    const getRoleBadge = () => {
        if (!user) return null;
        const styles = {
            user: 'bg-blue-100 text-blue-700',
            business: 'bg-green-100 text-green-700',
            admin: 'bg-red-100 text-red-700',
        };
        return (
            <span className={`text-xs px-2 py-1 rounded-full ${styles[user.role] || 'bg-gray-100 text-gray-700'}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
        );
    };

    return (
        <nav className="bg-white shadow-md px-6 py-4 border-b border-gray-200">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold text-green-600">
                    💳 M-Pesa Verify
                </Link>
                
                <div className="flex items-center gap-4">
                        {user ? (
                            <>
                    <Link to="/dashboard" className="text-sm">Dashboard</Link>
                    <Link to="/verify" className="text-sm">Verify</Link>
                    <Link to="/history" className="text-sm">History</Link>
                    
                    {/* ✅ Only show business links if user is BUSINESS */}
                    {user.role === 'business' && (
                        <>
                            <Link to="/business" className="text-sm font-medium text-green-600">Business</Link>
                            <Link to="/invoices" className="text-sm">Invoices</Link>
                            <Link to="/reports" className="text-sm">Reports</Link>
                            <Link to="/webhook-settings" className="text-sm">Webhooks</Link>
                        </>
                    )}
                    
                    {/* ✅ Only show admin links if user is ADMIN */}
                    {user.role === 'admin' && (
                        <Link to="/admin" className="text-sm text-red-600 font-medium">Admin</Link>
                    )}
                    
                    <Link to="/profile" className="text-sm">👤 {user.first_name}</Link>
                    <button onClick={handleLogout} className="text-sm text-red-600">Logout</button>
                </>
            ) : (
                <>
                    <Link to="/login" className="text-sm">Login</Link>
                    <Link to="/register" className="text-sm bg-blue-600 text-white px-4 py-2 rounded">Register</Link>
                </>
            )}
                    
                </div>
            </div>
        </nav>
    );
};

export default Navbar;