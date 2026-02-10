import React, { useEffect, useState } from 'react';
import { Eye, User, Calendar } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '@/context/ToastProvider';

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
      const res = await api.get('/admin/customers');
      // API shape: { success: true, data: [...] }
      console.info('Admin Users Data:', res?.data);
      const data = res?.data?.data ?? res?.data ?? [];
      const normalized = (Array.isArray(data) ? data : []).map((u) => ({
        id: u.id,
        name: u.name ?? (u.__raw && (u.__raw.name || (u.__raw.users && u.__raw.users[0]?.name))) ?? null,
        email: u.email,
        phone: u.phone ?? (u.__raw && (u.__raw.phone || (u.__raw.users && u.__raw.users[0]?.phone))) ?? null,
        total_orders: Number(u.total_orders ?? 0),
        total_spent: Number(u.total_spent ?? 0),
        last_order_date: u.last_order_date ?? null,
  joinedAt: u.joined_at ?? (u.__raw && (u.__raw.users && u.__raw.users[0]?.created_at)) ?? (u.__raw && u.__raw.created_at) ?? null,
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

  const formatCurrency = (n) => {
    try {
      const num = Number(n) || 0;
      return num.toLocaleString(undefined, { style: 'currency', currency: 'NGN' });
    } catch {
      return String(n);
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
                    <th className="py-3 px-4 text-left font-semibold text-slate-700 text-sm">Email</th>
                    <th className="py-3 px-4 text-left font-semibold text-slate-700 text-sm">Total Orders</th>
                    <th className="py-3 px-4 text-left font-semibold text-slate-700 text-sm">Total Spent</th>
                    <th className="py-3 px-4 text-left font-semibold text-slate-700 text-sm">Last Order</th>
                    <th className="py-3 px-4 text-left font-semibold text-slate-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500">
                        <User className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                        <p className="text-lg font-semibold">No customers found</p>
                        <p className="text-sm mt-2">There are no customers to display</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="text-sm text-slate-700">{u.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{u.total_orders}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-slate-700">{formatCurrency(u.total_spent)}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-slate-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(u.last_order_date)}
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
                    <p className="font-medium text-slate-900">{selectedUser.name ?? '—'}</p>
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
