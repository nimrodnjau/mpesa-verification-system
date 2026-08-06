import React, { useEffect, useState } from 'react';
import api from '../services/api';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [pagination.page]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/users?page=${pagination.page}`);
            setUsers(response.data.users || []);
            setPagination({
                page: response.data.page || 1,
                total: response.data.total || 0,
                pages: response.data.pages || 0,
            });
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
        setLoading(false);
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/admin/users/${userId}`, { role: newRole });
            fetchUsers();
        } catch (error) {
            console.error('Failed to update user role', error);
        }
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        try {
            await api.put(`/admin/users/${userId}`, { is_active: !currentStatus });
            fetchUsers();
        } catch (error) {
            console.error('Failed to update user status', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user', error);
        }
    };

    const getRoleBadge = (role) => {
        const styles = {
            admin: 'bg-red-100 text-red-700',
            business: 'bg-orange-100 text-orange-700',
            user: 'bg-blue-100 text-blue-700',
        };
        return styles[role] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">👥 Manage Users</h1>
                <p className="text-sm text-gray-500">Total: {pagination.total} users</p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : users.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No users found</div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.user_id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{user.first_name} {user.last_name}</div>
                                            <div className="text-xs text-gray-500">ID: {user.user_id}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{user.email}</td>
                                        <td className="px-4 py-3 text-sm">{user.phone_number}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                                                className={`text-xs px-2 py-1 rounded-full border-0 focus:ring-2 ${getRoleBadge(user.role)}`}
                                            >
                                                <option value="user">User</option>
                                                <option value="business">Business</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleStatusToggle(user.user_id, user.is_active)}
                                                    className={`text-xs px-2 py-1 rounded ${
                                                        user.is_active ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    }`}
                                                >
                                                    {user.is_active ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.user_id)}
                                                    className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex justify-between items-center px-4 py-3 border-t">
                            <p className="text-sm text-gray-500">
                                Page {pagination.page} of {pagination.pages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    disabled={pagination.page <= 1}
                                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-sm"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    disabled={pagination.page >= pagination.pages}
                                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminUsers;


