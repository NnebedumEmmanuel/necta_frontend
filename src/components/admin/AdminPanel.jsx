import React, { useState } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";
import AdminSidebar from "./AdminSideBar";
import AdminUsers from "./AdminUsers";
import { useAuth } from '@/context/AuthContext';
import { Routes, Route } from 'react-router-dom';

export default function AdminPanel() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { user: authUser, session, loading: authLoading, signOut } = useAuth();

  // Authentication & authorization are handled by AdminProtectedRoute.

  const handleLogout = () => {
    try {
      signOut();
    } catch (e) {
    }
    navigate('/login');
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
            onClick={() => setShowMobileSidebar(false)}
          />
          <div className="relative z-50 h-full">
            <AdminSidebar 
              activePage={activePage} 
              setActivePage={setActivePage} 
              isCollapsed={false}
              onClose={() => setShowMobileSidebar(false)}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              user={user}
            />
          </div>
        </div>
      )}
      
      {}
      <div className={`hidden lg:block fixed left-0 top-0 h-screen z-30 transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}>
        <AdminSidebar 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          user={authUser}
        />
      </div>
      
      {}
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        <AdminNavbar 
          onLogout={handleLogout} 
          onToggleSidebar={() => setShowMobileSidebar(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          user={authUser}
        />
        
        <main className="flex-1">
          <Routes>
            <Route index element={<AdminProducts />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="*" element={<AdminProducts />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}