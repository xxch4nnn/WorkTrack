import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PDFDownloadButton, ExcelDownloadButton } from "@/components/ui/download-button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Printer } from "lucide-react";

interface PayslipProps {
  payslip: {
    id: number;
    employeeId: number;
    employeeName: string;
    position?: string;
    department?: string;
    payPeriodStart: string;
    payPeriodEnd: string;
    payDate: string;
    regularPay: number;
    overtimePay: number;
    holidayPay: number;
    allowances: number;
    bonuses: number;
    sssDeduction: number;
    phicDeduction: number;
    hdmfDeduction: number;
    taxDeduction: number;
    otherDeductions: number;
    loans: number;
    cashAdvances: number;
    grossPay: number;
    totalDeductions: number;
    netPay: number;
  };
  onClose?: () => void;
}

const PayslipView: React.FC<PayslipProps> = ({ payslip, onClose }) => {
  // Function to generate PDF data - would normally connect to an API
  const generatePDF = async () => {
    // Simulate API call by returning a placeholder
    return "PDF_DATA"; // In a real app, this would be a base64 string or binary data from an API
  };

  // Function to generate Excel data - would normally connect to an API
  const generateExcel = async () => {
    // Simulate API call by returning a placeholder
    return "EXCEL_DATA"; // In a real app, this would be a base64 string or binary data from an API
  };

  // Handle printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto print:shadow-none">
      <CardHeader className="print:py-2">
        <div className="flex justify-between items-start print:flex-col">
          <div>
            <CardTitle className="text-2xl font-bold text-primary">PAYSLIP</CardTitle>
            <CardDescription>
              Pay Period: {formatDate(payslip.payPeriodStart)} - {formatDate(payslip.payPeriodEnd)}
            </CardDescription>
          </div>
          <div className="flex space-x-2 print:hidden">
            <PDFDownloadButton 
              filename={`payslip-${payslip.employeeName}-${payslip.payPeriodEnd}.pdf`}
              data={generatePDF}
            >
              PDF
            </PDFDownloadButton>
            <ExcelDownloadButton 
              filename={`payslip-${payslip.employeeName}-${payslip.payPeriodEnd}.xlsx`}
              data={generateExcel}
            >
              Excel
            </ExcelDownloadButton>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 print:space-y-3 print:py-2">
        {/* Employee Information */}
        <div className="grid grid-cols-2 gap-4 print:gap-2">
          <div>
            <p className="text-sm font-semibold">Employee</p>
            <p className="text-lg font-bold">{payslip.employeeName}</p>
            <p className="text-sm text-gray-500">{payslip.position || 'Not specified'}</p>
            <p className="text-sm text-gray-500">{payslip.department || 'Not specified'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">Pay Date</p>
            <p className="text-base">{formatDate(payslip.payDate)}</p>
            <p className="text-sm font-semibold mt-1">Employee ID</p>
            <p className="text-base">{payslip.employeeId}</p>
          </div>
        </div>

        <Separator className="my-4 print:my-2" />

        {/* Earnings and Deductions Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-2">
          {/* Earnings */}
          <div>
            <h3 className="font-semibold mb-2">Earnings</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Regular Pay</TableCell>
                  <TableCell className="text-right">{formatCurrency(payslip.regularPay)}</TableCell>
                </TableRow>
                {payslip.overtimePay > 0 && (
                  <TableRow>
                    <TableCell>Overtime Pay</TableCell>
                    <TableCell className="text-right">{formatCurrency(payslip.overtimePay)}</TableCell>
                  </TableRow>
                )}
                {payslip.holidayPay > 0 && (
                  <TableRow>
                    <TableCell>Holiday Pay</TableCell>
                    <TableCell className="text-right">{formatCurrency(payslip.holidayPay)}</TableCell>
                  </TableRow>
                )}
                {payslip.allowances > 0 && (
                  <TableRow>
                    <TableCell>Allowances</TableCell>
                    <TableCell className="text-right">{formatCurrency(payslip.allowances)}</TableCell>
                  </TableRow>
                )}
                {payslip.bonuses > 0 && (
                  <TableRow>
                    <TableCell>Bonuses</TableCell>
                    <TableCell className="text-right">{formatCurrency(payslip.bonuses)}</TableCell>
                  </TableRow>
                )}
                <TableRow className="font-bold bg-gray-50">
                  <TableCell>Gross Pay</TableCell>
                  <TableCell className="text-right">{formatCurrency(payslip.grossPay)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Deductions */}
          <div>
            <h3 className="font-semibold mb-2">Deductions</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslip.sssDeduction > 0 && (
                  <TableRow>
                    <TableCell>SSS Contribution</TableCell>
                    <TableCell className="text-right">{formatCurrency(payslip.sssDeduction)}</TableCell>
                  </TableRow>
                )}
                {payslip.phicDeduction > 0 && (
                  <TableRow>
                    <TableCell>PhilHealth Contribution</TableCell>
                    <TableCell className="text-right">{formatCurrency(payslip.phicDeduction)}</TableCell>
                  </TableRow>
                )}
                {payslip.hdmfDeduction > 0 && (
                  <TableRow>
                    <TableCell>Pag-IBIG Contribution</TableCell>
                    <TableCell className="text-right">{formatCurrency(payslip.hdmfDeduction)}</TableCell>
                  </TableRow>
                )}
                {payslip.taxDeduction > 0 && (
                  <TableRow>
                    <TableCell>Withholding Tax</TableCell>
                    <TableCell className="text-right">{formatCurrency(payslip.taxDeduction)}</TableCell>
                  </TableRow>
                )}
                {payslip.loans > 0 && (
                  <TableRow>
                    <TableCell>Loans</TableCell>
                    <TableCell className="text-right">{formatCurrency(payslip.loans)}</TableCell>
                  </TableRow>
                )}
                {payslip.cashAdvances > 0 && (
                  <TableRow>
                    <TableCell>Cash Advances</TableCell>
                    <TableCell className="text-right">{formatCurrency(payslip.cashAdvances)}</TableCell>
                  </TableRow>
                )}
                {payslip.otherDeductions > 0 && (
                  <TableRow>
                    <TableCell>Other Deductions</TableCell>
                    <TableCell className="text-right">{formatCurrency(payslip.otherDeductions)}</TableCell>
                  </TableRow>
                )}
                <TableRow className="font-bold bg-gray-50">
                  <TableCell>Total Deductions</TableCell>
                  <TableCell className="text-right">{formatCurrency(payslip.totalDeductions)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Net Pay Summary */}
        <div className="bg-primary/10 p-4 rounded-md mt-4 print:mt-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Net Pay</h3>
            <p className="text-2xl font-bold text-primary">{formatCurrency(payslip.netPay)}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500 border-t print:pt-2 print:text-xs">
        <div className="w-full">
          <p className="mb-1">This is a computer-generated document. No signature is required.</p>
          <p>For questions about this payslip, please contact the HR department.</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PayslipView;