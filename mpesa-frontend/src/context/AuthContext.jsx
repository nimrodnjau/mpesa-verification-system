import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Check if user is logged in on mount
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    // ✅ Fetch current user
    const fetchUser = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
        } catch (error) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        } finally {
            setLoading(false);
        }
    };

    // ✅ REGISTER FUNCTION - FIXED
    const register = async (userData) => {
        try {
            setError(null);
            
            // ✅ Make sure all required fields are present
            const payload = {
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                phone_number: userData.phone_number,
                password: userData.password,
            };
            
            console.log('📤 Register payload:', payload);
            
            const response = await api.post('/auth/register', payload);
            console.log('✅ Register response:', response.data);
            
            const { access_token, refresh_token, user } = response.data;
            
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            setUser(user);
            
            return { success: true, user };
        } catch (error) {
            console.error('❌ Register error:', error.response?.data || error.message);
            const message = error.response?.data?.error || error.response?.data?.message || 'Registration failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    // ✅ LOGIN FUNCTION
    const login = async (email, password) => {
        try {
            setError(null);
            const response = await api.post('/auth/login', { email, password });
            const { access_token, refresh_token, user } = response.data;
            
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            setUser(user);
            
            return { success: true, user };
        } catch (error) {
            const message = error.response?.data?.error || error.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    // ✅ LOGOUT FUNCTION
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // Ignore logout errors
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
        }
    };

    // ✅ VERIFY PAYMENT FUNCTION
    const verifyPayment = async (transactionData) => {
    try {
        setError(null);
        
        // ✅ Log what's being sent
        console.log('📤 Verifying payment:', transactionData);
        
        const response = await api.post('/payment/verify', transactionData);
        console.log('✅ Verification response:', response.data);
        
        return { success: true, data: response.data };
    } catch (error) {
        console.error('❌ Verification error:', error.response?.data || error.message);
        const message = error.response?.data?.error || 'Verification failed';
        setError(message);
        return { success: false, error: message };
    }
    };

    // ✅ GET TRANSACTION HISTORY
    const getTransactionHistory = async (params = {}) => {
        try {
            const response = await api.get('/payment/history', { params });
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to fetch history';
            return { success: false, error: message };
        }
    };

    // ✅ GET BUSINESS DASHBOARD
    const getBusinessDashboard = async () => {
        try {
            const response = await api.get('/business/dashboard');
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to fetch dashboard';
            return { success: false, error: message };
        }
    };

    // ✅ REGISTER BUSINESS
    const registerBusiness = async (businessData) => {
        try {
            setError(null);
            const response = await api.post('/business/register', businessData);
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.error || 'Business registration failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    // ✅ GET STATISTICS
    const getStatistics = async () => {
        try {
            const response = await api.get('/payment/statistics');
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to fetch stats';
            return { success: false, error: message };
        }
    };

    //  Value object to provide to children
    const value = {
        user,
        loading,
        error,
        register,          // ALL functions are defined
        login,
        logout,
        verifyPayment,
        getTransactionHistory,
        getBusinessDashboard,
        registerBusiness,
        getStatistics,
        fetchUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};