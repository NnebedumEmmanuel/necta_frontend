// components/admin/AdminNavbar.jsx - Updated
import React, { useState } from "react";
import { Bell, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from '@/context/AuthContext';

export default function AdminNavbar({ onLogout, onToggleSidebar, isSidebarCollapsed, onToggleCollapse }) {
  const { user: authUser, signOut } = useAuth();
  const name = authUser?.firstName || "Admin";
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New order received", time: "5 min ago", read: false },
    { id: 2, message: "System update completed", time: "1 hour ago", read: false },
    { id: 3, message: "Payment processed", time: "2 hours ago", read: true },
  ]);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (e) {
      // ignore
    }
    if (onLogout) onLogout();
  };

  return (
    <header className="w-full bg-gradient-to-r from-slate-900 via-slate-700 to-orange-950 shadow-lg p-4 flex justify-between items-center sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>

        {/* Desktop Collapse Button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 text-white" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-white" />
            )}
          </button>
        )}

        <h2 className="text-xl sm:text-2xl font-bold text-white">
          {name} Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="flex items-center justify-center w-10 h-10 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition relative shadow-md"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center shadow-lg">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-purple-200 z-50">
              <div className="p-4 border-b border-purple-200 flex justify-between items-center bg-gradient-to-r from-purple-50 to-indigo-50">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
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
                      className={`p-4 border-b border-gray-100 hover:bg-purple-50 cursor-pointer transition ${
                        !notification.read ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-purple-500' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        {!notification.read && (
                          <span className="ml-2 inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                )}
              </div>
              
              <div className="p-3 border-t border-purple-200 text-center bg-gradient-to-r from-purple-50 to-indigo-50">
                <button className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold transition shadow-md"
          title="Logout"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}