/**
 * Validation constants for input field length limits
 * These limits help prevent DoS attacks through very long strings
 */

export const VALIDATION_LIMITS = {
  // Review comment: 500 characters
  REVIEW_COMMENT: 500,
  
  // Contact message: 10000 characters
  CONTACT_MESSAGE: 10000,
  
  // Profile description: 500 characters
  PROFILE_DESCRIPTION: 500,
  
  // Name: 25 characters
  NAME: 25,
  
  // Email: 255 characters (standard)
  EMAIL: 255,
} as const;

