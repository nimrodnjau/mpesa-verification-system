import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
// UNNECESSARY, FOR TESTING PURPOSES ONLY. REMOVE BEFORE DEPLOYMENT.
const TestApi = () => {
    const { user } = useAuth();
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const testGet = async () => {
        setLoading(true);
        setError(null);
        try {
            // Test a protected endpoint
            const res = await api.get('/auth/me');
            setResponse(res.data);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        }
        setLoading(false);
    };

    const testPost = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/payment/verify', {
                transaction_cd: 'TEST123456789',
                amount: 100,
                phone_number: '0712345678'
            });
            setResponse(res.data);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">🔧 API Test Page</h1>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                <p className="text-yellow-800 text-sm">
                    ⚠️ This is a development testing page. Remove before deployment.
                </p>
                <p className="text-yellow-600 text-xs mt-1">
                    Logged in as: {user?.email || 'Not logged in'}
                </p>
            </div>

            <div className="flex gap-3 mb-6">
                <button
                    onClick={testGet}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                    Test GET /auth/me
                </button>
                <button
                    onClick={testPost}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
                >
                    Test POST /payment/verify
                </button>
                <button
                    onClick={() => { setResponse(null); setError(null); }}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
                >
                    Clear
                </button>
            </div>

            {loading && (
                <div className="text-center py-4 text-gray-500">⏳ Loading...</div>
            )}

            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg border border-red-200 mb-4">
                    <p className="font-bold">❌ Error:</p>
                    <pre className="text-sm mt-1 whitespace-pre-wrap">{error}</pre>
                </div>
            )}

            {response && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <p className="font-bold text-green-700 mb-2">✅ Response:</p>
                    <pre className="bg-gray-900 text-green-300 p-4 rounded text-sm overflow-x-auto">
                        {JSON.stringify(response, null, 2)}
                    </pre>
                </div>
            )}

            <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-bold text-sm text-gray-600 mb-2">💡 What this tests:</h3>
                <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
                    <li>API connection is working</li>
                    <li>Authentication token is valid</li>
                    <li>User data is being fetched correctly</li>
                    <li>POST requests are working</li>
                    <li>Error handling is functioning</li>
                </ul>
            </div>
        </div>
    );
};

export default TestApi;

