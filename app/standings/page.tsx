'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { debounce } from '../../lib/cache';

interface TeamStanding {
  position: number;
  team: string;
  teamLogo?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: string[];
}

interface LeagueStandings {
  leagueId: string;
  leagueName: string;
  season: string;
  standings: TeamStanding[];
}

// Mock data for initial development - will be replaced with API calls
const mockStandings: LeagueStandings[] = [
  {
    leagueId: '39',
    leagueName: 'Premier League',
    season: '2023/2024',
    standings: [
      {
        position: 1,
        team: 'Manchester City',
        teamLogo: 'https://media.api-sports.io/football/teams/50.png',
        played: 38,
        won: 28,
        drawn: 7,
        lost: 3,
        goalsFor: 94,
        goalsAgainst: 32,
        goalDifference: 62,
        points: 91,
        form: ['W', 'W', 'W', 'D', 'W']
      },
      {
        position: 2,
        team: 'Arsenal',
        teamLogo: 'https://media.api-sports.io/football/teams/42.png',
        played: 38,
        won: 27,
        drawn: 6,
        lost: 5,
        goalsFor: 91,
        goalsAgainst: 29,
        goalDifference: 62,
        points: 87,
        form: ['W', 'W', 'W', 'W', 'W']
      },
      // More teams would be added here
    ]
  },
  {
    leagueId: '140',
    leagueName: 'La Liga',
    season: '2023/2024',
    standings: [
      {
        position: 1,
        team: 'Real Madrid',
        teamLogo: 'https://media.api-sports.io/football/teams/541.png',
        played: 38,
        won: 28,
        drawn: 8,
        lost: 2,
        goalsFor: 87,
        goalsAgainst: 28,
        goalDifference: 59,
        points: 92,
        form: ['W', 'D', 'W', 'W', 'W']
      },
      // More teams would be added here
    ]
  }
];

export default function Standings() {
  const [leagueStandings, setLeagueStandings] = useState<LeagueStandings[]>(mockStandings);
  const [selectedLeague, setSelectedLeague] = useState<string>(mockStandings[0]?.leagueId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // In the future, this will fetch real data from the API
  const fetchStandings = useCallback(async (leagueId: string) => {
    try {
      setLoading(true);
      // This will be replaced with actual API call
      // const data = await fetchLeagueStandings(leagueId);
      // setLeagueStandings(data);
      
      // For now, we're using mock data
      console.log(`Fetching standings for league ${leagueId}`);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error('Error fetching standings:', err);
      setError('Failed to load standings');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a debounced version of fetchStandings
  const debouncedFetchStandings = useCallback(
    debounce((leagueId: string) => {
      console.log('Debounced fetch standings triggered');
      fetchStandings(leagueId);
    }, 500),
    [fetchStandings]
  );

  useEffect(() => {
    if (selectedLeague) {
      debouncedFetchStandings(selectedLeague);
    }
  }, [selectedLeague, debouncedFetchStandings]);

  // Get the current selected league standings
  const currentLeagueStandings = leagueStandings.find(league => league.leagueId === selectedLeague);

  // Format the form indicators (W, D, L)
  const getFormIndicator = (result: string) => {
    const colorClass = {
      'W': 'bg-green-500',
      'D': 'bg-yellow-500',
      'L': 'bg-red-500'
    }[result] || 'bg-gray-300';
    
    return (
      <span className={`inline-block w-5 h-5 rounded-full ${colorClass} text-white text-xs flex items-center justify-center font-bold`}>
        {result}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">League Standings</h1>
        
        {/* League selector tabs */}
        <Tabs defaultValue={selectedLeague} onValueChange={setSelectedLeague} className="mb-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {leagueStandings.map(league => (
              <TabsTrigger key={league.leagueId} value={league.leagueId} className="text-sm">
                {league.leagueName}
              </TabsTrigger>
            ))}
          </TabsList>

          {leagueStandings.map(league => (
            <TabsContent key={league.leagueId} value={league.leagueId}>
              <Card className="overflow-hidden border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <CardHeader className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700">
                  <CardTitle className="flex items-center justify-between">
                    <span>{league.leagueName}</span>
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{league.season}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                  ) : error ? (
                    <div className="text-center p-8 text-red-600 dark:text-red-400">{error}</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                            <th className="px-4 py-3 text-left">#</th>
                            <th className="px-4 py-3 text-left">Team</th>
                            <th className="px-2 py-3 text-center">P</th>
                            <th className="px-2 py-3 text-center">W</th>
                            <th className="px-2 py-3 text-center">D</th>
                            <th className="px-2 py-3 text-center">L</th>
                            <th className="px-2 py-3 text-center">GF</th>
                            <th className="px-2 py-3 text-center">GA</th>
                            <th className="px-2 py-3 text-center">GD</th>
                            <th className="px-3 py-3 text-center">Pts</th>
                            <th className="px-4 py-3 text-center hidden md:table-cell">Form</th>
                          </tr>
                        </thead>
                        <tbody>
                          {league.standings.map((team) => (
                            <tr 
                              key={team.position} 
                              className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                            >
                              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{team.position}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-3">
                                  {team.teamLogo && (
                                    <img 
                                      src={team.teamLogo} 
                                      alt={`${team.team} logo`} 
                                      className="w-6 h-6 object-contain"
                                    />
                                  )}
                                  <span className="font-medium text-gray-900 dark:text-white">{team.team}</span>
                                </div>
                              </td>
                              <td className="px-2 py-3 text-center">{team.played}</td>
                              <td className="px-2 py-3 text-center">{team.won}</td>
                              <td className="px-2 py-3 text-center">{team.drawn}</td>
                              <td className="px-2 py-3 text-center">{team.lost}</td>
                              <td className="px-2 py-3 text-center">{team.goalsFor}</td>
                              <td className="px-2 py-3 text-center">{team.goalsAgainst}</td>
                              <td className="px-2 py-3 text-center">{team.goalDifference}</td>
                              <td className="px-3 py-3 text-center font-bold text-gray-900 dark:text-white">{team.points}</td>
                              <td className="px-4 py-3 hidden md:table-cell">
                                <div className="flex justify-center space-x-1">
                                  {team.form?.map((result, index) => (
                                    <div key={index}>{getFormIndicator(result)}</div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}