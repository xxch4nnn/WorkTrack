import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, Search, Filter, DollarSign, Clock, Printer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type PayslipType = {
  id: number;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  basicPay: number;
  overtimePay: number;
  deductions: {
    tax: number;
    sss: number;
    philhealth: number;
    pagibig: number;
    others: number;
  };
  netPay: number;
};

const EmployeePayroll = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("2023");
  
  // Fetch employee payslips
  const { data: payslips, isLoading } = useQuery({
    queryKey: ["/api/employee/payslips"],
    enabled: !!user,
  });

  // Mock data for display
  const mockPayslips: PayslipType[] = [
    {
      id: 1,
      periodStart: "2023-05-01",
      periodEnd: "2023-05-15",
      payDate: "2023-05-20",
      basicPay: 18000,
      overtimePay: 1500,
      deductions: { tax: 1950, sss: 800, philhealth: 400, pagibig: 200, others: 0 },
      netPay: 16150,
    },
    {
      id: 2,
      periodStart: "2023-04-16",
      periodEnd: "2023-04-30",
      payDate: "2023-05-05",
      basicPay: 18000,
      overtimePay: 0,
      deductions: { tax: 1800, sss: 800, philhealth: 400, pagibig: 200, others: 0 },
      netPay: 14800,
    },
    {
      id: 3,
      periodStart: "2023-04-01",
      periodEnd: "2023-04-15",
      payDate: "2023-04-20",
      basicPay: 18000,
      overtimePay: 2250,
      deductions: { tax: 2025, sss: 800, philhealth: 400, pagibig: 200, others: 300 },
      netPay: 16525,
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">My Payslips</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            Download All
          </Button>
        </div>
      </div>

      {/* Earnings Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings (2023)</CardTitle>
            <CardDescription>Year to date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(105000)}</p>
                <p className="text-xs text-gray-500">+5.2% from last year</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Monthly</CardTitle>
            <CardDescription>Based on 2023</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(30000)}</p>
                <p className="text-xs text-gray-500">Across 3.5 months</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overtime Earnings</CardTitle>
            <CardDescription>Year to date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold text-purple-700">{formatCurrency(15750)}</p>
                <p className="text-xs text-gray-500">15% of total earnings</p>
              </div>
              <Clock className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payslips List */}
      <Card>
        <CardHeader>
          <CardTitle>Payslip History</CardTitle>
          <CardDescription>View and download your payslips</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="2023" defaultChecked>2023</TabsTrigger>
              <TabsTrigger value="2022">2022</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search payslips" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          
          {mockPayslips.length === 0 ? (
            <div className="text-center py-10 border rounded-md">
              <DollarSign className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium">No Payslips Available</h3>
              <p className="text-gray-500">There are no payslips for the selected period.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-4 font-medium text-sm text-gray-500 border-b">
                <div className="col-span-4">Pay Period</div>
                <div className="col-span-2">Pay Date</div>
                <div className="col-span-2">Gross Pay</div>
                <div className="col-span-2">Deductions</div>
                <div className="col-span-2">Net Pay</div>
              </div>
              
              {mockPayslips.map((payslip) => {
                const totalDeductions = Object.values(payslip.deductions).reduce((sum, val) => sum + val, 0);
                const grossPay = payslip.basicPay + payslip.overtimePay;
                
                return (
                  <div key={payslip.id} className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50">
                    <div className="col-span-4 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="font-medium">{new Date(payslip.periodStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(payslip.periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                        <p className="text-xs text-gray-500">Pay Period</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p>{new Date(payslip.payDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                      <p className="text-xs text-gray-500">Pay Date</p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-medium">{formatCurrency(grossPay)}</p>
                      {payslip.overtimePay > 0 && (
                        <p className="text-xs text-blue-600">
                          Incl. {formatCurrency(payslip.overtimePay)} OT
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <p className="font-medium text-red-600">-{formatCurrency(totalDeductions)}</p>
                      <p className="text-xs text-gray-500">Tax, SSS, etc.</p>
                    </div>
                    <div className="col-span-2 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-600">{formatCurrency(payslip.netPay)}</p>
                        <p className="text-xs text-gray-500">Final Amount</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="flex justify-center mt-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print Tax Summary
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeePayroll;