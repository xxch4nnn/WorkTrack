import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import CompanyList from "@/components/companies/CompanyList";
import CompanyForm from "@/components/companies/CompanyForm";
import { Plus, Search } from "lucide-react";

const Companies = () => {
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: companies, isLoading } = useQuery({
    queryKey: ['/api/companies'],
  });

  const filteredCompanies = companies?.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Companies/Clients
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage all company and client information.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button onClick={() => setIsAddingCompany(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </div>
      </div>

      {isAddingCompany ? (
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Add New Company</h3>
          <CompanyForm
            onCancel={() => setIsAddingCompany(false)}
            onSubmit={() => setIsAddingCompany(false)}
          />
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                className="pl-8"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <CompanyList
            companies={filteredCompanies}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
};

export default Companies;
