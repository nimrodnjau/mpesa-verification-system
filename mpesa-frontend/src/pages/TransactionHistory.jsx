import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const TransactionHistory = () => {
    const { getTransactionHistory } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        search: '',
    });
    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        pages: 0,
        per_page: 20,
    });

    useEffect(() => {
        fetchTransactions();
    }, [filters.status, filters.search, pagination.page]);

    const fetchTransactions = async () => {
        setLoading(true);
        const response = await getTransactionHistory({
            page: pagination.page,
            per_page: pagination.per_page,
            status: filters.status || undefined,
            search: filters.search || undefined,
        });
        if (response.success) {
            setTransactions(response.data.transactions || []);
            setPagination({
                ...pagination,
                total: response.data.total || 0,
                pages: response.data.pages || 0,
            });
        }
        setLoading(false);
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPagination({ ...pagination, page: 1 });
    };

    const handlePageChange = (newPage) => {
        setPagination({ ...pagination, page: newPage });
    };

    const getStatusBadge = (status) => {
        const styles = {
            verified: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            failed: 'bg-red-100 text-red-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">📋 Transaction History</h1>
                <Link to="/verify" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm">
                    + Verify Payment
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="🔍 Search by code or phone..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                        />
                    </div>
                    <div className="w-[150px]">
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                        >
                            <option value="">All Status</option>
                            <option value="verified">✅ Verified</option>
                            <option value="pending">⏳ Pending</option>
                            <option value="failed">❌ Failed</option>
                        </select>
                    </div>
                    <button
                        onClick={() => {
                            setFilters({ status: '', search: '' });
                            setPagination({ ...pagination, page: 1 });
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading...</div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-4xl mb-2">📭</p>
                        <p className="text-gray-500">No transactions found</p>
                        <Link to="/verify" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                            Verify a payment →
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {transactions.map((txn) => (
                                    <tr key={txn.transaction_id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 font-mono text-sm">{txn.transaction_cd}</td>
                                        <td className="px-4 py-3 font-medium">KES {txn.amount}</td>
                                        <td className="px-4 py-3 text-sm">{txn.phone_number}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(txn.status)}`}>
                                                {txn.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {txn.verification_source === 'webhook' ? '🤖 Auto' : '👤 Manual'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {new Date(txn.timestamp).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex justify-between items-center px-4 py-3 border-t">
                        <p className="text-sm text-gray-500">
                            Showing {((pagination.page - 1) * pagination.per_page) + 1} to {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1 text-sm">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.pages}
                                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;

