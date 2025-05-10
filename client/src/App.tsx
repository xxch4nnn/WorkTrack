import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import Companies from "@/pages/Companies";
import DTRManagement from "@/pages/DTRManagement";
import Payroll from "@/pages/Payroll";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import NotificationContainer from "@/components/ui/notifications/NotificationContainer";
import { PermissionsProvider } from "@/hooks/use-permissions";
// Use local UserRoles definition to avoid import issues
const UserRoles = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
} as const;
import { useEffect, useState } from "react";
import { apiRequest } from "./lib/queryClient";
import DTRCapture from "@/components/dtr/DTRCapture";

function Router() {
  // We should fetch these from the server, but for now we're simulating them
  const [userData, setUserData] = useState<{
    role: string | null;
    permissions: Record<string, string[]>;
    managedCompanyIds: number[];
  }>({
    role: UserRoles.ADMIN, // Default for development
    permissions: {},
    managedCompanyIds: [],
  });

  // In a real app, this would be fetched from an API
  useEffect(() => {
    // This is a mock implementation. In production, we'd fetch from the server
    const fetchUserData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock permission data for demo
        setUserData({
          role: UserRoles.ADMIN, // For dev purposes using Admin
          permissions: {},
          managedCompanyIds: [],
        });
      } catch (error) {
        console.error("Failed to fetch user permissions:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <PermissionsProvider
      initialUserRole={userData.role as any}
      initialPermissions={userData.permissions}
      initialManagedCompanyIds={userData.managedCompanyIds}
    >
      <Layout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/employees" component={Employees} />
          <Route path="/companies" component={Companies} />
          <Route path="/dtr-management" component={DTRManagement} />
          <Route path="/dtr-management/capture" component={DTRCapture} />
          <Route path="/payroll" component={Payroll} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </PermissionsProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <NotificationContainer position="top-right" maxNotifications={5} />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
