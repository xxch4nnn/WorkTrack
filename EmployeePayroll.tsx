import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CalendarIcon, Download, FileText, Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PayslipView from "@/components/payroll/PayslipView";

// Payslip type definition
interface Payslip {
  id: number;
  employeeId: number;
  periodStart: string;
  periodEnd: string;
  dateIssued: string;
  grossPay: number;
  netPay: number;
  status: "Pending" | "Paid" | "Processing";
  payrollId: number;
}

export default function EmployeePayroll() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);

  // Fetch employee payslips
  const { data: payslips = [], isLoading } = useQuery({
    queryKey: ["/api/employee/payslips"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/employee/payslips");
      return await res.json();
    },
  });

  // Filter payslips based on search query and selected period
  const filteredPayslips = payslips.filter((payslip: Payslip) => {
    // Filter by search query (match against date or amount)
    const matchesSearch = !searchQuery || 
      formatDate(payslip.dateIssued).toLowerCase().includes(searchQuery.toLowerCase()) ||
      payslip.grossPay.toString().includes(searchQuery) ||
      payslip.netPay.toString().includes(searchQuery);
    
    // Filter by period if not "all"
    const matchesPeriod = selectedPeriod === "all" || getPayslipPeriod(payslip) === selectedPeriod;
    
    return matchesSearch && matchesPeriod;
  });

  // Helper to determine which period a payslip belongs to
  function getPayslipPeriod(payslip: Payslip): string {
    const date = new Date(payslip.dateIssued);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const payslipMonth = date.getMonth();
    const payslipYear = date.getFullYear();

    if (payslipYear === currentYear) {
      if (payslipMonth === currentMonth) return "current";
      if (payslipMonth === currentMonth - 1) return "previous";
      return "older";
    }
    return "older";
  }

  // Handle view payslip
  const handleViewPayslip = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setIsViewDialogOpen(true);
  };

  // Handle download payslip (placeholder for now)
  const handleDownloadPayslip = (payslip: Payslip) => {
    // This would be implemented to download the actual payslip PDF/document
    alert(`Downloading payslip #${payslip.id} issued on ${formatDate(payslip.dateIssued)}`);
  };

  // Render badge based on status
  const renderStatusBadge = (status: string) => {
    let badgeVariant = "default";
    
    switch (status) {
      case "Paid":
        badgeVariant = "success";
        break;
      case "Pending":
        badgeVariant = "warning";
        break;
      case "Processing":
        badgeVariant = "default";
        break;
      default:
        badgeVariant = "secondary";
    }
    
    return (
      <Badge variant={badgeVariant as any} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">My Payslips</CardTitle>
          <CardDescription>
            View and download your payslip history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
              <TabsList>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Calendar View
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Search payslips..." 
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Periods</SelectItem>
                    <SelectItem value="current">Current Month</SelectItem>
                    <SelectItem value="previous">Previous Month</SelectItem>
                    <SelectItem value="older">Older</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <TabsContent value="list" className="space-y-6">
              {isLoading ? (
                <div className="py-24 text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading your payslips...</p>
                </div>
              ) : filteredPayslips.length === 0 ? (
                <div className="py-24 text-center border rounded-lg">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No payslips found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? "No payslips match your search criteria." : "You have no payslips available yet."}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full min-w-[600px] caption-bottom text-sm">
                    <thead className="bg-muted/50">
                      <tr className="border-b">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Pay Period</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Issue Date</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Gross Pay</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Net Pay</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayslips.map((payslip: Payslip) => (
                        <tr key={payslip.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-4 align-middle">{formatDate(payslip.periodStart)} - {formatDate(payslip.periodEnd)}</td>
                          <td className="p-4 align-middle">{formatDate(payslip.dateIssued)}</td>
                          <td className="p-4 align-middle">{formatCurrency(payslip.grossPay)}</td>
                          <td className="p-4 align-middle font-medium">{formatCurrency(payslip.netPay)}</td>
                          <td className="p-4 align-middle">{renderStatusBadge(payslip.status)}</td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleViewPayslip(payslip)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDownloadPayslip(payslip)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="calendar" className="space-y-6">
              <div className="py-24 text-center border rounded-lg">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Calendar View Coming Soon</h3>
                <p className="text-muted-foreground">
                  We're working on a calendar view to make it easier to track your payslips by date.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Payslip View Dialog */}
      {selectedPayslip && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Payslip Details</DialogTitle>
              <DialogDescription>
                Pay period: {formatDate(selectedPayslip.periodStart)} - {formatDate(selectedPayslip.periodEnd)}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <PayslipView payslip={selectedPayslip} />
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="default"
                className="gap-2"
                onClick={() => handleDownloadPayslip(selectedPayslip)}
              >
                <Download className="h-4 w-4" /> Download
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}