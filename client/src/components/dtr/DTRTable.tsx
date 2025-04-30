import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, MoreVertical, CheckCircle, XCircle, Edit, CreditCard } from "lucide-react";
import { DTR, Employee } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tooltip } from "@/components/ui/tooltip";

type DTRTableProps = {
  dtrs?: DTR[];
  isLoading: boolean;
  employees?: Employee[];
};

const DTRTable = ({ dtrs = [], isLoading, employees = [] }: DTRTableProps) => {
  const { toast } = useToast();

  const handleViewDTR = (dtrId: number) => {
    toast({
      title: "View DTR",
      description: `Viewing DTR #${dtrId}`,
    });
  };

  const handleApproveDTR = async (dtrId: number) => {
    try {
      await apiRequest("PATCH", `/api/dtrs/${dtrId}/approve`, {});
      await queryClient.invalidateQueries({ queryKey: ['/api/dtrs'] });
      toast({
        title: "DTR Approved",
        description: "The DTR has been approved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve DTR. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectDTR = async (dtrId: number) => {
    try {
      await apiRequest("PATCH", `/api/dtrs/${dtrId}/reject`, {});
      await queryClient.invalidateQueries({ queryKey: ['/api/dtrs'] });
      toast({
        title: "DTR Rejected",
        description: "The DTR has been rejected.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject DTR. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProcessPayroll = async (dtrId: number) => {
    try {
      await apiRequest("POST", `/api/payroll/process/${dtrId}`, {});
      await queryClient.invalidateQueries({ queryKey: ['/api/dtrs'] });
      toast({
        title: "Processing Payroll",
        description: "The payroll is being processed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payroll. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
            Pending
          </span>
        );
      case "Approved":
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            Rejected
          </span>
        );
      case "Processing":
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            Processing
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : `Employee #${employeeId}`;
  };

  return (
    <Card className="overflow-hidden">
      <div className="w-full overflow-auto max-h-[70vh]">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hours
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </td>
                  </tr>
                ))
            ) : dtrs.length > 0 ? (
              dtrs.map((dtr) => (
                <tr key={dtr.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getEmployeeName(dtr.employeeId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{dtr.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {dtr.timeIn} - {dtr.timeOut}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {dtr.regularHours} hrs
                      {dtr.overtimeHours > 0 && (
                        <span className="ml-1 text-primary">
                          (+{dtr.overtimeHours} OT)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{dtr.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(dtr.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Tooltip content="DTR Actions">
                          <Button variant="ghost" size="icon" className="hover:bg-gray-100 transition-colors">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </Tooltip>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleViewDTR(dtr.id)}
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {dtr.status === "Pending" && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => handleApproveDTR(dtr.id)}
                              className="hover:bg-green-50 cursor-pointer"
                            >
                              <CheckCircle className="mr-2 h-4 w-4 text-success" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRejectDTR(dtr.id)}
                              className="hover:bg-red-50 cursor-pointer"
                            >
                              <XCircle className="mr-2 h-4 w-4 text-error" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {dtr.status === "Approved" && (
                          <DropdownMenuItem 
                            onClick={() => handleProcessPayroll(dtr.id)}
                            className="hover:bg-blue-50 cursor-pointer"
                          >
                            <CreditCard className="mr-2 h-4 w-4 text-primary" />
                            Process Payroll
                          </DropdownMenuItem>
                        )}
                        {dtr.status === "Rejected" && (
                          <DropdownMenuItem
                            className="hover:bg-yellow-50 cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4 text-warning" />
                            Request Revision
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No DTR records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default DTRTable;
