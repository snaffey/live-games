'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { MatchDetails } from '../types/matchStats';
import { fetchMatchDetails } from '../services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '../components/Header';
import { debounce } from '../../lib/cache';

export default function MatchStatistics({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params);
  const [match, setMatch] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create a memoized fetch function that won't change on re-renders
  const fetchData = useCallback(async () => {
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
  }, [matchId]);

  // Create a debounced version of fetchData to prevent rapid successive calls
  const debouncedFetchData = useCallback(
    debounce(() => {
      console.log('Debounced match details fetch triggered');
      fetchData();
    }, 500),
    [fetchData]
  );

  useEffect(() => {
    // Initial data fetch
    fetchData();

    // Only set up auto-refresh for live matches
    if (match && match.status === 'live') {
      // Refresh live match data every 30 seconds
      const intervalId = setInterval(() => {
        console.log('Refreshing live match data');
        debouncedFetchData();
      }, 30000);

      // Clean up on unmount or when match is no longer live
      return () => clearInterval(intervalId);
    }
  }, [fetchData, debouncedFetchData, match?.status]);

  if (loading && !match) {
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
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="statistics" className="animate-fadeIn">
            <Card>
              <CardHeader>
                <CardTitle>Match Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Function to check if all statistics are zero */}
                {(() => {
                  const stats = match.statistics;
                  const allStatsZero = 
                    stats.possession.home === 0 && stats.possession.away === 0 &&
                    stats.shots.home === 0 && stats.shots.away === 0 &&
                    stats.shotsOnTarget.home === 0 && stats.shotsOnTarget.away === 0 &&
                    stats.corners.home === 0 && stats.corners.away === 0 &&
                    stats.fouls.home === 0 && stats.fouls.away === 0 &&
                    stats.yellowCards.home === 0 && stats.yellowCards.away === 0 &&
                    stats.redCards.home === 0 && stats.redCards.away === 0;
                  
                  if (allStatsZero) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Statistics Available</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md">
                          Statistics for this match have not been recorded yet. Check back later for updates.
                        </p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-6">
                  {/* Possession */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{match.statistics.possession.home}%</span>
                      <span className="font-medium">Possession</span>
                      <span>{match.statistics.possession.away}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${match.statistics.possession.home}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Shots */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{match.statistics.shots.home}</span>
                      <span className="font-medium">Shots</span>
                      <span>{match.statistics.shots.away}</span>
                    </div>
                    <div className="flex w-full">
                      <div className="flex-1 flex justify-end">
                        <div
                          className="bg-blue-600 h-2.5 rounded-l-full"
                          style={{
                            width: `${(match.statistics.shots.home / (match.statistics.shots.home + match.statistics.shots.away)) * 100}%`,
                            maxWidth: '100%'
                          }}
                        ></div>
                      </div>
                      <div className="flex-1">
                        <div
                          className="bg-red-600 h-2.5 rounded-r-full"
                          style={{
                            width: `${(match.statistics.shots.away / (match.statistics.shots.home + match.statistics.shots.away)) * 100}%`,
                            maxWidth: '100%'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Shots on Target */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{match.statistics.shotsOnTarget.home}</span>
                      <span className="font-medium">Shots on Target</span>
                      <span>{match.statistics.shotsOnTarget.away}</span>
                    </div>
                    <div className="flex w-full">
                      <div className="flex-1 flex justify-end">
                        <div
                          className="bg-blue-600 h-2.5 rounded-l-full"
                          style={{
                            width: `${(match.statistics.shotsOnTarget.home / (match.statistics.shotsOnTarget.home + match.statistics.shotsOnTarget.away || 1)) * 100}%`,
                            maxWidth: '100%'
                          }}
                        ></div>
                      </div>
                      <div className="flex-1">
                        <div
                          className="bg-red-600 h-2.5 rounded-r-full"
                          style={{
                            width: `${(match.statistics.shotsOnTarget.away / (match.statistics.shotsOnTarget.home + match.statistics.shotsOnTarget.away || 1)) * 100}%`,
                            maxWidth: '100%'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Corners */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{match.statistics.corners.home}</span>
                      <span className="font-medium">Corners</span>
                      <span>{match.statistics.corners.away}</span>
                    </div>
                    <div className="flex w-full">
                      <div className="flex-1 flex justify-end">
                        <div
                          className="bg-blue-600 h-2.5 rounded-l-full"
                          style={{
                            width: `${(match.statistics.corners.home / (match.statistics.corners.home + match.statistics.corners.away || 1)) * 100}%`,
                            maxWidth: '100%'
                          }}
                        ></div>
                      </div>
                      <div className="flex-1">
                        <div
                          className="bg-red-600 h-2.5 rounded-r-full"
                          style={{
                            width: `${(match.statistics.corners.away / (match.statistics.corners.home + match.statistics.corners.away || 1)) * 100}%`,
                            maxWidth: '100%'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Fouls */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{match.statistics.fouls.home}</span>
                      <span className="font-medium">Fouls</span>
                      <span>{match.statistics.fouls.away}</span>
                    </div>
                    <div className="flex w-full">
                      <div className="flex-1 flex justify-end">
                        <div
                          className="bg-blue-600 h-2.5 rounded-l-full"
                          style={{
                            width: `${(match.statistics.fouls.home / (match.statistics.fouls.home + match.statistics.fouls.away || 1)) * 100}%`,
                            maxWidth: '100%'
                          }}
                        ></div>
                      </div>
                      <div className="flex-1">
                        <div
                          className="bg-red-600 h-2.5 rounded-r-full"
                          style={{
                            width: `${(match.statistics.fouls.away / (match.statistics.fouls.home + match.statistics.fouls.away || 1)) * 100}%`,
                            maxWidth: '100%'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Yellow Cards */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{match.statistics.yellowCards.home}</span>
                      <span className="font-medium">Yellow Cards</span>
                      <span>{match.statistics.yellowCards.away}</span>
                    </div>
                    <div className="flex w-full">
                      <div className="flex-1 flex justify-end">
                        <div
                          className="bg-blue-600 h-2.5 rounded-l-full"
                          style={{
                            width: `${(match.statistics.yellowCards.home / (match.statistics.yellowCards.home + match.statistics.yellowCards.away || 1)) * 100}%`,
                            maxWidth: '100%'
                          }}
                        ></div>
                      </div>
                      <div className="flex-1">
                        <div
                          className="bg-red-600 h-2.5 rounded-r-full"
                          style={{
                            width: `${(match.statistics.yellowCards.away / (match.statistics.yellowCards.home + match.statistics.yellowCards.away || 1)) * 100}%`,
                            maxWidth: '100%'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Red Cards */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{match.statistics.redCards.home}</span>
                      <span className="font-medium">Red Cards</span>
                      <span>{match.statistics.redCards.away}</span>
                    </div>
                    <div className="flex w-full">
                      <div className="flex-1 flex justify-end">
                        <div
                          className="bg-blue-600 h-2.5 rounded-l-full"
                          style={{
                            width: `${(match.statistics.redCards.home / (match.statistics.redCards.home + match.statistics.redCards.away || 1)) * 100}%`,
                            maxWidth: '100%'
                          }}
                        ></div>
                      </div>
                      <div className="flex-1">
                        <div
                          className="bg-red-600 h-2.5 rounded-r-full"
                          style={{
                            width: `${(match.statistics.redCards.away / (match.statistics.redCards.home + match.statistics.redCards.away || 1)) * 100}%`,
                            maxWidth: '100%'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Other statistics... */}
                </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="animate-fadeIn">
            <Card>
              <CardHeader>
                <CardTitle>Match Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {match.events && match.events.length > 0 ? (
                    match.events.map((event, index) => (
                      <div
                        key={index}
                        className={`flex items-start p-3 rounded-lg ${event.team === 'home' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}
                      >
                        <div className="flex-shrink-0 w-12 text-center">
                          <span className="font-bold">{event.minute}'</span>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center">
                            <span className={`mr-2 ${event.team === 'home' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                              {event.type === 'goal' && '⚽'}
                              {event.type === 'yellow_card' && '🟨'}
                              {event.type === 'red_card' && '🟥'}
                              {event.type === 'substitution' && '🔄'}
                            </span>
                            {event.type !== 'substitution' && <span className="font-medium">{event.player}</span>}
                          </div>
                          {event.type === 'substitution' && event.assistedBy ? (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="inline-flex items-center">
                                <span className="text-green-600 dark:text-green-400 mr-1">↑</span> {event.player}
                              </span>
                              <span className="mx-1">•</span>
                              <span className="inline-flex items-center">
                                <span className="text-red-600 dark:text-red-400 mr-1">↓</span> {event.assistedBy}
                              </span>
                            </div>
                          ) : event.assistedBy && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Assisted by: {event.assistedBy}
                            </div>
                          )}
                          {event.description && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {event.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No events recorded for this match yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}