// utils/functions/format.ts

/**
 * Escapes special LaTeX characters in a string
 * @param str String to escape
 * @returns Escaped string safe for LaTeX
 */
export function escapeLatex(str: string): string {
  if (!str) return '';
  
  // Replace special LaTeX characters with their escaped versions
  return str
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\$/g, '\\$')
    .replace(/&/g, '\\&')
    .replace(/#/g, '\\#')
    .replace(/\^/g, '\\^{}')
    .replace(/_/g, '\\_')
    .replace(/~/g, '\\~{}')
    .replace(/%/g, '\\%');
}

/**
 * Formats a phone number to (xxx) xxx-xxxx format
 * @param phoneNumber Input phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format as (xxx) xxx-xxxx if it has 10 digits
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  // Return original if not a standard 10-digit US phone number
  return phoneNumber;
}

/**
 * Escapes special characters in URLs for LaTeX
 * @param url URL string to escape
 * @returns Escaped URL safe for LaTeX
 */
export function escapeUrl(url: string): string {
  if (!url) return '';
  
  // URLs in LaTeX need special character handling
  return url
    .replace(/%/g, '\\%')
    .replace(/#/g, '\\#');
}

/**
 * Formats a date string to "Mon YYYY" format
 * @param dateString Date string in ISO or any parseable format
 * @returns Formatted date string or "Present" if null/undefined
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Present';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    // Format to "Mon YYYY" (e.g., "Jan 2023")
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    
    return `${month} ${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Converts a string to snake_case format
 * @param input Input string to format
 * @returns String in snake_case format
 */
export function formatSnakeCase(input: string): string {
  if (!input) return '';
  
  return input
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove all non-word chars except spaces and hyphens
    .replace(/[\s-]+/g, '_'); // Replace spaces and hyphens with single underscore
}

/**
 * Cleans a URL by removing 'https://', 'www.' and trailing '/'
 * @param url - The URL to clean
 * @returns The cleaned URL string
 */
export function cleanUrl(url: string): string {
  if (!url) return '';
  
  // Using regex to remove https://, www. and trailing slash
  return url.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
}