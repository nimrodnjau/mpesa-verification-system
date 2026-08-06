import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('/admin/analytics');
            setStats(response.data.stats);
            setRecentActivity(response.data.recent_activity || []);
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        }
        setLoading(false);
    };

    if (loading) {
        return <div className="text-center py-12 text-gray-500">Loading analytics...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">🔐 Admin Dashboard</h1>
                <div className="text-sm text-gray-500">
                    Welcome, {user?.first_name} {user?.last_name}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-600 text-white p-4 rounded-lg shadow">
                    <p className="text-sm opacity-80">Total Users</p>
                    <p className="text-2xl font-bold">{stats?.total_users || 0}</p>
                </div>
                <div className="bg-orange-600 text-white p-4 rounded-lg shadow">
                    <p className="text-sm opacity-80">Businesses</p>
                    <p className="text-2xl font-bold">{stats?.total_businesses || 0}</p>
                </div>
                <div className="bg-green-600 text-white p-4 rounded-lg shadow">
                    <p className="text-sm opacity-80">Verified Transactions</p>
                    <p className="text-2xl font-bold">{stats?.transactions?.verified || 0}</p>
                </div>
                <div className="bg-purple-600 text-white p-4 rounded-lg shadow">
                    <p className="text-sm opacity-80">Total Amount</p>
                    <p className="text-2xl font-bold">KES {stats?.total_amount_verified?.toLocaleString() || 0}</p>
                </div>
            </div>

            {/* Transaction Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-xl font-bold text-yellow-600">{stats?.transactions?.pending || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                    <p className="text-sm text-gray-500">Verified</p>
                    <p className="text-xl font-bold text-green-600">{stats?.transactions?.verified || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                    <p className="text-sm text-gray-500">Failed</p>
                    <p className="text-xl font-bold text-red-600">{stats?.transactions?.failed || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                    <p className="text-sm text-gray-500">Webhook Verified</p>
                    <p className="text-xl font-bold text-purple-600">{stats?.transactions?.webhook_verified || 0}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Link to="/admin/users" className="bg-blue-600 text-white p-4 rounded-lg shadow hover:bg-blue-700 transition text-center">
                    <div className="text-2xl mb-1">👥</div>
                    <p className="text-sm font-medium">Manage Users</p>
                </Link>
                <Link to="/admin/businesses" className="bg-orange-600 text-white p-4 rounded-lg shadow hover:bg-orange-700 transition text-center">
                    <div className="text-2xl mb-1">🏢</div>
                    <p className="text-sm font-medium">Manage Businesses</p>
                </Link>
                <Link to="/admin/audit-logs" className="bg-purple-600 text-white p-4 rounded-lg shadow hover:bg-purple-700 transition text-center">
                    <div className="text-2xl mb-1">📋</div>
                    <p className="text-sm font-medium">Audit Logs</p>
                </Link>
                <div className="bg-gray-600 text-white p-4 rounded-lg shadow text-center opacity-50">
                    <div className="text-2xl mb-1">📊</div>
                    <p className="text-sm font-medium">Reports</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-bold mb-4">📋 Recent Activity</h2>
                {recentActivity.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {recentActivity.map((log, index) => (
                            <div key={index} className="flex justify-between items-center text-sm border-b py-2 hover:bg-gray-50 px-2 rounded">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600">{log.action}</span>
                                    {log.details && (
                                        <span className="text-gray-400 text-xs">
                                            {JSON.stringify(log.details).substring(0, 50)}...
                                        </span>
                                    )}
                                </div>
                                <span className="text-gray-400 text-xs">
                                    {new Date(log.timestamp).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;

