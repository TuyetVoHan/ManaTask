/**
 * Format a date string to dd-mm-yyyy format
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string in dd-mm-yyyy format
 */
export function formatDate(dateString: string | Date): string {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return "";
  
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
}

/**
 * Format a date string to a long format (DD Month YYYY)
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string like "08 December 2025"
 */
export function formatDateLong(dateString: string | Date): string {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return "";
  
  const day = date.getDate();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
}
