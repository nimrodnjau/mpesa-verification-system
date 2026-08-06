import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const VerifyPayment = () => {
    const [formData, setFormData] = useState({
        transaction_cd: '',
        amount: '',
        phone_number: '',
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { verifyPayment } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
        setResult(null);
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    // ✅ Ensure all fields are present
    const payload = {
        transaction_cd: formData.transaction_cd,
        amount: parseFloat(formData.amount),
        phone_number: formData.phone_number
    };

    console.log('📤 Sending to backend:', payload);

    const response = await verifyPayment(payload);
    
    if (response.success) {
        setResult(response.data);
    } else {
        setError(response.error);
    }
    setLoading(false);
};

    const resetForm = () => {
        setFormData({ transaction_cd: '', amount: '', phone_number: '' });
        setResult(null);
        setError(null);
    };

    return (
        <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-2">💳 Verify Payment</h2>
            <p className="text-gray-600 text-sm mb-6">Enter your M-Pesa transaction details to verify</p>

            {result && (
                <div className="bg-green-50 border border-green-400 text-green-700 p-4 rounded-lg mb-4">
                    <p className="font-bold text-lg">✅ Payment Verified!</p>
                    <div className="mt-2 space-y-1 text-sm">
                        <p><span className="font-medium">Transaction:</span> {result.transaction.transaction_cd}</p>
                        <p><span className="font-medium">Amount:</span> KES {result.transaction.amount}</p>
                        <p><span className="font-medium">Phone:</span> {result.transaction.phone_number}</p>
                        <p><span className="font-medium">Status:</span> {result.transaction.status}</p>
                        <p><span className="font-medium">Verified At:</span> {new Date(result.transaction.verified_at).toLocaleString()}</p>
                    </div>
                    <button
                        onClick={resetForm}
                        className="mt-3 text-sm bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700 transition"
                    >
                        Verify Another
                    </button>
                </div>
            )}

            {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm border border-red-200">
                    ❌ {error}
                </div>
            )}

            {!result && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                M-Pesa Transaction Code
                            </label>
                            <input
                                type="text"
                                name="transaction_cd"
                                value={formData.transaction_cd}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-mono"
                                placeholder="e.g., XYZ123456789"
                                required
                            />
                            <p className="text-xs text-gray-400 mt-1">Found in your M-Pesa confirmation SMS</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                placeholder="e.g., 500"
                                min="1"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sender Phone Number</label>
                            <input
                                type="tel"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                placeholder="e.g., 0712345678"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? '⏳ Verifying...' : '🔍 Verify Payment'}
                        </button>
                    </form>
                </div>
            )}

            <div className="mt-4 text-center text-xs text-gray-400">
                <p>💡 This verification serves as proof of payment</p>
                <p className="mt-1">You can show this screen to the business</p>
            </div>
        </div>
    );
};

export default VerifyPayment;

