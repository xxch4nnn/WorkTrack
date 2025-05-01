import { useState, useEffect } from "react";
import Header from "./Header";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Redirect } from "wouter";
import { SidebarToggle } from "@/components/ui/sidebar-toggle";

type AdminLayoutProps = {
  children: React.ReactNode;
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { user, isAdmin } = useAuth();

  // Update sidebar state on mobile/desktop switch
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

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
        <main className="flex-1 bg-gray-50 p-4 md:p-6 overflow-auto relative">
          {/* Desktop sidebar toggle - fixed to the side */}
          <SidebarToggle 
            isOpen={sidebarOpen} 
            toggleSidebar={toggleSidebar}
            className="absolute left-4 top-4 z-10"
          />
          
          <div className="container mx-auto">
            {children}
          </div>
          
          <footer className="mt-auto py-4 border-t bg-white">
            <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
              <div>
                © {new Date().getFullYear()} Solaire Manpower Agency | Powered by Lighthouse
              </div>
              <div className="flex gap-4 mt-2 sm:mt-0">
                <a href="/terms-and-conditions" className="hover:text-primary transition-colors">
                  Terms & Conditions
                </a>
                <a href="/privacy-policy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;