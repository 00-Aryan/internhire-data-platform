export function sanitizeError(error: unknown): string {
  // Never expose these patterns
  const sensitivePatterns = [
    /postgresql:\/\//i,
    /password/i,
    /secret/i,
    /token/i,
    /api[_-]key/i,
    /connection string/i
  ]
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  for (const pattern of sensitivePatterns) {
    if (pattern.test(errorMessage)) {
      return 'An error occurred. Please try again later.'
    }
  }
  
  // Only return user-friendly messages
  const userFriendlyErrors = [
    'Invalid input',
    'Unauthorized',
    'Not found',
    'Please subscribe',
    'Subscription expired',
    'Already applied'
  ]
  
  const isUserFriendly = userFriendlyErrors.some(msg => 
    errorMessage.toLowerCase().includes(msg.toLowerCase())
  )
  
  return isUserFriendly ? errorMessage : 'An error occurred'
}
