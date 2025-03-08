/**
 * Cache utility for reducing API requests
 * Implements a client-side cache with expiration times for different data types
 */

type CacheItem<T> = {
  data: T;
  timestamp: number;
  expiresAt: number;
};

type CacheOptions = {
  /** Cache expiration time in milliseconds */
  expirationTime: number;
  /** Cache key prefix to avoid collisions */
  keyPrefix?: string;
};

/**
 * Default cache expiration times (in milliseconds)
 */
export const CACHE_EXPIRATION = {
  // Live match data expires quickly (30 seconds)
  LIVE_MATCHES: 30 * 1000,
  // Match details expire after 2 minutes
  MATCH_DETAILS: 2 * 60 * 1000,
  // Scheduled matches expire after 5 minutes
  SCHEDULED_MATCHES: 5 * 60 * 1000,
  // Finished matches can be cached longer (30 minutes)
  FINISHED_MATCHES: 30 * 60 * 1000,
};

/**
 * In-memory cache for faster access
 */
const memoryCache: Record<string, CacheItem<any>> = {};

/**
 * Generates a cache key based on the provided parameters
 */
export function generateCacheKey(baseKey: string, params?: Record<string, any>): string {
  if (!params) return baseKey;
  
  // Sort keys to ensure consistent cache keys regardless of object property order
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result: Record<string, any>, key) => {
      result[key] = params[key];
      return result;
    }, {});
  
  return `${baseKey}:${JSON.stringify(sortedParams)}`;
}

/**
 * Sets data in the cache with the specified expiration time
 */
export function setCacheData<T>(
  key: string,
  data: T,
  options: CacheOptions
): void {
  const { expirationTime, keyPrefix = '' } = options;
  const fullKey = keyPrefix ? `${keyPrefix}:${key}` : key;
  
  // Calculate expiration timestamp
  const now = Date.now();
  const expiresAt = now + expirationTime;
  
  // Store in memory cache
  memoryCache[fullKey] = {
    data,
    timestamp: now,
    expiresAt,
  };
  
  // Also store in localStorage for persistence across page refreshes
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        fullKey,
        JSON.stringify({
          data,
          timestamp: now,
          expiresAt,
        })
      );
    }
  } catch (error) {
    console.warn('Failed to store data in localStorage:', error);
  }
}

/**
 * Gets data from the cache if it exists and hasn't expired
 */
export function getCacheData<T>(
  key: string,
  options: { keyPrefix?: string } = {}
): T | null {
  const { keyPrefix = '' } = options;
  const fullKey = keyPrefix ? `${keyPrefix}:${key}` : key;
  const now = Date.now();
  
  // First check memory cache (faster)
  const memoryItem = memoryCache[fullKey];
  if (memoryItem && memoryItem.expiresAt > now) {
    return memoryItem.data as T;
  }
  
  // If not in memory, check localStorage
  if (typeof window !== 'undefined') {
    try {
      const storedItem = localStorage.getItem(fullKey);
      if (storedItem) {
        const parsedItem = JSON.parse(storedItem) as CacheItem<T>;
        
        // Check if the data has expired
        if (parsedItem.expiresAt > now) {
          // Restore to memory cache for faster subsequent access
          memoryCache[fullKey] = parsedItem;
          return parsedItem.data;
        } else {
          // Clean up expired data
          localStorage.removeItem(fullKey);
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve data from localStorage:', error);
    }
  }
  
  return null;
}

/**
 * Clears a specific item from the cache
 */
export function clearCacheItem(key: string, options: { keyPrefix?: string } = {}): void {
  const { keyPrefix = '' } = options;
  const fullKey = keyPrefix ? `${keyPrefix}:${key}` : key;
  
  // Clear from memory cache
  delete memoryCache[fullKey];
  
  // Clear from localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.warn('Failed to remove item from localStorage:', error);
    }
  }
}

/**
 * Clears all cache items with a specific prefix
 */
export function clearCacheByPrefix(prefix: string): void {
  // Clear from memory cache
  Object.keys(memoryCache).forEach(key => {
    if (key.startsWith(prefix)) {
      delete memoryCache[key];
    }
  });
  
  // Clear from localStorage
  if (typeof window !== 'undefined') {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear items from localStorage:', error);
    }
  }
}

/**
 * Clears all cache data
 */
export function clearAllCache(): void {
  // Clear memory cache
  Object.keys(memoryCache).forEach(key => {
    delete memoryCache[key];
  });
  
  // Clear localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
}

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}