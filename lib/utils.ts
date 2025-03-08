import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getFavoriteMatches } from './supabase';
import { Match } from '../app/types/match';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if a match is in the user's favorites
 */
export function isMatchFavorite(matchId: string, favoriteMatchIds: string[]): boolean {
  return favoriteMatchIds.includes(matchId);
}

/**
 * Filters matches to only show favorites
 */
export function filterFavoriteMatches(matches: Match[], favoriteMatchIds: string[]): Match[] {
  return matches.filter(match => isMatchFavorite(match.id, favoriteMatchIds));
}

/**
 * Loads favorite matches for a user
 */
export async function loadFavoriteMatchIds(userId: string | undefined): Promise<string[]> {
  if (!userId) {
    console.log('No user ID provided for loading favorites');
    return [];
  }
  
  try {
    const { data, error } = await getFavoriteMatches(userId);
    
    if (error) {
      console.error('Supabase error loading favorite matches:', {
        error: JSON.stringify(error),
        userId,
        errorMessage: error.message || 'No error message',
        errorCode: 'code' in error ? error.code : 'No error code',
        details: 'details' in error ? error.details : 'No error details',
        stack: new Error().stack
      });
      return [];
    }
    
    if (!data) {
      console.warn('No data returned from getFavoriteMatches');
      return [];
    }
    
    const matchIds = data.map(item => item.match_id);
    console.log(`Successfully loaded ${matchIds.length} favorite matches for user ${userId}`);
    return matchIds;
  } catch (error) {
    console.error('Unexpected error loading favorite matches:', {
      error,
      userId,
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: new Error().stack
    });
    return [];
  }
}

/**
 * Format date for display
 */
export function formatMatchDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
}
