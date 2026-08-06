import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        confirm_password: '',
        role: 'user',  // 'user' or 'business'
    });
    const [businessData, setBusinessData] = useState({
        business_name: '',
        location: '',
        paybill_number: '',
        till_number: '',
    });
    const [errors, setErrors] = useState({});
    const [businessErrors, setBusinessErrors] = useState({});
    const { register, registerBusiness, error, loading } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleBusinessChange = (e) => {
        setBusinessData({ ...businessData, [e.target.name]: e.target.value });
        if (businessErrors[e.target.name]) {
            setBusinessErrors({ ...businessErrors, [e.target.name]: '' });
        }
    };

    const handleRoleChange = (role) => {
        setFormData({ ...formData, role });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.first_name) newErrors.first_name = 'First name is required';
        if (!formData.last_name) newErrors.last_name = 'Last name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        
        const phoneRegex = /^(07|01)\d{8}$/;
        const cleanedPhone = formData.phone_number.replace(/\s/g, '');
        if (!cleanedPhone) {
            newErrors.phone_number = 'Phone number is required';
        } else if (!phoneRegex.test(cleanedPhone)) {
            newErrors.phone_number = 'Enter valid phone number (e.g., 0712345678)';
        }
        
        if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirm_password) {
            newErrors.confirm_password = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateBusiness = () => {
        if (formData.role !== 'business') return true;
        
        const newErrors = {};
        if (!businessData.business_name) newErrors.business_name = 'Business name is required';
        if (!businessData.location) newErrors.location = 'Location is required';
        setBusinessErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!validateBusiness()) return;

    const { confirm_password, role, ...userData } = formData;
    userData.phone_number = userData.phone_number.replace(/\s/g, '');

    // ✅ Register user
    const result = await register(userData);
    if (!result.success) {
        return;
    }

    // ✅ If business, wait and then register
    if (role === 'business') {
        // Small delay to ensure token is ready
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const businessResult = await registerBusiness(businessData);
        if (!businessResult.success) {
            setErrors({ general: businessResult.error || 'Business registration failed' });
            return;
        }
    }

    navigate('/dashboard');
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-8">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
                
                {(error || errors.general) && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm border border-red-200">
                        ❌ {error || errors.general}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    {/* ROLE SELECTION */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleRoleChange('user')}
                                className={`p-3 rounded-lg border-2 transition ${
                                    formData.role === 'user' 
                                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="text-2xl mb-1">👤</div>
                                <div className="font-medium text-sm">Normal User</div>
                                <div className="text-xs text-gray-500">Verify payments only</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleRoleChange('business')}
                                className={`p-3 rounded-lg border-2 transition ${
                                    formData.role === 'business' 
                                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="text-2xl mb-1">🏢</div>
                                <div className="font-medium text-sm">Business</div>
                                <div className="text-xs text-gray-500">Receive & verify payments</div>
                            </button>
                        </div>
                    </div>

                    {/* User Details */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="John"
                                required
                            />
                            {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                        </div>
                        <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors.last_name ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Doe"
                                required
                            />
                            {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                        </div>
                    </div>
                    
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="john@example.com"
                            required
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors.phone_number ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="0712345678"
                            required
                        />
                        {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
                    </div>
                    
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Min 8 characters"
                            required
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors.confirm_password ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Confirm password"
                            required
                        />
                        {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>}
                    </div>

                    {/* BUSINESS DETAILS - Only shown when role is 'business' */}
                    {formData.role === 'business' && (
                        <div className="border-t pt-4 mt-2">
                            <h3 className="font-medium text-gray-700 mb-3">🏢 Business Details</h3>
                            
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                                <input
                                    type="text"
                                    name="business_name"
                                    value={businessData.business_name}
                                    onChange={handleBusinessChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${businessErrors.business_name ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="ABC Enterprises"
                                    required
                                />
                                {businessErrors.business_name && <p className="text-red-500 text-xs mt-1">{businessErrors.business_name}</p>}
                            </div>

                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={businessData.location}
                                    onChange={handleBusinessChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${businessErrors.location ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Nairobi, Kenya"
                                    required
                                />
                                {businessErrors.location && <p className="text-red-500 text-xs mt-1">{businessErrors.location}</p>}
                            </div>

                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Paybill Number</label>
                                <input
                                    type="text"
                                    name="paybill_number"
                                    value={businessData.paybill_number}
                                    onChange={handleBusinessChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="e.g., 123456"
                                />
                                <p className="text-xs text-gray-400 mt-1">For webhook auto-verification</p>
                            </div>

                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Till Number</label>
                                <input
                                    type="text"
                                    name="till_number"
                                    value={businessData.till_number}
                                    onChange={handleBusinessChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="e.g., 654321"
                                />
                                <p className="text-xs text-gray-400 mt-1">For webhook auto-verification</p>
                            </div>
                        </div>
                    )}
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium mt-4"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                
                <p className="text-center text-sm text-gray-600 mt-4">
                    Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;