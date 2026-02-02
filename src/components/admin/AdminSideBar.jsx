import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  HelpCircle, 
  X,
  LogOut,
  Settings
} from 'lucide-react';

const AdminSidebar = ({ isCollapsed, onClose, user }) => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: HelpCircle, label: 'Support', path: '/admin/support' },
  ];

  return (
    <aside className={`h-full bg-slate-900 text-white shadow-2xl flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        {!isCollapsed && (
          <span className="text-lg font-bold tracking-wide">Necta Admin</span>
        )}
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="lg:hidden p-2 text-slate-300 hover:bg-slate-800 rounded-lg">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-2">
        {menuItems.map((item) => {
          const isActive = location.pathname.includes(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose && onClose()}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20 font-medium' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer User Info */}
      <div className="p-4 border-t border-slate-800">
        <div className={`flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
            {user?.firstName?.[0] || 'A'}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.firstName || 'Admin'}</p>
              <p className="text-xs text-slate-400 truncate">Store Manager</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;