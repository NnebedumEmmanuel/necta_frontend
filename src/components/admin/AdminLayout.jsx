import React, { useState } from 'react';
import AdminSidebar from './AdminSideBar';
import AdminNavbar from './AdminNavbar';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { user: authUser } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
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

      <div className={`hidden lg:block fixed left-0 top-0 h-screen z-30 transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}>
        <AdminSidebar 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          user={authUser}
        />
      </div>

      <div className={`min-h-screen flex flex-col transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        <AdminNavbar 
          onLogout={() => {}}
          onToggleSidebar={() => setShowMobileSidebar(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          user={authUser}
        />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Admin Panel</h1>
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
