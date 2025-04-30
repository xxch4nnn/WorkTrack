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
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected routes wrapped in Layout */}
      <ProtectedRoute 
        path="/" 
        component={() => (
          <Layout>
            <Dashboard />
          </Layout>
        )} 
      />
      <ProtectedRoute 
        path="/employees" 
        component={() => (
          <Layout>
            <Employees />
          </Layout>
        )} 
      />
      <ProtectedRoute 
        path="/companies" 
        component={() => (
          <Layout>
            <Companies />
          </Layout>
        )} 
      />
      <ProtectedRoute 
        path="/dtr-management" 
        component={() => (
          <Layout>
            <DTRManagement />
          </Layout>
        )} 
      />
      <ProtectedRoute 
        path="/payroll" 
        component={() => (
          <Layout>
            <Payroll />
          </Layout>
        )} 
      />
      <ProtectedRoute 
        path="/reports" 
        component={() => (
          <Layout>
            <Reports />
          </Layout>
        )} 
        adminOnly={true} 
      />
      <ProtectedRoute 
        path="/settings" 
        component={() => (
          <Layout>
            <Settings />
          </Layout>
        )} 
        adminOnly={true} 
      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
