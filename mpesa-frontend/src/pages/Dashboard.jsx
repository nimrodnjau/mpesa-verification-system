import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, getTransactionHistory } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({ total: 0, amount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const response = await getTransactionHistory({ per_page: 10 });
        if (response.success) {
            setTransactions(response.data.transactions || []);
            setStats({
                total: response.data.total || 0,
                amount: response.data.transactions?.reduce((sum, t) => sum + t.amount, 0) || 0
            });
        }
        setLoading(false);
    };

    const quickActions = [
        { title: 'Verify Payment', icon: '💳', path: '/verify', color: 'bg-green-600' },
        { title: 'Transaction History', icon: '📋', path: '/history', color: 'bg-blue-600' },
        { title: 'My Profile', icon: '👤', path: '/profile', color: 'bg-purple-600' },
    ];

    if (user?.role === 'business') {
        quickActions.push(
            { title: 'Business Dashboard', icon: '🏢', path: '/business', color: 'bg-orange-600' },
            { title: 'Webhook Settings', icon: '🔔', path: '/webhook-settings', color: 'bg-indigo-600' },
        );
    }

    if (user?.role === 'admin') {
        quickActions.push(
            { title: 'Admin Panel', icon: '🔐', path: '/admin', color: 'bg-red-600' },
        );
    }

    return (
        <div>
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl mb-6">
                <h1 className="text-2xl font-bold">👋 Welcome, {user?.first_name}!</h1>
                <p className="opacity-90 mt-1">You've verified {stats.total} transactions totaling KES {stats.amount.toLocaleString()}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <p className="text-sm text-gray-500">Total Verifications</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-2xl font-bold text-green-600">KES {stats.amount.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <p className="text-sm text-gray-500">Verified</p>
                    <p className="text-2xl font-bold text-green-600">
                        {transactions.filter(t => t.status === 'verified').length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                        {transactions.filter(t => t.status === 'pending').length}
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {quickActions.map((action, index) => (
                    <Link
                        key={index}
                        to={action.path}
                        className={`${action.color} text-white p-4 rounded-lg shadow hover:shadow-lg transition text-center`}
                    >
                        <div className="text-3xl mb-1">{action.icon}</div>
                        <p className="text-sm font-medium">{action.title}</p>
                    </Link>
                ))}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Recent Verifications</h2>
                    <Link to="/history" className="text-sm text-blue-600 hover:underline">
                        View All →
                    </Link>
                </div>
                
                {loading ? (
                    <p className="text-gray-500 text-center py-4">Loading...</p>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-400 text-4xl mb-2">📭</p>
                        <p className="text-gray-500">No transactions yet</p>
                        <Link to="/verify" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                            Verify your first payment →
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y">
                        {transactions.slice(0, 5).map((txn) => (
                            <div key={txn.transaction_id} className="flex justify-between items-center py-3">
                                <div>
                                    <p className="font-mono text-sm font-medium">{txn.transaction_cd}</p>
                                    <p className="text-sm text-gray-500">{txn.phone_number}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">KES {txn.amount}</p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        txn.status === 'verified' ? 'bg-green-100 text-green-700' :
                                        txn.status === 'failed' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {txn.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;