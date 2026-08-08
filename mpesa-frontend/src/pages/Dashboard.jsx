import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import BusinessDashboard from './BusinessDashboard';

const Dashboard = () => {
    const { user, getTransactionHistory, getBusinessDashboard } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [businessData, setBusinessData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        
        // ✅ If user is a business, fetch business dashboard
        if (user?.role === 'business') {
            const response = await getBusinessDashboard();
            if (response.success) {
                setBusinessData(response.data);
            }
        }
        
        // ✅ Fetch transaction history for all users
        const response = await getTransactionHistory({ per_page: 10 });
        if (response.success) {
            setTransactions(response.data.transactions || []);
        }
        
        setLoading(false);
    };

    // ✅ Show Business Dashboard if user is business
    if (user?.role === 'business' && businessData) {
        return <BusinessDashboard data={businessData} />;
    }

    // ✅ Regular User Dashboard
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">👋 Welcome, {user?.first_name}!</h1>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <p className="text-sm text-gray-500">Total Verifications</p>
                    <p className="text-2xl font-bold">{transactions.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <p className="text-sm text-gray-500">Verified</p>
                    <p className="text-2xl font-bold text-green-600">
                        {transactions.filter(t => t.status === 'verified').length}
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <Link to="/verify" className="bg-green-600 text-white p-4 rounded-lg shadow hover:bg-green-700 transition text-center">
                    <div className="text-3xl mb-1">💳</div>
                    <p className="text-sm font-medium">Verify Payment</p>
                </Link>
                <Link to="/history" className="bg-blue-600 text-white p-4 rounded-lg shadow hover:bg-blue-700 transition text-center">
                    <div className="text-3xl mb-1">📋</div>
                    <p className="text-sm font-medium">Transaction History</p>
                </Link>
                <Link to="/profile" className="bg-purple-600 text-white p-4 rounded-lg shadow hover:bg-purple-700 transition text-center">
                    <div className="text-3xl mb-1">👤</div>
                    <p className="text-sm font-medium">My Profile</p>
                </Link>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-bold mb-4">📋 Recent Verifications</h2>
                {transactions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No transactions yet</p>
                ) : (
                    transactions.slice(0, 5).map((txn) => (
                        <div key={txn.transaction_id} className="flex justify-between items-center border-b py-2">
                            <div>
                                <p className="font-mono text-sm">{txn.transaction_cd}</p>
                                <p className="text-sm text-gray-500">{txn.phone_number}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">KES {txn.amount}</p>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    txn.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {txn.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;