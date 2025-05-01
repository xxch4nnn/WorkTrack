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
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;