import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmployeeList from "@/components/employees/EmployeeList";
import EmployeeForm from "@/components/employees/EmployeeForm";
import { Plus, Search } from "lucide-react";

const Employees = () => {
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: employees, isLoading } = useQuery({
    queryKey: ['/api/employees'],
  });

  const filteredEmployees = employees?.filter((employee) => {
    // Filter by search query
    const matchesQuery =
      searchQuery === "" ||
      employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by tab
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && employee.status === "Active") ||
      (activeTab === "inactive" && employee.status === "Inactive");

    return matchesQuery && matchesTab;
  });

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Employees
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage all employee information and records.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button onClick={() => setIsAddingEmployee(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      {isAddingEmployee ? (
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Add New Employee</h3>
          <EmployeeForm
            onCancel={() => setIsAddingEmployee(false)}
            onSubmit={() => setIsAddingEmployee(false)}
          />
        </Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                className="pl-8"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full sm:w-auto"
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <EmployeeList
            employees={filteredEmployees}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
};

export default Employees;
