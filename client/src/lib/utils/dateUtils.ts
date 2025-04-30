/**
 * Converts time string in HH:MM format to minutes
 * @param timeStr Time string in HH:MM format
 * @returns Total minutes
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Converts minutes to time string in HH:MM format
 * @param minutes Total minutes
 * @returns Time string in HH:MM format
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Calculates regular hours between time in and time out, considering break time
 * @param timeIn Time in (HH:MM format)
 * @param timeOut Time out (HH:MM format)
 * @param breakHours Break hours
 * @returns Regular hours
 */
export function calculateRegularHours(timeIn: string, timeOut: string, breakHours: number): number {
  const startMinutes = timeToMinutes(timeIn);
  const endMinutes = timeToMinutes(timeOut);
  
  // Handle when timeOut is on the next day
  let totalMinutes = endMinutes >= startMinutes ? 
    endMinutes - startMinutes : 
    (24 * 60 - startMinutes) + endMinutes;
  
  // Subtract break time
  totalMinutes -= breakHours * 60;
  
  // Convert to hours with up to 2 decimal places
  return Math.max(0, parseFloat((totalMinutes / 60).toFixed(2)));
}

/**
 * Determines if a given date is a weekend (Saturday or Sunday)
 * @param date Date to check
 * @returns Boolean indicating if date is a weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
}

/**
 * Determines if a given date is a holiday
 * This is a placeholder function - in a real app, this would check against a list of holidays
 * @param date Date to check
 * @returns Boolean indicating if date is a holiday
 */
export function isHoliday(dateStr: string): boolean {
  // This is a placeholder - in a real app, you would check against a list of holidays
  const holidays = [
    '2023-01-01', // New Year's Day
    '2023-04-09', // Easter
    '2023-05-01', // Labor Day
    '2023-06-12', // Independence Day
    '2023-08-21', // Ninoy Aquino Day
    '2023-08-28', // National Heroes Day
    '2023-11-01', // All Saints' Day
    '2023-11-30', // Bonifacio Day
    '2023-12-25', // Christmas Day
    '2023-12-30', // Rizal Day
    '2023-12-31', // New Year's Eve
    // Add more holidays as needed
  ];
  
  return holidays.includes(dateStr);
}

/**
 * Formats a date range as a string
 * @param startDate Start date
 * @param endDate End date
 * @returns Formatted date range string
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  // Check if both dates are in the same month and year
  const sameMonth = startDate.getMonth() === endDate.getMonth() && 
                    startDate.getFullYear() === endDate.getFullYear();
  
  if (sameMonth) {
    return `${startDate.getDate()}-${endDate.getDate()} ${getMonthName(startDate.getMonth())} ${startDate.getFullYear()}`;
  } else {
    return `${startDate.getDate()} ${getMonthName(startDate.getMonth())} - ${endDate.getDate()} ${getMonthName(endDate.getMonth())} ${startDate.getFullYear()}`;
  }
}

/**
 * Gets the name of a month from its index
 * @param monthIndex Month index (0-11)
 * @returns Month name
 */
function getMonthName(monthIndex: number): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[monthIndex];
}
