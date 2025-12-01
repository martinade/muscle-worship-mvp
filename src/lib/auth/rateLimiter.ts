// Simple in-memory rate limiter for login attempts
// NOTE: This is a V1.0 solution. For production, use Redis or Upstash.

interface RateLimitStore {
  [ip: string]: number[];
}

const attemptStore: RateLimitStore = {};

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Check if an IP address has exceeded the rate limit
 * @param ip - IP address to check
 * @param limit - Maximum number of attempts allowed (default: 5)
 * @returns true if request is allowed, false if rate limit exceeded
 */
export function checkRateLimit(ip: string, limit: number = 5): boolean {
  const now = Date.now();
  const cutoffTime = now - RATE_LIMIT_WINDOW_MS;

  // Get existing attempts for this IP
  let attempts = attemptStore[ip] || [];

  // Clean up old timestamps (> 15 min ago)
  attempts = attempts.filter(timestamp => timestamp > cutoffTime);

  // Check if limit exceeded
  if (attempts.length >= limit) {
    // Update store with cleaned attempts
    attemptStore[ip] = attempts;
    return false;
  }

  // Add current attempt
  attempts.push(now);
  attemptStore[ip] = attempts;

  return true;
}

/**
 * Reset rate limit for a specific IP (useful after successful login)
 * @param ip - IP address to reset
 */
export function resetRateLimit(ip: string): void {
  delete attemptStore[ip];
}

/**
 * Get remaining attempts for an IP
 * @param ip - IP address to check
 * @param limit - Maximum number of attempts allowed (default: 5)
 * @returns number of remaining attempts
 */
export function getRemainingAttempts(ip: string, limit: number = 5): number {
  const now = Date.now();
  const cutoffTime = now - RATE_LIMIT_WINDOW_MS;

  const attempts = (attemptStore[ip] || []).filter(
    timestamp => timestamp > cutoffTime
  );

  return Math.max(0, limit - attempts.length);
}
