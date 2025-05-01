import { useState, useEffect } from "react";
import Header from "./Header";
import EmployeeSidebar from "./EmployeeSidebar";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";

type EmployeeLayoutProps = {
  children: React.ReactNode;
};

const EmployeeLayout = ({ children }: EmployeeLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Redirect admin/manager users to the admin dashboard
  useEffect(() => {
    if (user && isAdmin) {
      setLocation("/admin");
    }
  }, [user, isAdmin, setLocation]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header toggleSidebar={toggleSidebar} isAdminView={false} />
      <div className="flex flex-1 overflow-hidden">
        <EmployeeSidebar isOpen={sidebarOpen} />
        <main className="flex-1 bg-gray-50 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;