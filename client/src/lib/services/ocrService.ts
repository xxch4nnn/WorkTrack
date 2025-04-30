import { createWorker, ImageLike } from 'tesseract.js';

// Interface for parsed DTR data
export interface ParsedDTRData {
  employeeId?: number;
  employeeName?: string;
  date?: string;
  timeIn?: string;
  timeOut?: string;
  breakHours?: number;
  overtimeHours?: number;
  remarks?: string;
  type?: string;
  companyId?: number;
  confidence: number;
  needsReview: boolean;
  rawText: string;
}

// Known DTR formats for different companies
export interface DTRFormat {
  id: number;
  name: string;
  companyId: number;
  pattern: RegExp;
  extractionRules: {
    employeeName?: string;
    employeeId?: string;
    date?: string;
    timeIn?: string;
    timeOut?: string;
    breakHours?: string;
    overtimeHours?: string;
  };
  example: string;
}

// Pre-defined DTR formats from different companies
const knownDTRFormats: DTRFormat[] = [
  {
    id: 1,
    name: "Standard Format",
    companyId: 1,
    pattern: /Employee[:\s]+([^#\n]+)#?(\d+)?.*Date[:\s]+(\d{2}[\/\-]\d{2}[\/\-]\d{4}).*Time In[:\s]+(\d{1,2}:\d{2}(?:\s*[AP]M)?).*Time Out[:\s]+(\d{1,2}:\d{2}(?:\s*[AP]M)?)/is,
    extractionRules: {
      employeeName: "$1",
      employeeId: "$2",
      date: "$3",
      timeIn: "$4",
      timeOut: "$5"
    },
    example: "Employee: John Smith #12345\nDate: 05/15/2023\nTime In: 8:30 AM\nTime Out: 5:30 PM"
  },
  {
    id: 2,
    name: "Acme Corporation Format",
    companyId: 2,
    pattern: /Name:\s*([^\n]+).*ID:\s*(\d+).*Work Date:\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4}).*Clock In:\s*(\d{1,2}:\d{2}(?:\s*[AP]M)?).*Clock Out:\s*(\d{1,2}:\d{2}(?:\s*[AP]M)?)/is,
    extractionRules: {
      employeeName: "$1",
      employeeId: "$2",
      date: "$3",
      timeIn: "$4",
      timeOut: "$5"
    },
    example: "ACME CORPORATION\nDTR RECORD\nName: Jane Doe\nID: 54321\nWork Date: 06/01/2023\nClock In: 09:00 AM\nClock Out: 06:00 PM"
  },
  {
    id: 3,
    name: "Stark Industries Format",
    companyId: 3,
    pattern: /EMPLOYEE INFO[\s\S]*?Name:\s*([^\n]+)[\s\S]*?ID:\s*(\d+)[\s\S]*?DATE:\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})[\s\S]*?IN:\s*(\d{1,2}:\d{2}(?:\s*[AP]M)?)[\s\S]*?OUT:\s*(\d{1,2}:\d{2}(?:\s*[AP]M)?)[\s\S]*?OT HRS:\s*(\d+(?:\.\d+)?)/is,
    extractionRules: {
      employeeName: "$1",
      employeeId: "$2",
      date: "$3",
      timeIn: "$4",
      timeOut: "$5",
      overtimeHours: "$6"
    },
    example: "STARK INDUSTRIES\nEMPLOYEE INFO\nName: Tony Stark\nID: 10001\nDEPT: R&D\nDATE: 06/15/2023\nIN: 08:00 AM\nOUT: 08:00 PM\nBREAK: 1 HR\nOT HRS: 3.0"
  },
  {
    id: 4,
    name: "Umbrella Corp Format",
    companyId: 4,
    pattern: /ATTENDANCE[\s\S]*?Employee:\s*([^\n]+)[\s\S]*?ID Number:\s*(\d+)[\s\S]*?Work Date:\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})[\s\S]*?Start:\s*(\d{1,2}:\d{2}(?:\s*[AP]M)?)[\s\S]*?End:\s*(\d{1,2}:\d{2}(?:\s*[AP]M)?)[\s\S]*?Break:\s*(\d+(?:\.\d+)?)/is,
    extractionRules: {
      employeeName: "$1",
      employeeId: "$2",
      date: "$3",
      timeIn: "$4",
      timeOut: "$5",
      breakHours: "$6"
    },
    example: "UMBRELLA CORPORATION\nATTENDANCE REPORT\nEmployee: Chris Redfield\nID Number: 98765\nDepartment: Security\nWork Date: 07/01/2023\nStart: 07:00 AM\nEnd: 04:00 PM\nBreak: 1.0\nTotal Hours: 8.0"
  }
];

/**
 * Normalizes time strings to 24-hour format
 */
const normalizeTimeFormat = (timeStr: string): string => {
  if (!timeStr) return '';
  
  // If already in 24-hour format (HH:MM)
  if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
    return timeStr;
  }
  
  // Convert from AM/PM format
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  
  return timeStr;
};

/**
 * Normalizes date strings to YYYY-MM-DD format
 */
const normalizeDateFormat = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // Handle various date formats like MM/DD/YYYY, DD/MM/YYYY, MM-DD-YYYY
  const match = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (match) {
    // Assuming MM/DD/YYYY format (most common in DTRs)
    const month = match[1].padStart(2, '0');
    const day = match[2].padStart(2, '0');
    const year = match[3];
    
    return `${year}-${month}-${day}`;
  }
  
  return dateStr;
};

/**
 * Analyzes DTR text and determines which known format it matches
 */
