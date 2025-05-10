import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Payroll } from "@shared/schema";
import { Download, Printer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type PayslipViewProps = {
  payroll: Payroll;
  employeeName: string;
};

const PayslipView = ({ payroll, employeeName }: PayslipViewProps) => {
  const payslipRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch employee details
  const { data: employee, isLoading: isEmployeeLoading } = useQuery({
    queryKey: ['/api/employees', payroll.employeeId],
  });

  // Fetch company details
  const { data: company, isLoading: isCompanyLoading } = useQuery({
    queryKey: ['/api/companies', employee?.companyId],
    enabled: !!employee?.companyId,
  });

  const handlePrint = () => {
    if (payslipRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Payslip</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          body { font-family: Arial, sans-serif; padding: 20px; }
          .payslip { max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; }
          .payslip-header { text-align: center; margin-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .payslip-title { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; margin-bottom: 10px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .total-row { font-weight: bold; border-top: 1px solid #ddd; padding-top: 10px; }
          .separator { border-top: 1px solid #ddd; margin: 15px 0; }
          @media print {
            body { padding: 0; }
            .payslip { border: none; }
          }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(payslipRef.current.innerHTML);
        printWindow.document.write('</body></html>');
        
        printWindow.document.close();
        printWindow.focus();
        
        // Add slight delay to ensure content is loaded
        setTimeout(() => {
          printWindow.print();
          // printWindow.close();
        }, 250);
      } else {
        toast({
          title: "Print Error",
          description: "Unable to open print window. Please check your browser settings.",
          variant: "destructive",
        });
      }
    }
  };

  const generatePDF = () => {
    try {
      toast({
        title: "Download Started",
        description: "Your payslip PDF is being prepared for download.",
      });
      
      // In a real app, this would call the server to generate the PDF
      // For now, we'll simulate a download by using the print functionality
      handlePrint();
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isEmployeeLoading || isCompanyLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Loading Payslip...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-3">
              {Array(10).fill(0).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <Button onClick={generatePDF}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <div ref={payslipRef} className="payslip">
          <CardHeader className="text-center payslip-header">
            <CardTitle className="company-name">{company?.name || "WorkTrack Inc."}</CardTitle>
            <p className="text-gray-500">{company?.address || "123 Business Street, City"}</p>
            <div className="mt-4 payslip-title">Employee Payslip</div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 section">
                <h3 className="font-medium section-title">Employee Information</h3>
                <div className="row">
                  <span className="text-gray-500">Name:</span>
                  <span>{employeeName}</span>
                </div>
                <div className="row">
                  <span className="text-gray-500">Position:</span>
                  <span>{employee?.position || "N/A"}</span>
                </div>
                <div className="row">
                  <span className="text-gray-500">Department:</span>
                  <span>{employee?.department || "N/A"}</span>
                </div>
                <div className="row">
                  <span className="text-gray-500">Employee ID:</span>
                  <span>{employee?.id || "N/A"}</span>
                </div>
              </div>

              <div className="space-y-2 section">
                <h3 className="font-medium section-title">Payroll Information</h3>
                <div className="row">
                  <span className="text-gray-500">Pay Period:</span>
                  <span>{payroll.payPeriodStart} to {payroll.payPeriodEnd}</span>
                </div>
                <div className="row">
                  <span className="text-gray-500">Pay Date:</span>
                  <span>{payroll.processedDate || "Pending"}</span>
                </div>
                <div className="row">
                  <span className="text-gray-500">Payroll #:</span>
                  <span>PR-{payroll.id.toString().padStart(6, '0')}</span>
                </div>
                <div className="row">
                  <span className="text-gray-500">Status:</span>
                  <span>{payroll.status}</span>
                </div>
              </div>
            </div>

            <Separator className="my-6 separator" />

            <div className="space-y-6">
              <div className="space-y-3 section">
                <h3 className="font-medium section-title">Earnings</h3>
                <div className="row">
                  <span className="text-gray-500">Regular Hours:</span>
                  <span>{payroll.totalRegularHours} hrs</span>
                </div>
                <div className="row">
                  <span className="text-gray-500">Hourly Rate:</span>
                  <span>₱{employee?.hourlyRate?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="row">
                  <span className="text-gray-500">Regular Pay:</span>
                  <span>₱{(payroll.totalRegularHours * (employee?.hourlyRate || 0)).toFixed(2)}</span>
                </div>
                {payroll.totalOvertimeHours > 0 && (
                  <>
                    <div className="row">
                      <span className="text-gray-500">Overtime Hours:</span>
                      <span>{payroll.totalOvertimeHours} hrs</span>
                    </div>
                    <div className="row">
                      <span className="text-gray-500">Overtime Rate:</span>
                      <span>₱{((employee?.hourlyRate || 0) * 1.25).toFixed(2)}</span>
                    </div>
                    <div className="row">
                      <span className="text-gray-500">Overtime Pay:</span>
                      <span>₱{(payroll.totalOvertimeHours * (employee?.hourlyRate || 0) * 1.25).toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="row total-row">
                  <span>Gross Pay:</span>
                  <span>₱{payroll.grossPay.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3 section">
                <h3 className="font-medium section-title">Deductions</h3>
                <div className="row">
                  <span className="text-gray-500">Tax:</span>
                  <span>₱{(payroll.totalDeductions * 0.6).toFixed(2)}</span>
                </div>
                <div className="row">
                  <span className="text-gray-500">SSS Contribution:</span>
                  <span>₱{(payroll.totalDeductions * 0.25).toFixed(2)}</span>
                </div>
                <div className="row">
                  <span className="text-gray-500">PhilHealth:</span>
                  <span>₱{(payroll.totalDeductions * 0.15).toFixed(2)}</span>
                </div>
                <div className="row total-row">
                  <span>Total Deductions:</span>
                  <span>₱{payroll.totalDeductions.toFixed(2)}</span>
                </div>
              </div>

              <Separator className="separator" />

              <div className="row total-row">
                <span className="text-lg font-bold">Net Pay:</span>
                <span className="text-lg font-bold">₱{payroll.netPay.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-10 pt-10 border-t text-center text-sm text-gray-500">
              <p>This is a computer-generated document. No signature is required.</p>
              <p>For questions about this payslip, please contact the HR department.</p>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default PayslipView;
