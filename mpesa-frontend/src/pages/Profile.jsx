import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { user } = useAuth();

    if (!user) {
        return <div className="text-center py-12 text-gray-500">Loading...</div>;
    }

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6">👤 My Profile</h2>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-3xl">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                    <h3 className="text-lg font-bold mt-2">{user.first_name} {user.last_name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-700' :
                        user.role === 'business' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                        {user.role}
                    </span>
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Email</span>
                        <span className="font-medium">{user.email}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Phone</span>
                        <span className="font-medium">{user.phone_number}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Account Created</span>
                        <span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Verified</span>
                        <span className="font-medium">
                            {user.is_verified ? '✅ Yes' : '❌ No'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                {user.role === 'business' && (
                    <Link to="/business" className="flex-1 bg-orange-600 text-white text-center px-4 py-2 rounded-lg hover:bg-orange-700 transition text-sm">
                        Business Dashboard
                    </Link>
                )}
                {user.role === 'admin' && (
                    <Link to="/admin" className="flex-1 bg-red-600 text-white text-center px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm">
                        Admin Panel
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Profile;


