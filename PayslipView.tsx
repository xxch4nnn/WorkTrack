import React from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface Payslip {
  id: number;
  employeeId: number;
  periodStart: string;
  periodEnd: string;
  dateIssued: string;
  grossPay: number;
  netPay: number;
  status: string;
  payrollId: number;
  // These fields might be fetched when viewing a specific payslip
  employeeName?: string;
  position?: string;
  department?: string;
  companyName?: string;
  regularHours?: number;
  overtimeHours?: number;
  holidayHours?: number;
  regularRate?: number;
  deductions?: {
    tax: number;
    sss: number;
    philHealth: number;
    pagIbig: number;
    loans?: number;
    other?: number;
  };
  allowances?: {
    transportation?: number;
    meal?: number;
    housing?: number;
    other?: number;
  };
}

interface PayslipViewProps {
  payslip: Payslip;
}

export default function PayslipView({ payslip }: PayslipViewProps) {
  // Mock data for demonstration - in a real implementation, these would come from the backend
  const employeeDetails = {
    name: payslip.employeeName || "John Doe",
    position: payslip.position || "Software Developer",
    department: payslip.department || "IT Department",
    employeeId: `EMP-${payslip.employeeId.toString().padStart(4, '0')}`,
  };

  const companyDetails = {
    name: payslip.companyName || "Solaire Manpower Agency",
    address: "12 Main Street, Makati City, Philippines",
    contact: "+63 (2) 1234-5678",
  };

  const payDetails = {
    regularHours: payslip.regularHours || 160,
    overtimeHours: payslip.overtimeHours || 0,
    holidayHours: payslip.holidayHours || 0,
    regularRate: payslip.regularRate || (payslip.grossPay / 160),
    deductions: payslip.deductions || {
      tax: payslip.grossPay * 0.1,
      sss: 1200,
      philHealth: 400,
      pagIbig: 100,
      loans: 0,
      other: 0,
    },
    allowances: payslip.allowances || {
      transportation: 0,
      meal: 0,
      housing: 0,
      other: 0,
    },
  };

  // Calculate total deductions and allowances
  const totalDeductions = Object.values(payDetails.deductions).reduce((a, b) => a + (b || 0), 0);
  const totalAllowances = Object.values(payDetails.allowances).reduce((a, b) => a + (b || 0), 0);

  // Calculate earnings breakdown
  const regularPay = payDetails.regularHours * payDetails.regularRate;
  const overtimePay = (payDetails.overtimeHours || 0) * (payDetails.regularRate * 1.25);
  const holidayPay = (payDetails.holidayHours || 0) * (payDetails.regularRate * 1.5);

  return (
    <Card className="p-8 bg-white shadow-md">
      {/* Payslip Header with branding */}
      <div className="flex justify-between items-center border-b-2 border-primary pb-4 mb-6">
        <div className="flex items-center">
          <span className="w-2 h-10 bg-[#e6c555] mr-2"></span>
          <div>
            <h1 className="text-2xl font-bold text-[#172445]">WORKTRACK</h1>
            <p className="text-sm text-gray-500">by Lighthouse</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold text-[#0b4d83]">PAYSLIP</h2>
          <p className="text-sm">{companyDetails.name}</p>
        </div>
      </div>

      {/* Payslip Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-sm uppercase text-gray-500 mb-1">Employee Information</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Name:</span>
              <span className="font-medium">{employeeDetails.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">ID:</span>
              <span>{employeeDetails.employeeId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Position:</span>
              <span>{employeeDetails.position}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Department:</span>
              <span>{employeeDetails.department}</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm uppercase text-gray-500 mb-1">Payroll Information</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Pay Period:</span>
              <span>{formatDate(payslip.periodStart)} - {formatDate(payslip.periodEnd)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Issue Date:</span>
              <span>{formatDate(payslip.dateIssued)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Payslip #:</span>
              <span>PS-{payslip.id.toString().padStart(6, '0')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Status:</span>
              <span className={`font-medium ${
                payslip.status === "Paid" ? "text-green-600" : 
                payslip.status === "Pending" ? "text-amber-600" : "text-blue-600"
              }`}>
                {payslip.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Section */}
      <div className="mb-6">
        <h3 className="text-[#0b4d83] font-semibold border-b pb-2 mb-3">Earnings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Regular Hours ({payDetails.regularHours}hrs)</span>
                <span>{formatCurrency(regularPay)}</span>
              </div>
              {payDetails.overtimeHours > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm">Overtime ({payDetails.overtimeHours}hrs)</span>
                  <span>{formatCurrency(overtimePay)}</span>
                </div>
              )}
              {payDetails.holidayHours > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm">Holiday Pay ({payDetails.holidayHours}hrs)</span>
                  <span>{formatCurrency(holidayPay)}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="space-y-2">
              {Object.entries(payDetails.allowances).map(([key, value]) => (
                value > 0 && (
                  <div key={key} className="flex justify-between">
                    <span className="text-sm">{key.charAt(0).toUpperCase() + key.slice(1)} Allowance</span>
                    <span>{formatCurrency(value)}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-4 pt-2 border-t">
          <span className="font-medium">Total Earnings</span>
          <span className="font-medium">{formatCurrency(payslip.grossPay)}</span>
        </div>
      </div>

      {/* Deductions Section */}
      <div className="mb-6">
        <h3 className="text-[#0b4d83] font-semibold border-b pb-2 mb-3">Deductions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Income Tax</span>
                <span>{formatCurrency(payDetails.deductions.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">SSS Contribution</span>
                <span>{formatCurrency(payDetails.deductions.sss)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">PhilHealth</span>
                <span>{formatCurrency(payDetails.deductions.philHealth)}</span>
              </div>
            </div>
          </div>
          <div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Pag-IBIG Fund</span>
                <span>{formatCurrency(payDetails.deductions.pagIbig)}</span>
              </div>
              {(payDetails.deductions.loans || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm">Loan Payments</span>
                  <span>{formatCurrency(payDetails.deductions.loans || 0)}</span>
                </div>
              )}
              {(payDetails.deductions.other || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm">Other Deductions</span>
                  <span>{formatCurrency(payDetails.deductions.other || 0)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-4 pt-2 border-t">
          <span className="font-medium">Total Deductions</span>
          <span className="font-medium">{formatCurrency(totalDeductions)}</span>
        </div>
      </div>

      {/* Net Pay Section */}
      <div className="bg-[#f5f1dd] p-4 rounded-md flex justify-between items-center mb-6">
        <span className="text-lg font-bold text-[#172445]">NET PAY</span>
        <span className="text-lg font-bold text-[#172445]">{formatCurrency(payslip.netPay)}</span>
      </div>

      {/* Footer */}
      <div className="text-xs text-center text-gray-500 border-t pt-4">
        <p>This is a computer-generated document. No signature is required.</p>
        <p className="mt-1">© {new Date().getFullYear()} {companyDetails.name} | Powered by Lighthouse</p>
      </div>
    </Card>
  );
}