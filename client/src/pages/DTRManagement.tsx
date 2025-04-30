import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DTRTable from "@/components/dtr/DTRTable";
import DTRForm from "@/components/dtr/DTRForm";
import { Plus, Search, Filter } from "lucide-react";

const DTRManagement = () => {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1]);
  
  const [isAddingDTR, setIsAddingDTR] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(searchParams.get("status") || "all");
  const [dtrType, setDtrType] = useState("all");

  const { data: dtrs, isLoading } = useQuery({
    queryKey: ['/api/dtrs'],
  });
  
  const { data: employees, isLoading: isEmployeesLoading } = useQuery({
    queryKey: ['/api/employees'],
  });

  const filteredDTRs = dtrs?.filter((dtr) => {
    // Filter by search query (employee name would be implemented in a real app)
    const matchesQuery =
      searchQuery === "" || dtr.employeeId.toString().includes(searchQuery);

    // Filter by tab
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && dtr.status === "Pending") ||
      (activeTab === "approved" && dtr.status === "Approved") ||
      (activeTab === "rejected" && dtr.status === "Rejected") ||
      (activeTab === "processing" && dtr.status === "Processing");
      
    // Filter by DTR type
    const matchesType =
      dtrType === "all" || dtr.type === dtrType;

    return matchesQuery && matchesTab && matchesType;
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update URL without navigation
    const newSearchParams = new URLSearchParams(location.split("?")[1]);
    newSearchParams.set("status", value);
    setLocation(`/dtr-management?${newSearchParams.toString()}`, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            DTR Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage daily time records for all employees.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button onClick={() => setIsAddingDTR(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add DTR
          </Button>
        </div>
      </div>

      {isAddingDTR ? (
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Add New DTR</h3>
          <DTRForm
            employees={employees}
            isLoading={isEmployeesLoading}
            onCancel={() => setIsAddingDTR(false)}
            onSubmit={() => setIsAddingDTR(false)}
          />
        </Card>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-2 mb-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                className="pl-8"
                placeholder="Search by employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Type:</span>
                <Select value={dtrType} onValueChange={setDtrType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Bi-Weekly">Bi-Weekly</SelectItem>
                    <SelectItem value="Project-based">Project-based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <DTRTable
            dtrs={filteredDTRs}
            isLoading={isLoading}
            employees={employees}
          />
        </>
      )}
    </div>
  );
};

export default DTRManagement;
