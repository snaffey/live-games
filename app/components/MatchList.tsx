import { FC } from 'react';
import MatchCard from './MatchCard';

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
}

const MatchList: FC<MatchListProps> = ({ matches, title }) => {
  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.league]) {
      acc[match.league] = [];
    }
    acc[match.league].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn">
      <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white tracking-tight">{title}</h2>
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
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchList;