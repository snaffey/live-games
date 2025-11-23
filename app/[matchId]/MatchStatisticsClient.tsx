'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { MatchDetails } from '../types/matchStats';
import { fetchMatchDetails } from '../services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '../components/Header';
import SocialShareButtons from '../components/SocialShareButtons';
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
            
            <div className="flex justify-between items-center">
              <div className={`px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1.5
                ${match.status === 'live' ? 'bg-green-100 text-green-600 dark:bg-green-900/70 dark:text-green-300' : ''}
                ${match.status === 'finished' ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' : ''}
                ${match.status === 'scheduled' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/70 dark:text-blue-300' : ''}
              `}>
                {match.status === 'live' && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
                {match.status === 'live' ? 'LIVE' : match.status === 'finished' ? 'Finished' : match.time}
              </div>
              
              <SocialShareButtons 
                matchId={matchId}
                homeTeam={match.homeTeam}
                awayTeam={match.awayTeam}
                homeScore={match.homeScore}
                awayScore={match.awayScore}
                league={match.league}
                status={match.status}
              />
            </div>
          </CardContent>
        </Card>

        {/* Match Content */}
        <Tabs defaultValue="statistics" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="statistics" className="space-y-4">
            {/* Statistics content */}
            <Card>
              <CardHeader>
                <CardTitle>Match Statistics</CardTitle>
                <CardDescription className="flex justify-between text-sm pt-2">
                  <span className="font-medium text-blue-600 dark:text-blue-400">{match.homeTeam}</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{match.awayTeam}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Team Performance Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold mb-3 text-blue-600 dark:text-blue-400">{match.homeTeam} Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{match.statistics.shots.home}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total Shots</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{match.statistics.shotsOnTarget.home}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Shots on Target</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{match.statistics.possession.home}%</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Possession</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{match.statistics.corners.home}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Corners</div>
                      </div>
                    </div>
                    {/* Shooting Efficiency */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Shooting Accuracy</span>
                        <span>{match.statistics.shots.home > 0 ? 
                          Math.round((match.statistics.shotsOnTarget.home / match.statistics.shots.home) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full" 
                          style={{ width: `${match.statistics.shots.home > 0 ? 
                            (match.statistics.shotsOnTarget.home / match.statistics.shots.home) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold mb-3 text-red-600 dark:text-red-400">{match.awayTeam} Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{match.statistics.shots.away}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total Shots</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{match.statistics.shotsOnTarget.away}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Shots on Target</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{match.statistics.possession.away}%</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Possession</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{match.statistics.corners.away}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Corners</div>
                      </div>
                    </div>
                    {/* Shooting Efficiency */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Shooting Accuracy</span>
                        <span>{match.statistics.shots.away > 0 ? 
                          Math.round((match.statistics.shotsOnTarget.away / match.statistics.shots.away) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-red-600 h-full" 
                          style={{ width: `${match.statistics.shots.away > 0 ? 
                            (match.statistics.shotsOnTarget.away / match.statistics.shots.away) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">Head-to-Head Comparison</h3>
                
                {/* Possession */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="w-16 text-right text-sm font-medium text-blue-600 dark:text-blue-400">{match.statistics.possession.home}%</div>
                    <div className="flex-1 mx-4">
                      <div className="flex justify-center text-xs font-medium mb-1">Possession</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div className="flex h-full">
                          <div 
                            className="bg-blue-600 h-full" 
                            style={{ width: `${match.statistics.possession.home}%` }}
                          ></div>
                          <div 
                            className="bg-red-600 h-full" 
                            style={{ width: `${match.statistics.possession.away}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="w-16 text-left text-sm font-medium text-red-600 dark:text-red-400">{match.statistics.possession.away}%</div>
                  </div>
                </div>
                
                {/* Shots */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="w-16 text-right text-sm font-medium text-blue-600 dark:text-blue-400">{match.statistics.shots.home}</div>
                    <div className="flex-1 mx-4">
                      <div className="flex justify-center text-xs font-medium mb-1">Total Shots</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div className="flex h-full">
                          <div 
                            className="bg-blue-600 h-full" 
                            style={{ width: `${(match.statistics.shots.home / (match.statistics.shots.home + match.statistics.shots.away || 1)) * 100}%` }}
                          ></div>
                          <div 
                            className="bg-red-600 h-full" 
                            style={{ width: `${(match.statistics.shots.away / (match.statistics.shots.home + match.statistics.shots.away || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="w-16 text-left text-sm font-medium text-red-600 dark:text-red-400">{match.statistics.shots.away}</div>
                  </div>
                </div>
                
                {/* Shots on Target */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="w-16 text-right text-sm font-medium text-blue-600 dark:text-blue-400">{match.statistics.shotsOnTarget.home}</div>
                    <div className="flex-1 mx-4">
                      <div className="flex justify-center text-xs font-medium mb-1">Shots on Target</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div className="flex h-full">
                          <div 
                            className="bg-blue-600 h-full" 
                            style={{ width: `${(match.statistics.shotsOnTarget.home / (match.statistics.shotsOnTarget.home + match.statistics.shotsOnTarget.away || 1)) * 100}%` }}
                          ></div>
                          <div 
                            className="bg-red-600 h-full" 
                            style={{ width: `${(match.statistics.shotsOnTarget.away / (match.statistics.shotsOnTarget.home + match.statistics.shotsOnTarget.away || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="w-16 text-left text-sm font-medium text-red-600 dark:text-red-400">{match.statistics.shotsOnTarget.away}</div>
                  </div>
                </div>
                
                {/* Corners */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="w-16 text-right text-sm font-medium text-blue-600 dark:text-blue-400">{match.statistics.corners.home}</div>
                    <div className="flex-1 mx-4">
                      <div className="flex justify-center text-xs font-medium mb-1">Corners</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div className="flex h-full">
                          <div 
                            className="bg-blue-600 h-full" 
                            style={{ width: `${(match.statistics.corners.home / (match.statistics.corners.home + match.statistics.corners.away || 1)) * 100}%` }}
                          ></div>
                          <div 
                            className="bg-red-600 h-full" 
                            style={{ width: `${(match.statistics.corners.away / (match.statistics.corners.home + match.statistics.corners.away || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="w-16 text-left text-sm font-medium text-red-600 dark:text-red-400">{match.statistics.corners.away}</div>
                  </div>
                </div>
                
                {/* Fouls */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="w-16 text-right text-sm font-medium text-blue-600 dark:text-blue-400">{match.statistics.fouls.home}</div>
                    <div className="flex-1 mx-4">
                      <div className="flex justify-center text-xs font-medium mb-1">Fouls</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div className="flex h-full">
                          <div 
                            className="bg-blue-600 h-full" 
                            style={{ width: `${(match.statistics.fouls.home / (match.statistics.fouls.home + match.statistics.fouls.away || 1)) * 100}%` }}
                          ></div>
                          <div 
                            className="bg-red-600 h-full" 
                            style={{ width: `${(match.statistics.fouls.away / (match.statistics.fouls.home + match.statistics.fouls.away || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="w-16 text-left text-sm font-medium text-red-600 dark:text-red-400">{match.statistics.fouls.away}</div>
                  </div>
                </div>
                
                {/* Cards Visualization */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 mb-4">
                  {/* Yellow Cards */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Yellow Cards</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-end">
                        {[...Array(match.statistics.yellowCards.home)].map((_, i) => (
                          <div key={`home-yellow-${i}`} className="w-6 h-9 bg-yellow-400 rounded-sm mx-1 shadow-md"></div>
                        ))}
                        {match.statistics.yellowCards.home === 0 && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">None</div>
                        )}
                      </div>
                      <div className="flex flex-col items-center px-4">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</div>
                        <div className="text-lg font-bold">
                          {match.statistics.yellowCards.home} - {match.statistics.yellowCards.away}
                        </div>
                      </div>
                      <div className="flex items-end">
                        {[...Array(match.statistics.yellowCards.away)].map((_, i) => (
                          <div key={`away-yellow-${i}`} className="w-6 h-9 bg-yellow-400 rounded-sm mx-1 shadow-md"></div>
                        ))}
                        {match.statistics.yellowCards.away === 0 && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">None</div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs">
                      <div className="text-blue-600 dark:text-blue-400">{match.homeTeam}</div>
                      <div className="text-red-600 dark:text-red-400">{match.awayTeam}</div>
                    </div>
                  </div>
                  
                  {/* Red Cards */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Red Cards</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-end">
                        {[...Array(match.statistics.redCards.home)].map((_, i) => (
                          <div key={`home-red-${i}`} className="w-6 h-9 bg-red-600 rounded-sm mx-1 shadow-md"></div>
                        ))}
                        {match.statistics.redCards.home === 0 && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">None</div>
                        )}
                      </div>
                      <div className="flex flex-col items-center px-4">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</div>
                        <div className="text-lg font-bold">
                          {match.statistics.redCards.home} - {match.statistics.redCards.away}
                        </div>
                      </div>
                      <div className="flex items-end">
                        {[...Array(match.statistics.redCards.away)].map((_, i) => (
                          <div key={`away-red-${i}`} className="w-6 h-9 bg-red-600 rounded-sm mx-1 shadow-md"></div>
                        ))}
                        {match.statistics.redCards.away === 0 && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">None</div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs">
                      <div className="text-blue-600 dark:text-blue-400">{match.homeTeam}</div>
                      <div className="text-red-600 dark:text-red-400">{match.awayTeam}</div>
                    </div>
                  </div>
                </div>
                
                {/* Match Key Stats */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 mt-8">
                  <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Match Key Stats</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Shot Conversion Rate</div>
                      <div className="grid grid-cols-3 items-center">
                        <div className="text-blue-600 dark:text-blue-400 font-medium">
                          {match.statistics.shots.home > 0 ? 
                            Math.round((match.homeScore / match.statistics.shots.home) * 100) : 0}%
                        </div>
                        <div className="text-xs">vs</div>
                        <div className="text-red-600 dark:text-red-400 font-medium">
                          {match.statistics.shots.away > 0 ? 
                            Math.round((match.awayScore / match.statistics.shots.away) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Shots per Goal</div>
                      <div className="grid grid-cols-3 items-center">
                        <div className="text-blue-600 dark:text-blue-400 font-medium">
                          {match.homeScore > 0 ? 
                            (match.statistics.shots.home / match.homeScore).toFixed(1) : '-'}
                        </div>
                        <div className="text-xs">vs</div>
                        <div className="text-red-600 dark:text-red-400 font-medium">
                          {match.awayScore > 0 ? 
                            (match.statistics.shots.away / match.awayScore).toFixed(1) : '-'}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fouls per Card</div>
                      <div className="grid grid-cols-3 items-center">
                        <div className="text-blue-600 dark:text-blue-400 font-medium">
                          {(match.statistics.yellowCards.home + match.statistics.redCards.home) > 0 ? 
                            (match.statistics.fouls.home / (match.statistics.yellowCards.home + match.statistics.redCards.home)).toFixed(1) : '-'}
                        </div>
                        <div className="text-xs">vs</div>
                        <div className="text-red-600 dark:text-red-400 font-medium">
                          {(match.statistics.yellowCards.away + match.statistics.redCards.away) > 0 ? 
                            (match.statistics.fouls.away / (match.statistics.yellowCards.away + match.statistics.redCards.away)).toFixed(1) : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="timeline" className="space-y-4">
            {/* Timeline content */}
            <Card>
              <CardHeader>
                <CardTitle>Match Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {!match.timeline || match.timeline.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No events to display yet
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                    
                    {/* Timeline events */}
                    <div className="space-y-6">
                      {match.timeline.map((event, index) => (
                        <div key={index} className="relative pl-12">
                          {/* Event time marker */}
                          <div className="absolute left-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-medium">
                            {event.minute}'
                          </div>
                          
                          {/* Event content */}
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center space-x-2">
                              {/* Event icon based on type */}
                              {event.type === 'goal' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                                  <circle cx="12" cy="12" r="10"/>
                                  <path d="m8 12 3 3 5-5"/>
                                </svg>
                              )}
                              {event.type === 'yellow_card' && (
                                <div className="w-3 h-4 bg-yellow-400 rounded-sm"></div>
                              )}
                              {event.type === 'red_card' && (
                                <div className="w-3 h-4 bg-red-500 rounded-sm"></div>
                              )}
                              {event.type === 'substitution' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                  <path d="M17 2v20"/>
                                  <path d="m2 17 5-5-5-5"/>
                                  <path d="M7 17h10"/>
                                </svg>
                              )}
                              
                              <span className="font-medium">{event.team}</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}