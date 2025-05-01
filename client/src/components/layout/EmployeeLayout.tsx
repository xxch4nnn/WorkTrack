import { useState } from "react";
import Header from "./Header";
import EmployeeSidebar from "./EmployeeSidebar";

type EmployeeLayoutProps = {
  children: React.ReactNode;
};

const EmployeeLayout = ({ children }: EmployeeLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <EmployeeSidebar isOpen={sidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} isAdminView={false} />
        
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;