import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Reports = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });
    const [reportType, setReportType] = useState('summary');

    const generateReport = async () => {
        setLoading(true);
        try {
            const response = await api.get('/business/reports', {
                params: {
                    start_date: dateRange.start,
                    end_date: dateRange.end,
                    type: reportType,
                }
            });
            setReportData(response.data);
        } catch (error) {
            console.error('Failed to generate report', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        generateReport();
    }, []);

    const exportCSV = () => {
        if (!reportData?.recent) return;
        
        const headers = ['Transaction Code', 'Amount', 'Phone', 'Status', 'Source', 'Date'];
        const rows = reportData.recent.map(t => [
            t.transaction_cd,
            t.amount,
            t.phone_number,
            t.status,
            t.verification_source,
            new Date(t.timestamp).toLocaleString()
        ]);
        
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const summary = reportData?.summary || { total_income: 0, total_transactions: 0, webhook_verified: 0, manual_verified: 0 };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">📊 Reports</h1>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={generateReport}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                    {reportData && (
                        <button
                            onClick={exportCSV}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            📥 Export CSV
                        </button>
                    )}
                </div>
            </div>

            {reportData && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-600 text-white p-4 rounded-lg shadow">
                            <p className="text-sm opacity-80">Total Income</p>
                            <p className="text-2xl font-bold">KES {summary.total_income.toLocaleString()}</p>
                        </div>
                        <div className="bg-green-600 text-white p-4 rounded-lg shadow">
                            <p className="text-sm opacity-80">Total Transactions</p>
                            <p className="text-2xl font-bold">{summary.total_transactions}</p>
                        </div>
                        <div className="bg-purple-600 text-white p-4 rounded-lg shadow">
                            <p className="text-sm opacity-80">Webhook Verified</p>
                            <p className="text-2xl font-bold">{summary.webhook_verified}</p>
                        </div>
                        <div className="bg-orange-600 text-white p-4 rounded-lg shadow">
                            <p className="text-sm opacity-80">Manual Verified</p>
                            <p className="text-2xl font-bold">{summary.manual_verified}</p>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-lg font-bold mb-4">📋 Transaction Details</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {reportData.recent?.slice(0, 20).map((txn) => (
                                        <tr key={txn.transaction_id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 font-mono text-sm">{txn.transaction_cd}</td>
                                            <td className="px-4 py-2 font-bold">KES {txn.amount}</td>
                                            <td className="px-4 py-2">{txn.phone_number}</td>
                                            <td className="px-4 py-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    txn.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {txn.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                {txn.verification_source === 'webhook' ? '🤖 Auto' : '👤 Manual'}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-500">
                                                {new Date(txn.timestamp).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {reportData.recent?.length === 0 && (
                            <p className="text-center text-gray-500 py-4">No transactions found for this period</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Reports;


