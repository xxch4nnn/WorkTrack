import { useState, useEffect } from "react";
import Header from "./Header";
import EmployeeSidebar from "./EmployeeSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarToggle } from "@/components/ui/sidebar-toggle";

type EmployeeLayoutProps = {
  children: React.ReactNode;
};

const EmployeeLayout = ({ children }: EmployeeLayoutProps) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // Update sidebar state on mobile/desktop switch
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <EmployeeSidebar isOpen={sidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} isAdminView={false} />
        
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50 relative">
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

export default EmployeeLayout;