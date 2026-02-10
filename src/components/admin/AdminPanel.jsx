import React, { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";
import AdminSidebar from "./AdminSideBar";
import AdminUsers from "./AdminUsers";
import AdminOverview from "./AdminOverview";
import { useAuth } from '../../context/AuthContext';
import { api } from '../..//lib/api';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { user: authUser, session, loading: authLoading, signOut } = useAuth();
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const navigate = useNavigate();0

  // Authentication & authorization are handled by AdminProtectedRoute.

  const handleLogout = () => {
    try {
      signOut();
    } catch (e) {
    }
    navigate('/login');
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/admin/orders')
        const data = res?.data?.orders ?? res?.data ?? []
        setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        // ignore here; AdminOrders will also fetch
        console.warn('AdminPanel: failed to load orders for overview', err)
      }
    }
    load()
  }, [])
0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-40 lg:hidden">0
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
                activePage={activeTab}
                setActivePage={setActiveTab}
            />0
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
          activePage={activeTab}
          setActivePage={setActiveTab}
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
          {/** Render content based on activeTab (defaults to 'dashboard') */}
          {(() => {
            switch (activeTab) {
              case 'dashboard':
                return <AdminOverview orders={orders} />
              case 'products':
                return <AdminProducts />
              case 'orders':
                return <AdminOrders />
              case 'users':
                return <AdminUsers />
              default:
                return <AdminOverview orders={orders} />
            }
          })()}
        </main>
      </div>
    </div>
  );
}