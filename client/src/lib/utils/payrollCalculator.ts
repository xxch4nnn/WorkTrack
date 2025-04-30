import { isWeekend, isHoliday } from "./dateUtils";

/**
 * Calculates regular pay based on hours worked and hourly rate
 * @param hours Number of regular hours worked
 * @param hourlyRate Hourly rate in currency units
 * @returns Regular pay amount
 */
export function calculateRegularPay(hours: number, hourlyRate: number): number {
  return hours * hourlyRate;
}

/**
 * Calculates overtime pay based on overtime hours, hourly rate, and multiplier
 * @param hours Number of overtime hours worked
 * @param hourlyRate Hourly rate in currency units
 * @param multiplier Overtime pay multiplier (default: 1.25)
 * @returns Overtime pay amount
 */
export function calculateOvertimePay(hours: number, hourlyRate: number, multiplier = 1.25): number {
  return hours * hourlyRate * multiplier;
}

/**
 * Calculates additional pay for working on weekends or holidays
 * @param dateStr Date string (YYYY-MM-DD format)
 * @param hours Number of hours worked
 * @param hourlyRate Hourly rate in currency units
 * @param weekendMultiplier Weekend pay multiplier (default: 1.3)
 * @param holidayMultiplier Holiday pay multiplier (default: 2.0)
 * @returns Additional pay amount
 */
export function calculateSpecialDayPay(
  dateStr: string,
  hours: number,
  hourlyRate: number,
  weekendMultiplier = 1.3,
  holidayMultiplier = 2.0
): number {
  const date = new Date(dateStr);
  
  if (isHoliday(dateStr)) {
    return hours * hourlyRate * (holidayMultiplier - 1); // Just the additional pay
  } else if (isWeekend(date)) {
    return hours * hourlyRate * (weekendMultiplier - 1); // Just the additional pay
  }
  
  return 0;
}

/**
 * Calculates tax deduction based on gross pay and tax rate
 * @param grossPay Gross pay amount
 * @param taxRate Tax rate as a percentage (e.g., 10 for 10%)
 * @returns Tax deduction amount
 */
export function calculateTaxDeduction(grossPay: number, taxRate: number): number {
  return grossPay * (taxRate / 100);
}

/**
 * Calculates SSS contribution based on gross pay and SSS rate
 * @param grossPay Gross pay amount
 * @param sssRate SSS rate as a percentage (e.g., 3.63 for 3.63%)
 * @returns SSS contribution amount
 */
export function calculateSSSContribution(grossPay: number, sssRate: number): number {
  return grossPay * (sssRate / 100);
}

/**
 * Calculates PhilHealth contribution based on gross pay and PhilHealth rate
 * @param grossPay Gross pay amount
 * @param philhealthRate PhilHealth rate as a percentage (e.g., 2.75 for 2.75%)
 * @returns PhilHealth contribution amount
 */
export function calculatePhilHealthContribution(grossPay: number, philhealthRate: number): number {
  return grossPay * (philhealthRate / 100);
}

/**
 * Calculates total deductions including tax, SSS, and PhilHealth
 * @param grossPay Gross pay amount
 * @param taxRate Tax rate as a percentage
 * @param sssRate SSS rate as a percentage
 * @param philhealthRate PhilHealth rate as a percentage
 * @returns Total deductions amount
 */
export function calculateTotalDeductions(
  grossPay: number,
  taxRate: number,
  sssRate: number,
  philhealthRate: number
): number {
  const tax = calculateTaxDeduction(grossPay, taxRate);
  const sss = calculateSSSContribution(grossPay, sssRate);
  const philhealth = calculatePhilHealthContribution(grossPay, philhealthRate);
  
  return tax + sss + philhealth;
}

/**
 * Calculates net pay by subtracting total deductions from gross pay
 * @param grossPay Gross pay amount
 * @param totalDeductions Total deductions amount
 * @returns Net pay amount
 */
export function calculateNetPay(grossPay: number, totalDeductions: number): number {
  return grossPay - totalDeductions;
}

/**
 * Generates a complete payroll calculation
 * @param regularHours Regular hours worked
 * @param overtimeHours Overtime hours worked
 * @param hourlyRate Hourly rate in currency units
 * @param taxRate Tax rate as a percentage
 * @param sssRate SSS rate as a percentage
 * @param philhealthRate PhilHealth rate as a percentage
 * @param dateStr Date string for weekend/holiday calculation (optional)
 * @returns Payroll calculation object with gross pay, deductions, and net pay
 */
export function generatePayrollCalculation(
  regularHours: number,
  overtimeHours: number,
  hourlyRate: number,
  taxRate: number,
  sssRate: number,
  philhealthRate: number,
  dateStr?: string
): {
  regularPay: number;
  overtimePay: number;
  specialDayPay: number;
  grossPay: number;
  taxDeduction: number;
  sssContribution: number;
  philhealthContribution: number;
  totalDeductions: number;
  netPay: number;
} {
  const regularPay = calculateRegularPay(regularHours, hourlyRate);
  const overtimePay = calculateOvertimePay(overtimeHours, hourlyRate);
  const specialDayPay = dateStr ? calculateSpecialDayPay(dateStr, regularHours, hourlyRate) : 0;
  
  const grossPay = regularPay + overtimePay + specialDayPay;
  
  const taxDeduction = calculateTaxDeduction(grossPay, taxRate);
  const sssContribution = calculateSSSContribution(grossPay, sssRate);
  const philhealthContribution = calculatePhilHealthContribution(grossPay, philhealthRate);
  
  const totalDeductions = taxDeduction + sssContribution + philhealthContribution;
  const netPay = calculateNetPay(grossPay, totalDeductions);
  
  return {
    regularPay,
    overtimePay,
    specialDayPay,
    grossPay,
    taxDeduction,
    sssContribution,
    philhealthContribution,
    totalDeductions,
    netPay
  };
}
