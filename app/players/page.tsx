'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { debounce } from '../../lib/cache';

interface PlayerStat {
  id: string;
  name: string;
  team: string;
  teamLogo?: string;
  position: string;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  minutesPlayed?: number;
  appearances?: number;
  playerImage?: string;
}

interface LeaguePlayerStats {
  leagueId: string;
  leagueName: string;
  season: string;
  topScorers: PlayerStat[];
  topAssists: PlayerStat[];
}

// Mock data for initial development - will be replaced with API calls
const mockPlayerStats: LeaguePlayerStats[] = [
  {
    leagueId: '39',
    leagueName: 'Premier League',
    season: '2023/2024',
    topScorers: [
      {
        id: '1',
        name: 'Erling Haaland',
        team: 'Manchester City',
        teamLogo: 'https://media.api-sports.io/football/teams/50.png',
        position: 'Forward',
        goals: 27,
        assists: 5,
        appearances: 31,
        playerImage: 'https://media.api-sports.io/football/players/1100.png'
      },
      {
        id: '2',
        name: 'Cole Palmer',
        team: 'Chelsea',
        teamLogo: 'https://media.api-sports.io/football/teams/49.png',
        position: 'Midfielder',
        goals: 22,
        assists: 11,
        appearances: 34,
        playerImage: 'https://media.api-sports.io/football/players/2935.png'
      },
      // More players would be added here
    ],
    topAssists: [
      {
        id: '3',
        name: 'Ollie Watkins',
        team: 'Aston Villa',
        teamLogo: 'https://media.api-sports.io/football/teams/66.png',
        position: 'Forward',
        goals: 19,
        assists: 13,
        appearances: 37,
        playerImage: 'https://media.api-sports.io/football/players/2920.png'
      },
      {
        id: '4',
        name: 'Kevin De Bruyne',
        team: 'Manchester City',
        teamLogo: 'https://media.api-sports.io/football/teams/50.png',
        position: 'Midfielder',
        goals: 4,
        assists: 10,
        appearances: 18,
        playerImage: 'https://media.api-sports.io/football/players/627.png'
      },
      // More players would be added here
    ]
  },
  {
    leagueId: '140',
    leagueName: 'La Liga',
    season: '2023/2024',
    topScorers: [
      {
        id: '5',
        name: 'Artem Dovbyk',
        team: 'Girona',
        teamLogo: 'https://media.api-sports.io/football/teams/547.png',
        position: 'Forward',
        goals: 24,
        assists: 8,
        appearances: 37,
        playerImage: 'https://media.api-sports.io/football/players/48441.png'
      },
      // More players would be added here
    ],
    topAssists: [
      {
        id: '6',
        name: 'Antoine Griezmann',
        team: 'Atletico Madrid',
        teamLogo: 'https://media.api-sports.io/football/teams/530.png',
        position: 'Forward',
        goals: 14,
        assists: 9,
        appearances: 35,
        playerImage: 'https://media.api-sports.io/football/players/2172.png'
      },
      // More players would be added here
    ]
  }
];

export default function Players() {
  const [playerStats, setPlayerStats] = useState<LeaguePlayerStats[]>(mockPlayerStats);
  const [selectedLeague, setSelectedLeague] = useState<string>(mockPlayerStats[0]?.leagueId || '');
  const [statType, setStatType] = useState<'goals' | 'assists'>('goals');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // In the future, this will fetch real data from the API
  const fetchPlayerStats = useCallback(async (leagueId: string) => {
    try {
      setLoading(true);
      // This will be replaced with actual API call
      // const data = await fetchLeaguePlayerStats(leagueId);
      // setPlayerStats(data);
      
      // For now, we're using mock data
      console.log(`Fetching player stats for league ${leagueId}`);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error('Error fetching player stats:', err);
      setError('Failed to load player statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a debounced version of fetchPlayerStats
  const debouncedFetchPlayerStats = useCallback(
    debounce((leagueId: string) => {
      console.log('Debounced fetch player stats triggered');
      fetchPlayerStats(leagueId);
    }, 500),
    [fetchPlayerStats]
  );

  useEffect(() => {
    if (selectedLeague) {
      debouncedFetchPlayerStats(selectedLeague);
    }
  }, [selectedLeague, debouncedFetchPlayerStats]);

  // Get the current selected league player stats
  const currentLeagueStats = playerStats.find(league => league.leagueId === selectedLeague);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Player Statistics</h1>
        
        {/* League selector tabs */}
        <Tabs defaultValue={selectedLeague} onValueChange={setSelectedLeague} className="mb-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {playerStats.map(league => (
              <TabsTrigger key={league.leagueId} value={league.leagueId} className="text-sm">
                {league.leagueName}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Stat type selector */}
        <Tabs defaultValue={statType} onValueChange={(value) => setStatType(value as 'goals' | 'assists')} className="mb-8">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
            <TabsTrigger value="goals" className="text-sm">
              Top Scorers
            </TabsTrigger>
            <TabsTrigger value="assists" className="text-sm">
              Top Assists
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Player stats content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-600 dark:text-red-400">{error}</div>
        ) : currentLeagueStats ? (
          <Card className="overflow-hidden border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <CardHeader className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center justify-between">
                <span>{statType === 'goals' ? 'Top Scorers' : 'Top Assists'} - {currentLeagueStats.leagueName}</span>
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{currentLeagueStats.season}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Player</th>
                      <th className="px-4 py-3 text-left">Team</th>
                      <th className="px-4 py-3 text-center">{statType === 'goals' ? 'Goals' : 'Assists'}</th>
                      <th className="px-4 py-3 text-center">{statType === 'goals' ? 'Assists' : 'Goals'}</th>
                      <th className="px-4 py-3 text-center hidden md:table-cell">Appearances</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(statType === 'goals' ? currentLeagueStats.topScorers : currentLeagueStats.topAssists).map((player, index) => (
                      <tr 
                        key={player.id} 
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            {player.playerImage && (
                              <img 
                                src={player.playerImage} 
                                alt={`${player.name}`} 
                                className="w-8 h-8 object-cover rounded-full"
                              />
                            )}
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{player.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{player.position}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            {player.teamLogo && (
                              <img 
                                src={player.teamLogo} 
                                alt={`${player.team} logo`} 
                                className="w-5 h-5 object-contain"
                              />
                            )}
                            <span className="text-gray-700 dark:text-gray-300">{player.team}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-gray-900 dark:text-white">
                          {statType === 'goals' ? player.goals : player.assists}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                          {statType === 'goals' ? player.assists : player.goals}
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell text-gray-700 dark:text-gray-300">
                          {player.appearances}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  );
}