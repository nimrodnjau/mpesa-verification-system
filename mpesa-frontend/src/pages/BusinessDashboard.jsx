import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const BusinessDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBusinessData();
    }, []);

    const fetchBusinessData = async () => {
        try {
            const response = await api.get('/business/dashboard');
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch business data', error);
        }
        setLoading(false);
    };

    if (loading) {
        return <div className="text-center py-12">Loading business dashboard...</div>;
    }

    const stats = data?.stats || { today: 0, total: 0, pending: 0, webhook_count: 0 };
    const transactions = data?.transactions?.transactions || [];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">🏢 Business Dashboard</h1>
                <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    {data?.business?.status || 'Pending'}
                </span>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-600 text-white p-4 rounded-lg shadow">
                    <p className="text-sm opacity-80">Today's Payments</p>
                    <p className="text-2xl font-bold">KES {stats.today.toLocaleString()}</p>
                </div>
                <div className="bg-blue-600 text-white p-4 rounded-lg shadow">
                    <p className="text-sm opacity-80">Total Received</p>
                    <p className="text-2xl font-bold">KES {stats.total.toLocaleString()}</p>
                </div>
                <div className="bg-yellow-600 text-white p-4 rounded-lg shadow">
                    <p className="text-sm opacity-80">Pending</p>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <div className="bg-purple-600 text-white p-4 rounded-lg shadow">
                    <p className="text-sm opacity-80">Auto-Verified</p>
                    <p className="text-2xl font-bold">{stats.webhook_count}</p>
                </div>
            </div>

            {/* Business Actions */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <Link to="/verify" className="bg-green-600 text-white p-4 rounded-lg shadow hover:bg-green-700 transition text-center">
                    <div className="text-3xl mb-1">💳</div>
                    <p className="text-sm font-medium">Verify Payment</p>
                </Link>
                <Link to="/invoices" className="bg-blue-600 text-white p-4 rounded-lg shadow hover:bg-blue-700 transition text-center">
                    <div className="text-3xl mb-1">📄</div>
                    <p className="text-sm font-medium">Invoices</p>
                </Link>
                <Link to="/reports" className="bg-orange-600 text-white p-4 rounded-lg shadow hover:bg-orange-700 transition text-center">
                    <div className="text-3xl mb-1">📊</div>
                    <p className="text-sm font-medium">Reports</p>
                </Link>
                <Link to="/webhook-settings" className="bg-indigo-600 text-white p-4 rounded-lg shadow hover:bg-indigo-700 transition text-center">
                    <div className="text-3xl mb-1">🔔</div>
                    <p className="text-sm font-medium">Webhook Settings</p>
                </Link>
            </div>

            {/* Recent Payments */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-bold mb-4">📋 Recent Payments</h2>
                {transactions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No payments received yet</p>
                ) : (
                    transactions.slice(0, 10).map((txn) => (
                        <div key={txn.transaction_id} className="flex justify-between items-center border-b py-2">
                            <div>
                                <p className="font-mono text-sm">{txn.transaction_cd}</p>
                                <p className="text-sm text-gray-500">{txn.phone_number}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">KES {txn.amount}</p>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    {txn.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BusinessDashboard;