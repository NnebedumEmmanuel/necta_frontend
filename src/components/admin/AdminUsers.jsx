import React, { useEffect, useState } from 'react';
import { Eye, User, Phone, Calendar } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/useToastHook';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/users');
      const data = res?.data?.users ?? res?.data ?? [];
      const normalized = (Array.isArray(data) ? data : []).map((u) => ({
        id: u.id,
        fullName: `${u.first_name || u.firstName || ''} ${u.last_name || u.lastName || ''}`.trim() || (u.email || 'Unknown'),
        email: u.email,
        phone: u.phone || u.phone_number || '',
        joinedAt: u.created_at || u.createdAt || u.inserted_at || null,
        __raw: u,
      }));
      setUsers(normalized);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err?.message || 'Failed to load users');
      showToast?.('Failed to load users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '-';
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return String(d);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-slate-600 mt-1">Manage application users</p>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white/80 rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading users...</p>
          </div>
        ) : error ? (
          <div className="bg-white/80 rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-lg font-semibold text-slate-700">Error loading users</p>
            <p className="text-sm text-slate-500 mt-2">{String(error)}</p>
            <div className="mt-4">
              <button onClick={loadUsers} className="px-6 py-2 bg-purple-600 text-white rounded-lg">Retry</button>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-50 to-indigo-50">
                    <th className="py-3 px-4 text-left font-semibold text-slate-700 text-sm">Full Name</th>
                    <th className="py-3 px-4 text-left font-semibold text-slate-700 text-sm">Email</th>
                    <th className="py-3 px-4 text-left font-semibold text-slate-700 text-sm">Phone</th>
                    <th className="py-3 px-4 text-left font-semibold text-slate-700 text-sm">Join Date</th>
                    <th className="py-3 px-4 text-left font-semibold text-slate-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500">
                        <User className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                        <p className="text-lg font-semibold">No users found</p>
                        <p className="text-sm mt-2">There are no users to display</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{u.fullName}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-slate-700">{u.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-slate-700">{u.phone || '—'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-slate-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(u.joinedAt)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button className="px-3 py-1 bg-red-50 text-red-700 rounded-md text-sm font-medium">Ban</button>
                            <button onClick={() => setSelectedUser(u)} className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm font-medium flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">User Details</h2>
                    <p className="text-slate-600 text-sm mt-1">{selectedUser.email}</p>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">Close</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Full Name</p>
                    <p className="font-medium text-slate-900">{selectedUser.fullName}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Email</p>
                    <p className="font-medium text-slate-900">{selectedUser.email}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Phone</p>
                    <p className="font-medium text-slate-900">{selectedUser.phone || '—'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Joined</p>
                    <p className="font-medium text-slate-900">{formatDate(selectedUser.joinedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
