import React, { useState, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { LuminusLogo } from '@/assets/luminus-logo';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  Receipt,
  Settings,
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  CreditCard,
  FileText,
  ChevronDown
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
    { id: 'employees', label: 'Employees', icon: <Users size={18} />, path: '/employees' },
    { id: 'companies', label: 'Companies', icon: <Building2 size={18} />, path: '/companies' },
    { id: 'dtr', label: 'DTR Management', icon: <CalendarDays size={18} />, path: '/dtr-management' },
    { id: 'payroll', label: 'Payroll', icon: <CreditCard size={18} />, path: '/payroll' },
    { id: 'reports', label: 'Reports', icon: <FileText size={18} />, path: '/reports' },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} />, path: '/settings' },
  ];

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="flex h-screen bg-cream">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'w-[70px]' : 'w-[250px]'}`} style={{ transition: 'width 0.3s ease' }}>
        <div className="sidebar-header">
          <Link href="/" className="logo">
            <LuminusLogo size={28} />
            {!sidebarCollapsed && <span className="ml-2">LUMINUS</span>}
          </Link>
          <button onClick={toggleSidebar} className="text-white p-1 rounded-md hover:bg-blue-600">
            <Menu size={20} />
          </button>
        </div>

        <div className="user-profile">
          <div className="user-avatar">
            <User size={16} />
          </div>
          {!sidebarCollapsed && (
            <div className="user-info">
              <div className="user-name">Admin User</div>
              <div className="user-role">Administrator</div>
            </div>
          )}
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.path}
              className={`nav-item ${location === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!sidebarCollapsed && (
            <>
              <span>Luminus v1.0</span>
              <a href="#" className="mt-1">Help & Documentation</a>
              <div className="flex items-center mt-3">
                <LogOut size={16} className="mr-2" />
                <span>Log Out</span>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-[70px]' : 'ml-[250px]'}`}>
        {/* Top Bar */}
        <div className="topbar">
          <div className="page-title">
            {location === '/' && 'Dashboard'}
            {location === '/employees' && 'Employees'}
            {location === '/companies' && 'Companies'}
            {location === '/dtr-management' && 'DTR Management'}
            {location === '/payroll' && 'Payroll'}
            {location === '/reports' && 'Reports'}
            {location === '/settings' && 'Settings'}
          </div>

          <div className="topbar-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search..."
                className="search-input"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <Search className="search-icon" size={16} />
            </div>
            
            <div className="topbar-icon">
              <Bell size={18} />
              <span className="notification-badge">3</span>
            </div>
            
            <div className="topbar-icon">
              <User size={18} />
              <ChevronDown size={14} className="ml-1" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;