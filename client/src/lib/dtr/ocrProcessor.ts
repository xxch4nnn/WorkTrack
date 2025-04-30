import { createWorker } from 'tesseract.js';

// This utility extracts text from images using Tesseract OCR
export async function extractTextFromImage(imageData: string): Promise<string> {
  const worker = await createWorker('eng');
  
  try {
    const { data: { text } } = await worker.recognize(imageData);
    return text;
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to process the image. Please try again.');
  } finally {
    await worker.terminate();
  }
}

// Process DTR data using recognized text patterns
export async function processDTRData(text: string, companyId?: number): Promise<any> {
  // First try to determine the DTR format type based on known patterns
  const formatType = detectDTRFormatType(text, companyId);
  
  // Extract data according to the detected format
  return extractDataFromText(text, formatType);
}

// Function to detect which type of DTR format we're dealing with
function detectDTRFormatType(text: string, companyId?: number): string {
  // Check for known patterns from different DTR formats
  if (text.match(/time\s*in.*time\s*out/i)) {
    return 'standard';
  } 
  
  if (text.match(/clock\s*in.*clock\s*out/i)) {
    return 'timesheet';
  }
  
  if (text.match(/arrival.*departure/i)) {
    return 'attendance-log';
  }
  
  if (text.match(/biometric/i)) {
    return 'biometric';
  }
  
  // Default to a generic format if we can't identify it
  return 'unknown';
}

// Extract relevant data from the OCR text based on format type
function extractDataFromText(text: string, formatType: string): any {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  // Basic extraction of common DTR data points
  const result: any = {
    employeeInfo: extractEmployeeInfo(lines),
    dates: extractDates(lines),
    times: extractTimes(lines, formatType),
    formatType,
    isNewFormat: false, // Track if this is a previously unseen format
    confidenceScore: calculateConfidenceScore(lines, formatType)
  };
  
  // Mark as potentially new format if confidence is low
  if (result.confidenceScore < 0.6) {
    result.isNewFormat = true;
  }
  
  return result;
}

// Extract employee information from OCR text
function extractEmployeeInfo(lines: string[]): any {
  const employeeInfo: any = {};
  
  // Look for employee ID patterns
  const employeeIdMatch = lines.join(' ').match(/employee\s*(?:id|no|number)[\s:]*([a-z0-9-]+)/i);
  if (employeeIdMatch && employeeIdMatch[1]) {
    employeeInfo.employeeId = employeeIdMatch[1].trim();
  }
  
  // Look for employee name patterns
  const nameMatch = lines.join(' ').match(/name[\s:]*([a-z\s.]+)/i);
  if (nameMatch && nameMatch[1]) {
    employeeInfo.name = nameMatch[1].trim();
  }
  
  return employeeInfo;
}

// Extract date information from OCR text
function extractDates(lines: string[]): any {
  // Looking for date patterns in the text
  const dateRegex = /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{2,4}[-/]\d{1,2}[-/]\d{1,2})/g;
  const dates = [];
  
  for (const line of lines) {
    const matches = line.match(dateRegex);
    if (matches) {
      dates.push(...matches);
    }
  }
  
  return dates;
}

// Extract time information from OCR text based on format type
function extractTimes(lines: string[], formatType: string): any {
  const times: any = { timeIn: [], timeOut: [] };
  
  if (formatType === 'standard') {
    // Standard format usually has clear Time In and Time Out labels
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/time\s*in/i)) {
        const timeMatch = lines[i].match(/(\d{1,2}:\d{2}(?:\s*[ap]m)?)/i);
        if (timeMatch) times.timeIn.push(timeMatch[1]);
      }
      
      if (lines[i].match(/time\s*out/i)) {
        const timeMatch = lines[i].match(/(\d{1,2}:\d{2}(?:\s*[ap]m)?)/i);
        if (timeMatch) times.timeOut.push(timeMatch[1]);
      }
    }
  } else if (formatType === 'biometric') {
    // Biometric formats often have timestamp patterns
    const timeRegex = /(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[ap]m)?)/gi;
    
    for (const line of lines) {
      const matches = line.match(timeRegex);
      if (matches && matches.length >= 2) {
        times.timeIn.push(matches[0]);
        times.timeOut.push(matches[1]);
      }
    }
  } else {
    // Generic approach for unknown formats - look for time patterns
    const timeRegex = /(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[ap]m)?)/gi;
    
    for (const line of lines) {
      const matches = line.match(timeRegex);
      if (matches) {
        // Heuristic: First time on a line is usually time in, last is time out
        if (matches.length >= 2) {
          times.timeIn.push(matches[0]);
          times.timeOut.push(matches[matches.length - 1]);
        } else if (matches.length === 1) {
          // If there's only one time, check the context to decide
          if (line.toLowerCase().includes('in') || line.toLowerCase().includes('arrival')) {
            times.timeIn.push(matches[0]);
          } else if (line.toLowerCase().includes('out') || line.toLowerCase().includes('departure')) {
            times.timeOut.push(matches[0]);
          }
        }
      }
    }
  }
  
  return times;
}

// Calculate a confidence score for our extraction
function calculateConfidenceScore(lines: string[], formatType: string): number {
  let score = 0;
  const totalChecks = 3; // Employee info, dates, times
  
  // Check if we found employee information
  if (extractEmployeeInfo(lines).employeeId || extractEmployeeInfo(lines).name) {
    score += 1;
  }
  
  // Check if we found dates
  if (extractDates(lines).length > 0) {
    score += 1;
  }
  
  // Check if we found time information
  const times = extractTimes(lines, formatType);
  if (times.timeIn.length > 0 && times.timeOut.length > 0) {
    score += 1;
  }
  
  return score / totalChecks;
}