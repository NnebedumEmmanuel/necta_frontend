import React from "react";
import { 
  ShoppingCart, 
  Package, 
  LayoutDashboard, 
  User, 
  Settings, 
  X,
  Home,
  BarChart,
  Users,
  FileText,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function AdminSidebar({ activePage, setActivePage, isCollapsed, onClose, onToggleCollapse }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "products", label: "Products", icon: <Package size={20} /> },
    { id: "orders", label: "Orders", icon: <ShoppingCart size={20} /> },
    { id: "users", label: "Users", icon: <Users size={20} /> },
  ];

  const LinkItem = ({ id, label, icon }) => (
    <button
      onClick={() => {
        setActivePage(id);
        if (onClose) onClose();
      }}
      className={`flex items-center gap-3 p-3 w-full rounded-xl transition text-left font-medium
        ${activePage === id 
          ? "bg-gradient-to-r from-slate-600 to-orange-800 text-white shadow-lg" 
          : "text-gray-200 hover:bg-white/10 hover:text-white"}`}
      title={isCollapsed ? label : ""}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!isCollapsed && <span className="truncate">{label}</span>}
    </button>
  );

  return (
    <aside className={`bg-gradient-to-b from-slate-900 via-slate-800 to-orange-950 text-gray-200 h-screen sticky top-0 overflow-y-auto flex flex-col shadow-2xl transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {}
      <div className="p-6 border-b border-purple-700">
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
            <>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white truncate">Admin Panel</h1>
                <p className="text-purple-200 text-xs mt-1 truncate">Manage your store</p>
              </div>
              <button 
                onClick={onToggleCollapse}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft size={20} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center w-full">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-2">
                <Home size={18} />
              </div>
              <button 
                onClick={onToggleCollapse}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Expand sidebar"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {}
      {onClose && (
        <div className="p-4 border-b border-purple-700 lg:hidden">
          <button 
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X size={18} />
            {!isCollapsed && <span>Close Menu</span>}
          </button>
        </div>
      )}

      {}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <LinkItem 
            key={item.id} 
            id={item.id} 
            label={item.label} 
            icon={item.icon} 
          />
        ))}
      </nav>

      {}
      <div className="p-4 border-t border-purple-700 space-y-2">
        <button 
          className="flex items-center gap-3 p-3 w-full rounded-xl text-gray-200 hover:bg-white/10 hover:text-white transition font-medium"
          title={isCollapsed ? "Settings" : ""}
        >
          <Settings size={20} />
          {!isCollapsed && <span>Settings</span>}
        </button>
        
        <button 
          className="flex items-center gap-3 p-3 w-full rounded-xl text-gray-200 hover:bg-white/10 hover:text-white transition font-medium"
          title={isCollapsed ? "Help" : ""}
        >
          <HelpCircle size={20} />
          {!isCollapsed && <span>Help & Support</span>}
        </button>
      </div>

      {}
      {isCollapsed && (
        <div className="fixed left-20 top-0 h-screen pointer-events-none z-50">
          <div className="relative h-full">
            {}
          </div>
        </div>
      )}
    </aside>
  );
}