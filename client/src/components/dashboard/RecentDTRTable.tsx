import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, XCircle, CreditCard, Edit } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DTR } from "@shared/schema";

type RecentDTRTableProps = {
  isLoading: boolean;
  dtrs?: DTR[];
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Pending":
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
          Pending
        </span>
      );
    case "Approved":
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
          Approved
        </span>
      );
    case "Rejected":
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
          Rejected
        </span>
      );
    case "Processing":
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
          Processing
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
          {status}
        </span>
      );
  }
};

const RecentDTRTable = ({ isLoading, dtrs = [] }: RecentDTRTableProps) => {
  const { toast } = useToast();

  const handleViewDTR = (id: number) => {
    toast({
      title: "Viewing DTR",
      description: `Viewing DTR #${id}`,
    });
  };

  const handleApproveDTR = async (id: number) => {
    try {
      await apiRequest("PATCH", `/api/dtrs/${id}/approve`, {});
      await queryClient.invalidateQueries({ queryKey: ['/api/dtrs/recent'] });
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

  const handleRejectDTR = async (id: number) => {
    try {
      await apiRequest("PATCH", `/api/dtrs/${id}/reject`, {});
      await queryClient.invalidateQueries({ queryKey: ['/api/dtrs/recent'] });
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

  const handleProcessPay = async (id: number) => {
    try {
      await apiRequest("POST", `/api/payroll/process/${id}`, {});
      await queryClient.invalidateQueries({ queryKey: ['/api/dtrs/recent'] });
      toast({
        title: "Payment Processing",
        description: "The payment is being processed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRequestRevision = async (id: number) => {
    try {
      await apiRequest("PATCH", `/api/dtrs/${id}/request-revision`, {});
      await queryClient.invalidateQueries({ queryKey: ['/api/dtrs/recent'] });
      toast({
        title: "Revision Requested",
        description: "A revision has been requested for this DTR.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request revision. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-5">
        <CardTitle className="text-lg font-medium">Recent DTR Submissions</CardTitle>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="ml-4">
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
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
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </td>
                  </tr>
                ))
            ) : dtrs.length > 0 ? (
              dtrs.map((dtr) => (
                <tr key={dtr.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${dtr.id}`} />
                        <AvatarFallback>
                          {dtr.id.toString().substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          Employee #{dtr.employeeId}
                        </div>
                        <div className="text-sm text-gray-500">Department</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{dtr.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{dtr.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(dtr.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleViewDTR(dtr.id)}
                      >
                        <Eye className="h-4 w-4 text-primary" />
                      </Button>
                      {dtr.status === "Pending" && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleApproveDTR(dtr.id)}
                          >
                            <CheckCircle className="h-4 w-4 text-success" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRejectDTR(dtr.id)}
                          >
                            <XCircle className="h-4 w-4 text-error" />
                          </Button>
                        </>
                      )}
                      {dtr.status === "Approved" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleProcessPay(dtr.id)}
                        >
                          <CreditCard className="h-4 w-4 text-success" />
                        </Button>
                      )}
                      {dtr.status === "Rejected" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRequestRevision(dtr.id)}
                        >
                          <Edit className="h-4 w-4 text-warning" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No recent DTR submissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <CardContent className="px-4 py-3 bg-gray-50 text-right">
        <Button variant="outline" size="sm">
          Load More
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecentDTRTable;
