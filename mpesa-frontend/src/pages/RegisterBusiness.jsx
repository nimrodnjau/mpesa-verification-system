import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterBusiness = () => {
    const [formData, setFormData] = useState({
        business_name: '',
        location: '',
        paybill_number: '',
        till_number: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const { registerBusiness, user } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const response = await registerBusiness(formData);
        if (response.success) {
            setSuccess(true);
            setTimeout(() => navigate('/business'), 2000);
        } else {
            setError(response.error);
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="max-w-md mx-auto mt-10 text-center">
                <div className="bg-green-100 border border-green-400 text-green-700 p-6 rounded-lg">
                    <p className="text-4xl mb-2">🎉</p>
                    <h2 className="text-xl font-bold">Business Registered!</h2>
                    <p className="text-sm mt-2">Your business is pending approval.</p>
                    <p className="text-sm text-gray-600 mt-2">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-2">🏢 Register Business</h2>
            <p className="text-gray-600 text-sm mb-6">Set up your business to receive payments</p>

            {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm border border-red-200">
                    ❌ {error}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Business Name *
                        </label>
                        <input
                            type="text"
                            name="business_name"
                            value={formData.business_name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="e.g., ABC Enterprises"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="e.g., Nairobi, Kenya"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Paybill Number
                        </label>
                        <input
                            type="text"
                            name="paybill_number"
                            value={formData.paybill_number}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="e.g., 123456"
                        />
                        <p className="text-xs text-gray-400 mt-1">For webhook auto-verification</p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Till Number
                        </label>
                        <input
                            type="text"
                            name="till_number"
                            value={formData.till_number}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="e.g., 654321"
                        />
                        <p className="text-xs text-gray-400 mt-1">For webhook auto-verification</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {loading ? '⏳ Registering...' : 'Register Business'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterBusiness;