import * as React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  Building2,
  FileText,
  CreditCard,
  BarChart,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type SidebarProps = {
  isOpen: boolean;
};

type NavItem = {
  label: string;
  icon: React.ReactNode;
  href: string;
};

const AdminSidebar = ({ isOpen }: SidebarProps) => {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: <BarChart3 className="mr-3 h-5 w-5" />,
      href: "/admin",
    },
    {
      label: "Employees",
      icon: <Users className="mr-3 h-5 w-5" />,
      href: "/admin/employees",
    },
    {
      label: "Companies/Clients",
      icon: <Building2 className="mr-3 h-5 w-5" />,
      href: "/admin/companies",
    },
    {
      label: "DTR Management",
      icon: <FileText className="mr-3 h-5 w-5" />,
      href: "/admin/dtr-management",
    },
    {
      label: "Payroll",
      icon: <CreditCard className="mr-3 h-5 w-5" />,
      href: "/admin/payroll",
    },
    {
      label: "Reports",
      icon: <BarChart className="mr-3 h-5 w-5" />,
      href: "/admin/reports",
    },
    {
      label: "Settings",
      icon: <Settings className="mr-3 h-5 w-5" />,
      href: "/admin/settings",
    },
  ];

  return (
    <aside
      className={cn(
        "bg-white w-64 border-r border-gray-200 pt-5 pb-2 flex flex-col z-20 transition-all duration-300",
        {
          "w-0 overflow-hidden lg:w-64": !isOpen,
          "w-64": isOpen,
        }
      )}
    >
      <div className="px-4 py-2 mb-4 bg-primary text-white mx-2 rounded-md">
        <h2 className="text-lg font-semibold">Admin Dashboard</h2>
        <p className="text-xs opacity-80">Manage your agency</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md",
                location === item.href
                  ? "sidebar-active bg-primary-light text-primary-dark border-l-4 border-primary"
                  : "text-gray-700 hover:bg-gray-50 hover:text-primary-dark"
              )}
            >
              {React.cloneElement(item.icon as React.ReactElement, {
                className: cn(
                  "mr-3 h-5 w-5",
                  location === item.href ? "text-primary" : "text-gray-500"
                ),
              })}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="px-4 py-2 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary-light">
              <span className="text-sm font-medium leading-none text-primary-dark">
                {user ? `${user.firstName[0]}${user.lastName[0]}` : 'AA'}
              </span>
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user ? `${user.firstName} ${user.lastName}` : 'Admin User'}</p>
            <p className="text-xs font-medium text-gray-500">{user?.role || 'Administrator'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;