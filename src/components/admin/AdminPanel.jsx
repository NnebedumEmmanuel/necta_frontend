// AdminPanel.jsx
import React, { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";
import AdminSidebar from "./AdminSideBar";
import { authService } from "../../../services/authServices"; // Update path as needed
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const [activePage, setActivePage] = useState("products");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication on component mount
    const checkAuth = async () => {
      if (!authService.isAuthenticated()) {
        navigate("/login");
        return;
      }

      if (!authService.isAdmin()) {
        navigate("/");
        return;
      }

      try {
        const userData = authService.getUser();
        setUser(userData);
      } catch (error) {
        console.error("Failed to load user:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
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