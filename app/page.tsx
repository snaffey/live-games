'use client';

import Image from "next/image";

import { useEffect, useState, useCallback } from 'react';
import Header from './components/Header';
import MatchList from './components/MatchList';
import { fetchLiveMatches } from './services/api';
import { Match } from './types/match';
import { debounce } from '../lib/cache';

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Create a memoized fetch function that won't change on re-renders
  const fetchData = useCallback(async () => {
    try {
      setLoading(prevLoading => !matches.length || prevLoading);
      const { matches: liveMatches, error: fetchError } = await fetchLiveMatches();
      if (fetchError) {
        setError(fetchError);
      } else {
        setMatches(liveMatches);
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, [matches.length]);

  // Create a debounced version of fetchData to prevent rapid successive calls
  const debouncedFetchData = useCallback(
    debounce(() => {
      console.log('Debounced fetch triggered');
      fetchData();
    }, 500),
    [fetchData]
  );

  useEffect(() => {
    // Initial data fetch
    fetchData();

    // Determine refresh interval based on if we have live matches
    const getRefreshInterval = () => {
      // If we have live matches, refresh more frequently (30 seconds)
      // Otherwise, refresh less frequently (2 minutes)
      return matches.some(match => match.status === 'live') ? 30000 : 120000;
    };

    // Set up the refresh interval
    const intervalId = setInterval(() => {
      console.log(`Refreshing data with interval: ${getRefreshInterval()}ms`);
      debouncedFetchData();
    }, getRefreshInterval());

    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [fetchData, debouncedFetchData, matches]);

  // Add a manual refresh function that users can trigger
  const handleManualRefresh = () => {
    console.log('Manual refresh triggered');
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
        {loading && !matches.length ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white shadow-md"></div>
            <p className="text-gray-600 dark:text-gray-300 animate-pulse">Loading live matches...</p>
          </div>
        ) : error ? (
          <div className="text-center p-8 max-w-md mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Error Loading Matches</h3>
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button 
                onClick={handleManualRefresh} 
                className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-800/40 dark:hover:bg-red-800/60 text-red-700 dark:text-red-300 rounded-md transition-colors duration-200 text-sm font-medium">
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Live Games</h2>
              <button 
                onClick={handleManualRefresh}
                className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded-md transition-colors duration-200 flex items-center gap-1"
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
                {loading && <span className="inline-block w-3 h-3 border-t-2 border-blue-700 dark:border-blue-300 rounded-full animate-spin ml-1"></span>}
              </button>
            </div>
            <MatchList matches={matches} title="" />
          </div>
        )}
      </main>
    </div>
  );
}

