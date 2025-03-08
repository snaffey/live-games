/**
 * Rate limiting utility to protect API routes from abuse
 */

type RateLimitOptions = {
  interval: number; // Time window in milliseconds
  limit: number; // Maximum number of requests per interval
  uniqueTokenPerInterval: number; // Maximum number of unique tokens to track
};

type TokenEntry = {
  count: number;
  lastReset: number;
};

// In-memory store for rate limiting
let tokenStore: Map<string, TokenEntry> = new Map();

// Cleanup interval to prevent memory leaks
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

// Setup cleanup interval if running on server
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [token, entry] of tokenStore.entries()) {
      // Remove entries that haven't been used in 2x the rate limit interval
      if (now - entry.lastReset > CLEANUP_INTERVAL) {
        tokenStore.delete(token);
      }
    }
  }, CLEANUP_INTERVAL);
}

export function rateLimit(options: RateLimitOptions) {
  const { interval, limit, uniqueTokenPerInterval } = options;

  return {
    /**
     * Check if the token has exceeded the rate limit
     * @param token - Unique identifier (usually IP address)
     * @throws Error if rate limit is exceeded
     */
    check: async (token: string): Promise<void> => {
      const now = Date.now();
      
      // Ensure we don't track too many unique tokens
      if (tokenStore.size >= uniqueTokenPerInterval) {
        // If we've reached the limit of unique tokens, do a cleanup
        const oldestTime = now - interval;
        for (const [existingToken, entry] of tokenStore.entries()) {
          if (entry.lastReset < oldestTime) {
            tokenStore.delete(existingToken);
            if (tokenStore.size < uniqueTokenPerInterval) {
              break;
            }
          }
        }
      }
      
      // Get or create token entry
      let tokenEntry = tokenStore.get(token);
      
      // If the token doesn't exist or the interval has passed, create/reset it
      if (!tokenEntry || (now - tokenEntry.lastReset > interval)) {
        tokenEntry = { count: 0, lastReset: now };
      }
      
      // Increment the count
      tokenEntry.count++;
      
      // Check if the token has exceeded the limit
      if (tokenEntry.count > limit) {
        throw new Error(`Rate limit exceeded for token: ${token}`);
      }
      
      // Update the token in the store
      tokenStore.set(token, tokenEntry);
    },
    
    /**
     * Get current rate limit status for a token
     * @param token - Unique identifier
     * @returns Object with remaining requests and reset time
     */
    getStatus: (token: string) => {
      const entry = tokenStore.get(token);
      if (!entry) {
        return { remaining: limit, reset: Date.now() + interval };
      }
      
      const timeElapsed = Date.now() - entry.lastReset;
      const remaining = Math.max(0, limit - entry.count);
      
      // If the interval has passed, return full limit
      if (timeElapsed > interval) {
        return { remaining: limit, reset: Date.now() + interval };
      }
      
      // Otherwise return remaining count and time until reset
      return {
        remaining,
        reset: entry.lastReset + interval
      };
    }
  };
}