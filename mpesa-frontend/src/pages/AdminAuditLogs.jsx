import React, { useEffect, useState } from 'react';
import api from '../services/api';

const AdminAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [pagination.page]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/audit-logs?page=${pagination.page}`);
            setLogs(response.data.logs || []);
            setPagination({
                page: response.data.page || 1,
                total: response.data.total || 0,
                pages: response.data.pages || 0,
            });
        } catch (error) {
            console.error('Failed to fetch audit logs', error);
        }
        setLoading(false);
    };

    const filteredLogs = filter 
        ? logs.filter(log => log.action?.toLowerCase().includes(filter.toLowerCase()))
        : logs;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">📋 Audit Logs</h1>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Filter by action..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                    <button
                        onClick={fetchLogs}
                        className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-700 transition"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading audit logs...</div>
            ) : filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No audit logs found</div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredLogs.map((log) => (
                                    <tr key={log.log_id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-medium">{log.action}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{log.user_id || 'System'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                                            {log.details ? JSON.stringify(log.details).substring(0, 50) : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{log.ip_address || '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination.pages > 1 && (
                        <div className="flex justify-between items-center px-4 py-3 border-t">
                            <p className="text-sm text-gray-500">
                                Page {pagination.page} of {pagination.pages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    disabled={pagination.page <= 1}
                                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-sm"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    disabled={pagination.page >= pagination.pages}
                                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminAuditLogs;


