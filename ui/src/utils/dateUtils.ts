/**
 * Utility functions for handling date formatting without timezone issues
 */

/**
 * Formats a date string (YYYY-MM-DD) to a localized date string without timezone conversion
 * This prevents the "selected date -1 day" bug caused by timezone parsing
 * 
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "1/15/2025" for US locale)
 */
export const formatReservationDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    // Parse the date string manually to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Create date object using local timezone (not UTC)
    const date = new Date(year, month - 1, day);
    
    // Format using toLocaleDateString to get consistent formatting
    return date.toLocaleDateString('en-US');
  } catch {
    // Fallback to original string if parsing fails
    return dateString;
  }
};

/**
 * Formats a timestamp to a readable date and time
 * 
 * @param timestamp - ISO timestamp string or Date object
 * @returns Object with separate date and time strings
 */
export const formatTimestampSplit = (timestamp: string | Date) => {
  if (!timestamp) return { date: 'N/A', time: 'N/A' };
  
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    return {
      date: date.toLocaleDateString('en-US'),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  } catch {
    return { date: 'N/A', time: 'N/A' };
  }
};