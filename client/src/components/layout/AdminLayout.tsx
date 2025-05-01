import { useState } from "react";
import Header from "./Header";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

type AdminLayoutProps = {
  children: React.ReactNode;
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Redirect non-admin users to the employee dashboard
  if (user && !isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header toggleSidebar={toggleSidebar} isAdminView={true} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar isOpen={sidebarOpen} />
        <main className="flex-1 bg-gray-50 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;