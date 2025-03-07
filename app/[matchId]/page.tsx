'use client';

import { use, useEffect, useState } from 'react';
import { MatchDetails } from '../types/matchStats';
import { fetchMatchDetails } from '../services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '../components/Header';

export default function MatchStatistics({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params);
  const [match, setMatch] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchMatchDetails(matchId);
        if (!data) throw new Error('Failed to fetch match details');
        setMatch(data);
      } catch (err) {
        setError('Failed to load match details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [matchId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 dark:text-red-400">{error || 'Match not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fadeIn">
        {/* Match Header */}
        <Card className="mb-8 overflow-hidden border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-0">
            <CardDescription className="text-center text-sm font-medium">{match.league}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4 flex-1 justify-start">
                {match.homeTeamLogo && (
                  <img
                    src={match.homeTeamLogo}
                    alt={`${match.homeTeam} logo`}
                    className="w-16 h-16 object-contain"
                  />
                )}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{match.homeTeam}</h2>
              </div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white px-6 py-2 bg-gray-50/80 dark:bg-gray-800/80 rounded-lg mx-4">
                {match.homeScore} - {match.awayScore}
              </div>
              <div className="flex items-center space-x-4 flex-1 justify-end">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{match.awayTeam}</h2>
                {match.awayTeamLogo && (
                  <img
                    src={match.awayTeamLogo}
                    alt={`${match.awayTeam} logo`}
                    className="w-16 h-16 object-contain"
                  />
                )}
              </div>
            </div>
            <div className="flex justify-center">
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 mt-2
                ${match.status === 'live' ? 'bg-green-100 text-green-600 dark:bg-green-900/70 dark:text-green-300' : ''}
                ${match.status === 'finished' ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' : ''}
                ${match.status === 'scheduled' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/70 dark:text-blue-300' : ''}
              `}>
                {match.status === 'live' && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
                {match.status === 'live' ? 'LIVE' : match.status === 'finished' ? 'Finished' : match.time}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Match Content with Tabs */}
        <Tabs defaultValue="statistics" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="statistics" className="text-base">Statistics</TabsTrigger>
            <TabsTrigger value="timeline" className="text-base">Timeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline" className="animate-fadeIn">
            <Card className="border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <CardHeader>
                <CardTitle>Match Timeline</CardTitle>
                <CardDescription>Key events from the match</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {match.events.map((event, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-4 p-3 rounded-lg transition-colors duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-800/80 ${event.team === 'home' ? 'justify-start' : 'flex-row-reverse'}`}
                  >
                    <div className="w-16 text-sm font-medium text-gray-600 dark:text-gray-400">{event.minute}'</div>
                    <div className={`flex items-center space-x-2 ${event.team === 'away' ? 'flex-row-reverse' : ''}`}>
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center shadow-sm
                        ${event.type === 'goal' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : ''}
                        ${event.type === 'yellow_card' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                        ${event.type === 'red_card' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' : ''}
                        ${event.type === 'substitution' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : ''}
                      `}>
                        {event.type === 'goal' && '⚽'}
                        {event.type === 'yellow_card' && '🟨'}
                        {event.type === 'red_card' && '🟥'}
                        {event.type === 'substitution' && '↔️'}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">{event.player}</span>
                        {event.assistedBy && event.type === 'substitution' ? (
                          <span className="text-gray-600 dark:text-gray-400"> (in) ↔️ {event.assistedBy} (out)</span>
                        ) : event.assistedBy && (
                          <span className="text-gray-600 dark:text-gray-400"> (Assisted by {event.assistedBy})</span>
                        )}
                        {event.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">{event.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="statistics" className="animate-fadeIn">
            <Card className="border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <CardHeader>
                <CardTitle>Match Statistics</CardTitle>
                <CardDescription>Detailed performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
            {/* Possession */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{match.statistics.possession.home}%</span>
                <span>Possession</span>
                <span>{match.statistics.possession.away}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-500"
                  style={{ width: `${match.statistics.possession.home}%` }}
                />
              </div>
            </div>

            {/* Shots */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{match.statistics.shots.home}</span>
                <span>Shots</span>
                <span>{match.statistics.shots.away}</span>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-500"
                    style={{ width: `${(match.statistics.shots.home / (match.statistics.shots.home + match.statistics.shots.away)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Shots on Target */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{match.statistics.shotsOnTarget.home}</span>
                <span>Shots on Target</span>
                <span>{match.statistics.shotsOnTarget.away}</span>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-500"
                    style={{ width: `${(match.statistics.shotsOnTarget.home / (match.statistics.shotsOnTarget.home + match.statistics.shotsOnTarget.away)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Corners */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{match.statistics.corners.home}</span>
                <span>Corners</span>
                <span>{match.statistics.corners.away}</span>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-500"
                    style={{ width: `${(match.statistics.corners.home / (match.statistics.corners.home + match.statistics.corners.away)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Fouls */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{match.statistics.fouls.home}</span>
                <span>Fouls</span>
                <span>{match.statistics.fouls.away}</span>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-500"
                    style={{ width: `${(match.statistics.fouls.home / (match.statistics.fouls.home + match.statistics.fouls.away)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Yellow Cards */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{match.statistics.yellowCards.home}</span>
                <span>Yellow Cards</span>
                <span>{match.statistics.yellowCards.away}</span>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 dark:bg-yellow-500"
                    style={{ width: `${(match.statistics.yellowCards.home / (match.statistics.yellowCards.home + match.statistics.yellowCards.away)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Red Cards */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{match.statistics.redCards.home}</span>
                <span>Red Cards</span>
                <span>{match.statistics.redCards.away}</span>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 dark:bg-red-500"
                    style={{ width: `${(match.statistics.redCards.home / (match.statistics.redCards.home + match.statistics.redCards.away)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}