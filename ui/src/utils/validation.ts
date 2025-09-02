/**
 * Validation and sanitization utilities for user input fields
 */

// Email validation constants
const EMAIL_MAX_LENGTH = 320; // RFC 5321 standard
const DISPLAY_NAME_MAX_LENGTH = 50;

// Regular expressions for validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const DISPLAY_NAME_REGEX = /^[a-zA-Z0-9\s._-]*$/; // Allow letters, numbers, spaces, dots, underscores, hyphens

// Characters to remove/sanitize (potential XSS and injection risks)
const DANGEROUS_CHARS = /[<>"'&\\#%$@!*(){}\[\]|;:,?/+=`~^]/g;

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue: string;
  errors: string[];
}

/**
 * Sanitizes input by removing dangerous characters and trimming whitespace
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove dangerous characters and trim
  return input
    .replace(DANGEROUS_CHARS, '')
    .trim();
}

/**
 * Validates and sanitizes email input
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  let sanitizedValue = email.trim().toLowerCase();
  
  // Check if empty
  if (!sanitizedValue) {
    errors.push('Email is required');
    return { isValid: false, sanitizedValue: '', errors };
  }
  
  // Check length
  if (sanitizedValue.length > EMAIL_MAX_LENGTH) {
    errors.push(`Email must be ${EMAIL_MAX_LENGTH} characters or less`);
  }
  
  // Check format
  if (!EMAIL_REGEX.test(sanitizedValue)) {
    errors.push('Please enter a valid email address');
  }
  
  // Additional sanitization for emails (remove any remaining dangerous chars)
  const originalLength = sanitizedValue.length;
  sanitizedValue = sanitizedValue.replace(/[<>"'&\\#%$!*(){}\[\]|;:,?+=`~^]/g, '');
  
  if (sanitizedValue.length !== originalLength) {
    errors.push('Email contains invalid characters');
  }
  
  return {
    isValid: errors.length === 0,
    sanitizedValue,
    errors
  };
}

/**
 * Validates and sanitizes display name input
 */
export function validateDisplayName(displayName: string): ValidationResult {
  const errors: string[] = [];
  let sanitizedValue = displayName.trim();
  
  // Display name is optional, so empty is valid
  if (!sanitizedValue) {
    return { isValid: true, sanitizedValue: '', errors: [] };
  }
  
  // Check length
  if (sanitizedValue.length > DISPLAY_NAME_MAX_LENGTH) {
    errors.push(`Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or less`);
  }
  
  // Check for valid characters
  if (!DISPLAY_NAME_REGEX.test(sanitizedValue)) {
    errors.push('Display name can only contain letters, numbers, spaces, dots, underscores, and hyphens');
  }
  
  // Sanitize by removing dangerous characters
  const originalLength = sanitizedValue.length;
  sanitizedValue = sanitizeInput(sanitizedValue);
  
  if (sanitizedValue.length !== originalLength) {
    errors.push('Display name contains invalid characters that were removed');
  }
  
  return {
    isValid: errors.length === 0,
    sanitizedValue,
    errors
  };
}

/**
 * Validates password strength (for create user form)
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  const sanitizedValue = password; // Don't sanitize passwords, just validate
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, sanitizedValue: '', errors };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be 128 characters or less');
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|\\,.<>/?)');
  }
  
  return {
    isValid: errors.length === 0,
    sanitizedValue,
    errors
  };
}

/**
 * Gets password requirements as a formatted string for display
 */
export function getPasswordRequirements(): string[] {
  return [
    'At least 8 characters long',
    'At least one lowercase letter (a-z)',
    'At least one uppercase letter (A-Z)', 
    'At least one number (0-9)',
    'At least one special character (!@#$%^&*()_+-=[]{};\':"|\\,.<>/?)',
  ];
}

/**
 * Real-time input sanitization for form fields
 */
export function sanitizeFormInput(value: string, fieldType: 'email' | 'displayName'): string {
  if (!value) return '';
  
  switch (fieldType) {
    case 'email':
      // For email, only allow valid email characters
      return value.replace(/[^a-zA-Z0-9._%+-@]/g, '').toLowerCase();
    
    case 'displayName':
      // For display name, allow safe characters only
      return value.replace(/[^a-zA-Z0-9\s._-]/g, '');
    
    default:
      return sanitizeInput(value);
  }
}