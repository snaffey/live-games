import { FC, MouseEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import FavoriteButton from './FavoriteButton';
import { useAuth } from '../context/AuthContext';
import { isMatchFavorite } from '../../lib/utils';

interface MatchCardProps {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'live' | 'finished' | 'scheduled';
  time?: string;
  league: string;
  favoriteMatchIds?: string[];
  onFavoriteToggle?: (matchId: string, isFavorite: boolean) => void;
}

const MatchCard: FC<MatchCardProps> = ({
  id,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  status,
  time,
  league,
  favoriteMatchIds = [],
  onFavoriteToggle,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(isMatchFavorite(id, favoriteMatchIds));

  // Update isFavorite state when favoriteMatchIds changes
  useEffect(() => {
    setIsFavorite(isMatchFavorite(id, favoriteMatchIds));
  }, [id, favoriteMatchIds]);

  const handleFavoriteToggle = (newFavoriteState: boolean) => {
    setIsFavorite(newFavoriteState);
    if (onFavoriteToggle) {
      onFavoriteToggle(id, newFavoriteState);
    }
  };

  return (
    <Card
      onClick={() => router.push(`/${id}`)}
      className="cursor-pointer group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-gray-100/20 dark:border-gray-700/20">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-100/30 dark:border-gray-700/30 space-y-0">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-700/80 px-3 py-1 rounded-full transition-colors duration-300 group-hover:bg-gray-200/80 dark:group-hover:bg-gray-600/80">
          {league}
        </span>
        <div className="flex items-center gap-2">
          {user && (
            <div onClick={(e) => e.stopPropagation()}>
              <FavoriteButton 
                matchId={id} 
                isFavorite={isFavorite} 
                onToggle={handleFavoriteToggle} 
              />
            </div>
          )}
          <span className={`
            px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5
            ${status === 'live' ? 'bg-green-100 text-green-600 dark:bg-green-900/70 dark:text-green-300' : ''}
            ${status === 'finished' ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' : ''}
            ${status === 'scheduled' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/70 dark:text-blue-300' : ''}
          `}>
            {status === 'live' && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
            {status === 'live' ? 'LIVE' : status === 'finished' ? 'Finished' : time}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50/50 dark:bg-gray-700/30 backdrop-blur-sm transition-all duration-300 group-hover:bg-gray-100/50 dark:group-hover:bg-gray-700/50">
          <div className="font-semibold text-gray-800 dark:text-white truncate mr-6 flex-1 max-w-[70%]">{homeTeam}</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white shrink-0 min-w-[40px] text-right">{homeScore}</div>
        </div>
        <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50/50 dark:bg-gray-700/30 backdrop-blur-sm transition-all duration-300 group-hover:bg-gray-100/50 dark:group-hover:bg-gray-700/50">
          <div className="font-semibold text-gray-800 dark:text-white truncate mr-6 flex-1 max-w-[70%]">{awayTeam}</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white shrink-0 min-w-[40px] text-right">{awayScore}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchCard;