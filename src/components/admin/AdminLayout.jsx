import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSideBar';
import AdminNavbar from './AdminNavbar';
import { useAuth } from '../../../context/AuthContext';

export default function AdminLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { user: authUser } = useAuth();

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-50 to-purple-50">
      {showMobileSidebar && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowMobileSidebar(false)}
          />
          <div className="relative z-50 h-full">
            <AdminSidebar
              isCollapsed={false}
              onClose={() => setShowMobileSidebar(false)}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              user={authUser}
            />
          </div>
        </div>
      )}

      <div
        className={`fixed left-0 top-0 z-30 hidden h-screen transition-all duration-300 ease-in-out lg:block ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          user={authUser}
        />
      </div>

      <div
        className={`min-h-screen min-w-0 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <AdminNavbar
          onLogout={() => {}}
          onToggleSidebar={() => setShowMobileSidebar(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          user={authUser}
        />

        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6">
          <div className="mx-auto w-full max-w-7xl min-w-0">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl font-bold sm:text-3xl">Admin Panel</h1>
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
