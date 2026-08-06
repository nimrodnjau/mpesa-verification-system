import React, { useEffect, useState } from 'react';
import api from '../services/api';

const AdminBusinesses = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBusinesses();
    }, []);

    const fetchBusinesses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/businesses');
            setBusinesses(response.data.businesses || []);
        } catch (error) {
            console.error('Failed to fetch businesses', error);
        }
        setLoading(false);
    };

    const handleApprove = async (businessId) => {
        try {
            await api.put(`/admin/businesses/${businessId}/approve`);
            fetchBusinesses();
        } catch (error) {
            console.error('Failed to approve business', error);
        }
    };

    const handleSuspend = async (businessId) => {
        try {
            await api.put(`/admin/businesses/${businessId}/suspend`);
            fetchBusinesses();
        } catch (error) {
            console.error('Failed to suspend business', error);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            suspended: 'bg-red-100 text-red-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">🏢 Manage Businesses</h1>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : businesses.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No businesses registered</div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Webhook</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {businesses.map((business) => (
                                    <tr key={business.business_id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{business.business_name}</div>
                                            <div className="text-xs text-gray-500">ID: {business.business_id}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{business.owner?.email || 'Unknown'}</td>
                                        <td className="px-4 py-3 text-sm">{business.location || 'N/A'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(business.status)}`}>
                                                {business.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {business.is_webhook_active ? '✅ Active' : '❌ Inactive'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2 flex-wrap">
                                                {business.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleApprove(business.business_id)}
                                                        className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                {business.status === 'active' && (
                                                    <button
                                                        onClick={() => handleSuspend(business.business_id)}
                                                        className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                                    >
                                                        Suspend
                                                    </button>
                                                )}
                                                {business.status === 'suspended' && (
                                                    <button
                                                        onClick={() => handleApprove(business.business_id)}
                                                        className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                                                    >
                                                        Reinstate
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBusinesses;


