'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { addFavoriteMatch, removeFavoriteMatch } from '../../lib/supabase';

interface FavoriteButtonProps {
  matchId: string;
  isFavorite: boolean;
  onToggle: (isFavorite: boolean) => void;
}

export default function FavoriteButton({ matchId, isFavorite, onToggle }: FavoriteButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleToggleFavorite = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/auth';
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await removeFavoriteMatch(user.id, matchId);
      } else {
        await addFavoriteMatch(user.id, matchId);
      }
      onToggle(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`p-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'}`}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={isFavorite ? '0' : '2'}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      </svg>
    </button>
  );
}