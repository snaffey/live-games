'use client';

import { useEffect, useState } from 'react';
import Header from '../components/Header';
import MatchList from '../components/MatchList';
import { fetchLiveMatches } from '../services/api';
import { Match } from '../types/match';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { matches: liveMatches, error: fetchError } = await fetchLiveMatches();
      if (fetchError) {
        setError(fetchError);
      } else {
        setMatches(liveMatches);
      }
      setLoading(false);
    };

    if (user) {
      fetchData();
      // Refresh data every 60 seconds
      const intervalId = setInterval(fetchData, 60000);
      return () => clearInterval(intervalId);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white shadow-md"></div>
            <p className="text-gray-600 dark:text-gray-300 animate-pulse">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth page
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white shadow-md"></div>
            <p className="text-gray-600 dark:text-gray-300 animate-pulse">Loading your favorite matches...</p>
          </div>
        ) : error ? (
          <div className="text-center p-8 max-w-md mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Error Loading Matches</h3>
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <MatchList 
            matches={matches} 
            title="Your Favorite Matches" 
            showFavoritesOnly={true} 
          />
        )}
      </main>
    </div>
  );
}