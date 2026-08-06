import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const BusinessDashboard = () => {
    const { getBusinessDashboard, user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setLoading(true);
        const response = await getBusinessDashboard();
        if (response.success) {
            setData(response.data);
        } else {
            setError(response.error);
        }
        setLoading(false);
    };

    if (loading) {
        return <div className="text-center py-12 text-gray-500">Loading dashboard...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
                <Link to="/business/register" className="text-blue-600 hover:underline mt-2 inline-block">
                    Register your business →
                </Link>
            </div>
        );
    }

    const stats = data?.stats || { today: 0, total: 0, pending: 0, webhook_count: 0 };
    const transactions = data?.transactions?.transactions || [];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">🏢 Business Dashboard</h1>
                <div className="flex gap-2">
                    <Link to="/business/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
                        ⚙️ Edit
                    </Link>
                    <Link to="/webhook-settings" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm">
                        🔔 Webhook Settings
                    </Link>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
                <p className="text-sm text-green-600 font-medium">
                    ✅ Payments are auto-verified via webhook — no manual entry needed!
                </p>
                <p className="text-sm text-gray-500 mt-1">
                    Business: {data?.business?.business_name || 'Not set'} | {data?.business?.status || 'pending'}
                </p>
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

            {/* Recent Transactions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-bold mb-4">📋 Recent Payments</h2>
                
                {transactions.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-400 text-4xl mb-2">📭</p>
                        <p className="text-gray-500">No payments received yet</p>
                        <p className="text-sm text-gray-400 mt-1">Payments will auto-appear when customers pay</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {transactions.slice(0, 10).map((txn) => (
                                    <tr key={txn.transaction_id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 font-mono text-sm">{txn.transaction_cd}</td>
                                        <td className="px-4 py-2">{txn.phone_number}</td>
                                        <td className="px-4 py-2 font-bold">KES {txn.amount}</td>
                                        <td className="px-4 py-2">
                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                                ✅ Verified
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                            {txn.verification_source === 'webhook' ? '🤖 Auto' : '👤 Manual'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-500">
                                            {new Date(txn.timestamp).toLocaleTimeString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BusinessDashboard;