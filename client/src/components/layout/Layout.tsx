import React, { useState, ReactNode, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { LuminusLogo } from '@/assets/luminus-logo';
import { LighthouseLogo } from '@/assets/lighthouse-logo';
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
  ChevronDown,
  Shield,
  HelpCircle,
  Database,
  BookOpen,
  AlertTriangle,
  BarChart4,
  Clock,
  Upload,
  Camera
} from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import notificationService from '@/lib/services/notificationService';
import authService from '@/lib/services/authService';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  permissions?: { resource: string; action: string };
  subItems?: NavItem[];
  adminOnly?: boolean;
  managerOnly?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSubmenus, setExpandedSubmenus] = useState<Record<string, boolean>>({});
  const [notificationCount, setNotificationCount] = useState(3);
  
  // For demo purposes we'll use these permissions. In a real app, fetch from API
  const userPermissions = {
    userRole: 'Admin',
    hasPermission: (resource: string, action: string) => true,
    isAdmin: true,
    isManager: false,
    isEmployee: false,
    canAccess: (path: string) => true,
    managedCompanyIds: [],
  };
  
  // Define all navigation items with permissions
  const allNavItems: NavItem[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard size={18} />, 
      path: '/',
      permissions: { resource: 'EMPLOYEES', action: 'VIEW' }
    },
    { 
      id: 'employees', 
      label: 'Employees', 
      icon: <Users size={18} />, 
      path: '/employees',
      permissions: { resource: 'EMPLOYEES', action: 'VIEW' }
    },
    { 
      id: 'companies', 
      label: 'Companies', 
      icon: <Building2 size={18} />, 
      path: '/companies',
      permissions: { resource: 'COMPANIES', action: 'VIEW' }
    },
    { 
      id: 'dtr', 
      label: 'DTR Management', 
      icon: <CalendarDays size={18} />, 
      path: '/dtr-management',
      permissions: { resource: 'DTRS', action: 'VIEW' },
      subItems: [
        { id: 'dtr-view', label: 'View Records', icon: <Clock size={16} />, path: '/dtr-management' },
        { id: 'dtr-upload', label: 'Upload DTR', icon: <Upload size={16} />, path: '/dtr-management/upload' },
        { id: 'dtr-capture', label: 'Capture DTR', icon: <Camera size={16} />, path: '/dtr-management/capture' },
      ]
    },
    { 
      id: 'payroll', 
      label: 'Payroll', 
      icon: <CreditCard size={18} />, 
      path: '/payroll',
      permissions: { resource: 'PAYROLLS', action: 'VIEW' }
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: <BarChart4 size={18} />, 
      path: '/reports',
      permissions: { resource: 'REPORTS', action: 'VIEW' }
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: <Settings size={18} />, 
      path: '/settings',
      permissions: { resource: 'SETTINGS', action: 'VIEW' },
      adminOnly: true
    },
  ];
  
  // Filter navigation items based on user permissions
  const navItems = allNavItems.filter(item => {
    if (item.adminOnly && !userPermissions.isAdmin) return false;
    if (item.managerOnly && !(userPermissions.isManager || userPermissions.isAdmin)) return false;
    if (item.permissions) {
      return userPermissions.hasPermission(item.permissions.resource, item.permissions.action);
    }
    return true;
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };
  
  const toggleSubmenu = (id: string) => {
    setExpandedSubmenus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    // Add search logic here
    console.log('Searching for:', searchQuery);
    
    // Show a notification for demo purposes
    notificationService.info(
      'Search Results', 
      `Found 5 results for "${searchQuery}"`,
      5000
    );
  };
  
  // Sample notification system for demo
  const clearNotifications = () => {
    notificationService.success('Notifications Cleared', 'All notifications have been marked as read');
    setNotificationCount(0);
  };
  
  // Get page title from location
  const getPageTitle = () => {
    const path = location.split('/')[1] || 'dashboard';
    const route = allNavItems.find(item => item.path === `/${path}`) || 
                allNavItems.find(item => 
                  item.subItems?.some(subItem => subItem.path === `/${path}`));
                  
    if (route) {
      return route.label;
    }
    
    // Handle special cases
    switch (path) {
      case '': return 'Dashboard';
      case 'not-found': return '404 Not Found';
      default: return path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-cream">
      {/* Mobile header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center">
          <button onClick={toggleMobileMenu} className="mr-3 text-gray-600">
            <Menu size={24} />
          </button>
          <Link href="/" className="flex items-center">
            <LuminusLogo size={24} />
            <span className="ml-2 font-bold text-xl">LUMINUS</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative">
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </button>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
            <User size={14} />
          </div>
        </div>
      </header>

      {/* Sidebar - hidden on mobile unless toggled */}
      <aside 
        className={`sidebar ${sidebarCollapsed ? 'w-[70px]' : 'w-[250px]'} ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ transition: 'width 0.3s ease, transform 0.3s ease' }}
      >
        <div className="sidebar-header">
          <Link href="/" className="logo">
            <LuminusLogo size={28} />
            {!sidebarCollapsed && <span className="ml-2">LUMINUS</span>}
          </Link>
          <button onClick={toggleSidebar} className="text-white p-1 rounded-md hover:bg-blue-600 lg:block hidden">
            <Menu size={20} />
          </button>
          <button onClick={toggleMobileMenu} className="text-white p-1 rounded-md hover:bg-blue-600 lg:hidden block">
            <ChevronDown size={20} />
          </button>
        </div>

        <div className="user-profile">
          <div className="user-avatar">
            <User size={16} />
          </div>
          {!sidebarCollapsed && (
            <div className="user-info">
              <div className="user-name">Admin User</div>
              <div className="user-role">
                {userPermissions.isAdmin ? 'Administrator' : 
                 userPermissions.isManager ? 'Manager' : 'Employee'}
              </div>
            </div>
          )}
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <React.Fragment key={item.id}>
              {item.subItems ? (
                <div className="submenu-container">
                  <button
                    onClick={() => toggleSubmenu(item.id)}
                    className={`nav-item flex items-center justify-between w-full ${
                      location.startsWith(item.path) ? 'active' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="nav-icon">{item.icon}</span>
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${
                          expandedSubmenus[item.id] ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>
                  {(expandedSubmenus[item.id] || sidebarCollapsed) && (
                    <div className={`submenu ${sidebarCollapsed ? 'absolute left-full top-0 ml-1 bg-primary w-48 rounded-md shadow-lg z-10' : ''}`}>
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.id}
                          href={subItem.path}
                          className={`nav-item ${
                            location === subItem.path ? 'active' : ''
                          } ${sidebarCollapsed ? 'px-4 py-2' : 'pl-8'}`}
                        >
                          {!sidebarCollapsed && (
                            <>
                              <span className="nav-icon">{subItem.icon}</span>
                              <span>{subItem.label}</span>
                            </>
                          )}
                          {sidebarCollapsed && (
                            <>
                              <span className="nav-icon">{subItem.icon}</span>
                              <span>{subItem.label}</span>
                            </>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.path}
                  className={`nav-item ${location === item.path ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!sidebarCollapsed && (
            <>
              <span>Luminus v1.0</span>
              <div className="flex items-center mt-1">
                <HelpCircle size={14} className="mr-2" />
                <a href="#" className="text-xs">Help & Documentation</a>
              </div>
              <button 
                onClick={() => {
                  notificationService.success(
                    'Logging Out', 
                    'You will be logged out shortly...'
                  );
                  // Actual logout process
                  authService.logout();
                }}
                className="flex items-center mt-3 hover:text-white/80 cursor-pointer w-full"
              >
                <LogOut size={14} className="mr-2" />
                <span>Log Out</span>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[70px]' : 'lg:ml-[250px]'}`}>
        {/* Top Bar */}
        <div className="topbar hidden lg:flex">
          <div className="page-title">
            {getPageTitle()}
          </div>

          <div className="topbar-actions">
            <form onSubmit={handleSearchSubmit} className="search-container">
              <input
                type="text"
                placeholder="Search..."
                className="search-input"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <Search className="search-icon" size={16} />
            </form>
            
            <div className="topbar-icon relative group">
              <Bell size={18} />
              {notificationCount > 0 && (
                <span className="notification-badge">{notificationCount}</span>
              )}
              
              {/* Notification dropdown */}
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20 hidden group-hover:block">
                <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-medium">Notifications</h3>
                  <button 
                    onClick={clearNotifications} 
                    className="text-xs text-primary hover:text-primary-darker"
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="notification-item">
                    <div className="icon bg-primary-lighter text-primary">
                      <User size={14} />
                    </div>
                    <div className="content">
                      <p className="message">New employee registration</p>
                      <p className="time">10 min ago</p>
                    </div>
                  </div>
                  <div className="notification-item">
                    <div className="icon bg-warning-lighter text-warning">
                      <AlertTriangle size={14} />
                    </div>
                    <div className="content">
                      <p className="message">New DTR format needs review</p>
                      <p className="time">1 hour ago</p>
                    </div>
                  </div>
                  <div className="notification-item">
                    <div className="icon bg-success-lighter text-success">
                      <FileText size={14} />
                    </div>
                    <div className="content">
                      <p className="message">Payroll for May is ready</p>
                      <p className="time">Yesterday</p>
                    </div>
                  </div>
                </div>
                <div className="p-2 border-t border-gray-200 text-center">
                  <a href="#" className="text-xs text-primary hover:text-primary-darker">View all notifications</a>
                </div>
              </div>
            </div>
            
            <div className="topbar-icon relative group">
              <div className="flex items-center">
                <User size={18} />
                <ChevronDown size={14} className="ml-1" />
              </div>
              
              {/* User dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 hidden group-hover:block">
                <div className="p-3 border-b border-gray-200">
                  <p className="font-medium">Admin User</p>
                  <p className="text-xs text-gray-500">admin@example.com</p>
                </div>
                <div className="py-1">
                  <Link href="/settings" className="user-menu-item">
                    <User size={14} className="mr-2" />
                    <span>Profile</span>
                  </Link>
                  <Link href="/settings" className="user-menu-item">
                    <Settings size={14} className="mr-2" />
                    <span>Settings</span>
                  </Link>
                  <Link href="/settings?tab=security" className="user-menu-item">
                    <Shield size={14} className="mr-2" />
                    <span>Security</span>
                  </Link>
                </div>
                <div className="border-t border-gray-200 py-1">
                  <button 
                    onClick={() => {
                      notificationService.success(
                        'Logging Out', 
                        'You will be logged out shortly...'
                      );
                      // Actual logout process
                      authService.logout();
                    }}
                    className="user-menu-item w-full text-left text-error"
                  >
                    <LogOut size={14} className="mr-2" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-6">
          {/* Development mode indicator */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-2 bg-yellow/10 border border-yellow rounded-md text-sm flex items-center">
              <AlertTriangle size={16} className="text-yellow mr-2" />
              <div>
                <span className="font-medium">Development Mode</span> - 
                Role: {userPermissions.isAdmin ? 'Admin' : userPermissions.isManager ? 'Manager' : 'Employee'}
              </div>
            </div>
          )}
          
          {children}
          
          {/* Branded footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <LighthouseLogo size={16} className="mr-2" />
              <span>Powered by Lighthouse Solutions</span>
            </div>
            <div>© {new Date().getFullYear()} Luminus HR System</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;