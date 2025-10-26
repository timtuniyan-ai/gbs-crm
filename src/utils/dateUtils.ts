/**
 * Date utility functions for Kalibri CRM
 * All dates should be formatted in American format (MM.DD.YYYY)
 */

export const formatDate = (dateString: string | Date, options?: {
  includeTime?: boolean;
  timeFormat?: '12h' | '24h';
  separator?: '.' | '/' | '-';
}): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const separator = options?.separator || '.';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  
  let formattedDate = `${month}${separator}${day}${separator}${year}`;
  
  if (options?.includeTime) {
    const timeFormat = options.timeFormat || '24h';
    
    if (timeFormat === '12h') {
      const hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      formattedDate += ` ${hours12}:${minutes} ${ampm}`;
    } else {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      formattedDate += ` ${hours}:${minutes}`;
    }
  }
  
  return formattedDate;
};

export const formatDateShort = (dateString: string | Date): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  
  return `${month}.${day}.${year}`;
};

export const formatDateWithTime = (dateString: string | Date): string => {
  return formatDate(dateString, { includeTime: true, timeFormat: '24h' });
};

export const formatDateWithTime12h = (dateString: string | Date): string => {
  return formatDate(dateString, { includeTime: true, timeFormat: '12h' });
};

export const formatDateForInput = (dateString: string | Date): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  // Return in YYYY-MM-DD format for HTML date inputs
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Format date from database DATE field (YYYY-MM-DD) for display
 * Avoids timezone conversion issues by treating as local date
 * Returns format: MM.DD.YYYY (with dots)
 */
export const formatDateFromDB = (dateString: string): string => {
  if (!dateString) return '';
  
  // Parse YYYY-MM-DD as local date to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return '';
  
  const date = new Date(year, month - 1, day);
  
  // Return in MM.DD.YYYY format (with dots)
  const month2 = String(date.getMonth() + 1).padStart(2, '0');
  const day2 = String(date.getDate()).padStart(2, '0');
  const year2 = date.getFullYear();
  
  return `${month2}.${day2}.${year2}`;
};

/**
 * Format date and time in compact format: "Oct 17, 2025 6:05 PM"
 * @param dateString - date string or Date object
 * @returns formatted string in format "MMM DD, YYYY H:MM AM/PM"
 */
export const formatDateTimeCompact = (dateString: string | Date): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  // Format: "Oct 17, 2025 6:05 PM" (American 12-hour format)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric', 
    year: 'numeric'
  }) + ' ' + date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format date and time in 24-hour format: "Oct 17, 2025 18:05"
 * @param dateString - date string or Date object
 * @returns formatted string in format "MMM DD, YYYY HH:MM"
 */
export const formatDateTimeCompact24h = (dateString: string | Date): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  // Format: "Oct 17, 2025 18:05"
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric', 
    year: 'numeric'
  }) + ' ' + date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const formatRelativeDate = (dateString: string | Date): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays === -1) {
    return 'Tomorrow';
  } else if (diffInDays > 1 && diffInDays <= 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < -1 && diffInDays >= -7) {
    return `In ${Math.abs(diffInDays)} days`;
  } else {
    return formatDate(date);
  }
};

export const isToday = (dateString: string | Date): boolean => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

export const isTomorrow = (dateString: string | Date): boolean => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return date.getDate() === tomorrow.getDate() &&
         date.getMonth() === tomorrow.getMonth() &&
         date.getFullYear() === tomorrow.getFullYear();
};

export const getCurrentDate = (): string => {
  return formatDateForInput(new Date());
};

export const getCurrentDateTime = (): string => {
  return new Date().toISOString();
};

// Format birthday specifically (without year if privacy is a concern)
export const formatBirthday = (dateString: string | Date, includeYear = true): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  if (includeYear) {
    const year = date.getFullYear();
    return `${month}.${day}.${year}`;
  } else {
    return `${month}.${day}`;
  }
};

// Parse American date format back to ISO string
export const parseAmericanDate = (dateString: string): string => {
  if (!dateString) return '';
  
  // Handle MM.DD.YYYY, MM/DD/YYYY, MM-DD-YYYY formats
  const parts = dateString.split(/[./-]/);
  if (parts.length !== 3) return '';
  
  const [month, day, year] = parts;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  
  if (isNaN(date.getTime())) return '';
  
  return date.toISOString().split('T')[0];
};