const detectDTRFormat = (text: string): { 
  format: DTRFormat | null; 
  matches: RegExpMatchArray | null;
} => {
  for (const format of knownDTRFormats) {
    const matches = text.match(format.pattern);
    if (matches) {
      return { format, matches };
    }
  }
  
  return { format: null, matches: null };
};

/**
 * Extract data based on the detection result and format rules
 */
const extractDataFromFormat = (text: string, format: DTRFormat, matches: RegExpMatchArray): ParsedDTRData => {
  // Default result
  const result: ParsedDTRData = {
    confidence: matches ? 0.8 : 0.1,
    needsReview: !matches,
    rawText: text
  };
  
  // Apply extraction rules if we have matches
  if (matches) {
    const rules = format.extractionRules;
    
    // Process employee name
    if (rules.employeeName) {
      const templateVar = rules.employeeName;
      const index = parseInt(templateVar.replace('$', ''));
      if (matches[index]) {
        result.employeeName = matches[index].trim();
      }
    }
    
    // Process employee ID
    if (rules.employeeId) {
      const templateVar = rules.employeeId;
      const index = parseInt(templateVar.replace('$', ''));
      if (matches[index]) {
        result.employeeId = parseInt(matches[index]);
      }
    }
    
    // Process date
    if (rules.date) {
      const templateVar = rules.date;
      const index = parseInt(templateVar.replace('$', ''));
      if (matches[index]) {
        result.date = normalizeDateFormat(matches[index]);
      }
    }
    
    // Process time in
    if (rules.timeIn) {
      const templateVar = rules.timeIn;
      const index = parseInt(templateVar.replace('$', ''));
      if (matches[index]) {
        result.timeIn = normalizeTimeFormat(matches[index]);
      }
    }
    
    // Process time out
    if (rules.timeOut) {
      const templateVar = rules.timeOut;
      const index = parseInt(templateVar.replace('$', ''));
      if (matches[index]) {
        result.timeOut = normalizeTimeFormat(matches[index]);
      }
    }
    
    // Process break hours
    if (rules.breakHours) {
      const templateVar = rules.breakHours;
      const index = parseInt(templateVar.replace('$', ''));
      if (matches[index]) {
        result.breakHours = parseFloat(matches[index]);
      }
    } else {
      // Default break hours if not specified
      result.breakHours = 1;
    }
    
    // Process overtime hours
    if (rules.overtimeHours) {
      const templateVar = rules.overtimeHours;
      const index = parseInt(templateVar.replace('$', ''));
      if (matches[index]) {
        result.overtimeHours = parseFloat(matches[index]);
      }
    } else {
      // Default overtime hours if not specified
      result.overtimeHours = 0;
    }
    
    // Set company ID from the format
    result.companyId = format.companyId;
    
    // Set DTR type (can be enhanced based on format)
    result.type = "Daily";
  }
  
  return result;
};

/**
 * Use Puter for analyzing unrecognized DTR formats
 */
export const analyzeDTRWithPuter = async (text: string): Promise<ParsedDTRData | null> => {
  try {
    if (typeof window.puter === 'undefined') {
      console.error('Puter API not available');
      return null;
    }
    
    // Create a temporary file with the DTR text
    const file = await window.puter.fs.write('temp_dtr_analysis.txt', text);
    
    // TODO: In a real implementation, use Puter's AI/ML capabilities to analyze the text
    // For now, just return a simple analysis result
    return {
      confidence: 0.5,
      needsReview: true,
      rawText: text,
      remarks: "This DTR format was not recognized and needs manual review."
    };
  } catch (error) {
    console.error('Error using Puter for DTR analysis:', error);
    return null;
  }
};

/**
 * Process image using Tesseract OCR to extract text, then parse the DTR data
 */
export const processDTRImage = async (imageData: ImageLike): Promise<ParsedDTRData> => {
  try {
    // Initialize Tesseract worker
    const worker = await createWorker();
    
    // Recognize text from image
    const { data } = await worker.recognize(imageData);
    await worker.terminate();
    
    // Get the recognized text
    const text = data.text;
    
    // Detect DTR format
    const { format, matches } = detectDTRFormat(text);
    
    // If known format is detected, extract data
    if (format && matches) {
      return extractDataFromFormat(text, format, matches);
    } 
    // If not recognized, try to analyze with Puter
    else {
      const puterResult = await analyzeDTRWithPuter(text);
      if (puterResult) {
        return puterResult;
      }
      
      // Fallback - return raw text for manual review
      return {
        confidence: 0.2,
        needsReview: true,
        rawText: text,
        remarks: "Unrecognized DTR format. Please review manually."
      };
    }
  } catch (error) {
    console.error("Error processing DTR image:", error);
    return {
      confidence: 0,
      needsReview: true,
      rawText: "Error processing image. Please try again.",
      remarks: String(error)
    };
  }
};

/**
 * Register a new DTR format
 */
export const registerNewDTRFormat = (format: Omit<DTRFormat, 'id'>): DTRFormat => {
  const newId = Math.max(...knownDTRFormats.map(f => f.id)) + 1;
  const newFormat = { ...format, id: newId };
  
  // In a real app, this would be saved to the database
  // For now, we just add it to the in-memory array
  knownDTRFormats.push(newFormat);
  
  return newFormat;
};

/**
 * Get all known DTR formats
 */
export const getKnownDTRFormats = (): DTRFormat[] => {
  return [...knownDTRFormats];
};

// Declare Puter API on window
declare global {
  interface Window {
    puter: any;
  }
}