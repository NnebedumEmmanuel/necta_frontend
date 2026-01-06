// AdminPanel.jsx
import React, { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";
import AdminSidebar from "./AdminSideBar";
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const [activePage, setActivePage] = useState("products");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: authUser, session, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication on component mount
    // Use AuthContext as the single source of truth for authentication
    const checkAuth = () => {
      if (authLoading) return;
      if (!session) {
        navigate('/login');
        return;
      }

      const isAdmin = (authUser && (authUser.role === 'admin' || authUser?.user_metadata?.role === 'admin')) || (localStorage.getItem('is_admin') === 'true');
      if (!isAdmin) {
        navigate('/');
        return;
      }

      setUser(authUser);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    // Use AuthContext signOut helper
    try {
      signOut();
    } catch (e) {
      // ignore
    }
    navigate('/login');
  };

  const renderPage = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      );
    }

    switch (activePage) {
      case "products": 
        return <AdminProducts />;
      case "dashboard": 
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto text-center py-12">
              <h2 className="text-3xl font-bold text-gray-800">Welcome, {user?.firstName || 'Admin'}!</h2>
              <p className="mt-4 text-gray-600">Admin Dashboard Overview</p>
            </div>
          </div>
        );
      case "orders": 
        return <AdminOrders />;
      case "users": 
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto text-center py-12">
              <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
              <p className="mt-4 text-gray-600">Manage your users here</p>
            </div>
          </div>
        );
      default: 
        return <AdminProducts />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Mobile Sidebar Overlay */}
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
      
      {/* Desktop Sidebar */}
      <div className={`hidden lg:block fixed left-0 top-0 h-screen z-30 transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}>
        <AdminSidebar 
          activePage={activePage} 
          setActivePage={setActivePage}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          user={user}
        />
      </div>
      
      {/* Main Content */}
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        <AdminNavbar 
          onLogout={handleLogout} 
          onToggleSidebar={() => setShowMobileSidebar(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          user={user}
        />
        
        <main className="flex-1">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}