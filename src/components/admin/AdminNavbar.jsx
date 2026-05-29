import React, { useState, useEffect } from 'react';
import { Bell, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '@/context/AuthContext';

export default function AdminNavbar({ onLogout, onToggleSidebar, isSidebarCollapsed, onToggleCollapse }) {
  const { user: authUser, signOut } = useAuth();
  const name = authUser?.name || authUser?.firstName || authUser?.email || 'Admin';
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [now, setNow] = useState(0);

  const formatTimeAgo = (iso) => {
    try {
      const t = new Date(iso).getTime();
      if (!now) return '';
      const diff = now - t;
      const sec = Math.floor(diff / 1000);
      if (sec < 60) return `${sec} sec${sec !== 1 ? 's' : ''} ago`;
      const min = Math.floor(sec / 60);
      if (min < 60) return `${min} min${min !== 1 ? 's' : ''} ago`;
      const hr = Math.floor(min / 60);
      if (hr < 24) return `${hr} hr${hr !== 1 ? 's' : ''} ago`;
      const days = Math.floor(hr / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } catch {
      return '';
    }
  };

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 60000);

    let mounted = true;

    const load = async () => {
      try {
        const res = await api.get('/admin/notifications');
        const data = res?.data?.notifications ?? res?.data ?? [];
        if (!mounted) return;
        const arr = Array.isArray(data) ? data : [];
        setNotifications(arr);
        setUnreadCount(arr.filter((n) => !n.read).length);
      } catch (err) {
        console.warn('Failed to load admin notifications', err);
      }
    };

    load();
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = (id) => {
    setNotifications((prev) => {
      const next = prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      );
      setUnreadCount(next.filter((n) => !n.read).length);
      return next;
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
    setUnreadCount(0);
  };

  const handleLogout = async () => {
    try {
      if (onLogout) {
        await onLogout();
        return;
      }

      await signOut('/admin/login');
    } catch {
      // ignore signout errors here; route guard will handle session state
    }
  };

  return (
    <header className="sticky top-0 z-40 flex w-full items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-700 to-orange-950 px-3 py-3 shadow-lg sm:px-4 sm:py-4">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg bg-white/10 p-2 transition-colors hover:bg-white/20 lg:hidden"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden rounded-lg bg-white/10 p-2 transition-colors hover:bg-white/20 lg:flex"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-5 w-5 text-white" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-white" />
            )}
          </button>
        )}

        <h2 className="truncate text-base font-bold text-white sm:text-xl lg:text-2xl">
          {name} Dashboard
        </h2>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 font-semibold text-white shadow-md transition hover:bg-purple-500"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow-lg">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 z-50 mt-2 w-[calc(100vw-1.5rem)] max-w-sm rounded-lg border border-purple-200 bg-white shadow-2xl sm:w-96">
              <div className="flex items-center justify-between border-b border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-4">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm font-medium text-purple-600 hover:text-purple-800"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`cursor-pointer border-b border-gray-100 p-4 transition hover:bg-purple-50 ${
                        !notification.read
                          ? 'border-l-4 border-l-purple-500 bg-gradient-to-r from-blue-50 to-purple-50'
                          : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        {!notification.read && (
                          <span className="ml-2 inline-block h-2 w-2 rounded-full bg-purple-500" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{formatTimeAgo(notification.created_at)}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">No new notifications</div>
                )}
              </div>

              <div className="border-t border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-3 text-center">
                <button className="text-sm font-medium text-purple-600 hover:text-purple-800">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-3 py-2 font-semibold text-white shadow-md transition hover:from-red-700 hover:to-red-800 sm:px-4"
          title="Logout"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
