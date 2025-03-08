import { FC, useState, useEffect } from 'react';
import MatchCard from './MatchCard';
import { useAuth } from '../context/AuthContext';
import { loadFavoriteMatchIds } from '../../lib/utils';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'live' | 'finished' | 'scheduled';
  time?: string;
  league: string;
}

interface MatchListProps {
  matches: Match[];
  title: string;
  showFavoritesOnly?: boolean;
}

const MatchList: FC<MatchListProps> = ({ matches, title, showFavoritesOnly = false }) => {
  const { user } = useAuth();
  const [favoriteMatchIds, setFavoriteMatchIds] = useState<string[]>([]);
  const [displayMatches, setDisplayMatches] = useState<Match[]>(matches);

  useEffect(() => {
    async function fetchFavorites() {
      if (user) {
        const favorites = await loadFavoriteMatchIds(user.id);
        setFavoriteMatchIds(favorites);
        
        if (showFavoritesOnly) {
          setDisplayMatches(matches.filter(match => favorites.includes(match.id)));
        } else {
          setDisplayMatches(matches);
        }
      } else {
        setDisplayMatches(matches);
      }
    }
    
    fetchFavorites();
  }, [matches, user, showFavoritesOnly]);

  const handleFavoriteToggle = (matchId: string, isFavorite: boolean) => {
    // Update local state immediately for better UX
    if (isFavorite) {
      setFavoriteMatchIds(prev => [...prev, matchId]);
    } else {
      setFavoriteMatchIds(prev => prev.filter(id => id !== matchId));
    }
    
    // If showing favorites only, update the displayed matches
    if (showFavoritesOnly && !isFavorite) {
      setDisplayMatches(prev => prev.filter(match => match.id !== matchId));
    }
  };

  const groupedMatches = displayMatches.reduce((acc, match) => {
    if (!acc[match.league]) {
      acc[match.league] = [];
    }
    acc[match.league].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn">
      <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white tracking-tight">{title}</h2>
      
      {Object.keys(groupedMatches).length === 0 ? (
        <div className="text-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">
            {showFavoritesOnly ? 'You have no favorite matches yet.' : 'No matches available at the moment.'}
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedMatches).map(([league, leagueMatches]) => (
            <div key={league} className="animate-slideUp">
              <h3 className="text-xl font-semibold mb-6 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">{league}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leagueMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    id={match.id}
                    homeTeam={match.homeTeam}
                    awayTeam={match.awayTeam}
                    homeScore={match.homeScore}
                    awayScore={match.awayScore}
                    status={match.status}
                    time={match.time}
                    league={match.league}
                    favoriteMatchIds={favoriteMatchIds}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchList;