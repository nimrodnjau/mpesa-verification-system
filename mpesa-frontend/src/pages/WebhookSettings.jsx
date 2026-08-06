import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const WebhookSettings = () => {
    const [settings, setSettings] = useState({
        paybill_number: '',
        till_number: '',
        is_webhook_active: false,
        webhook_endpoint: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetchSettings();
        fetchLogs();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/business/webhook-settings');
            setSettings(response.data);
        } catch (error) {
            console.error('Failed to fetch settings', error);
        }
        setLoading(false);
    };

    const fetchLogs = async () => {
        try {
            const response = await api.get('/webhook/logs');
            setLogs(response.data.logs || []);
        } catch (error) {
            console.error('Failed to fetch logs', error);
        }
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setSettings({ ...settings, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            await api.put('/business/webhook-settings', settings);
            setMessage({ type: 'success', text: 'Webhook settings updated successfully!' });
            await fetchLogs();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update settings' });
        }
        setSaving(false);
    };

    if (loading) {
        return <div className="text-center py-12 text-gray-500">Loading settings...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">🔔 Webhook Settings</h2>
            <p className="text-gray-600 text-sm mb-6">Configure automatic payment verification</p>

            {message && (
                <div className={`p-3 rounded-lg mb-4 text-sm border ${
                    message.type === 'success' 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-red-100 text-red-700 border-red-200'
                }`}>
                    {message.type === 'success' ? '✅' : '❌'} {message.text}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Paybill Number
                        </label>
                        <input
                            type="text"
                            name="paybill_number"
                            value={settings.paybill_number || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            placeholder="Enter your Paybill number"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Till Number
                        </label>
                        <input
                            type="text"
                            name="till_number"
                            value={settings.till_number || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            placeholder="Enter your Till number"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_webhook_active"
                                checked={settings.is_webhook_active || false}
                                onChange={handleChange}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Enable Webhook Auto-Verification</span>
                        </label>
                        <p className="text-xs text-gray-400 mt-1">
                            When enabled, payments will be automatically verified via webhook
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {saving ? '⏳ Saving...' : '💾 Save Settings'}
                    </button>
                </form>
            </div>

            {/* Webhook Logs */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-bold mb-4">📋 Recent Webhook Activity</h3>
                {logs.length === 0 ? (
                    <p className="text-gray-500 text-sm">No webhook activity yet</p>
                ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {logs.map((log, index) => (
                            <div key={index} className="flex justify-between items-center text-sm border-b py-2">
                                <div>
                                    <span className="text-gray-600">{log.action}</span>
                                    {log.details && (
                                        <span className="text-gray-400 ml-2">
                                            {log.details.transaction_cd || ''}
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

export default WebhookSettings;