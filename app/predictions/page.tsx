'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { debounce } from '../../lib/cache';

interface TeamForm {
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  lastFiveForm: string[];
}

interface MatchPrediction {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  matchDate: string;
  league: string;
  venue: string;
  homeTeamForm: TeamForm;
  awayTeamForm: TeamForm;
  homeWinProbability: number;
  drawProbability: number;
  awayWinProbability: number;
  predictedScore?: string;
  keyFactors: string[];
}

interface LeaguePredictions {
  leagueId: string;
  leagueName: string;
  predictions: MatchPrediction[];
}

// Mock data for initial development - will be replaced with API calls
const mockPredictions: LeaguePredictions[] = [
  {
    leagueId: '39',
    leagueName: 'Premier League',
    predictions: [
      {
        id: '1',
        homeTeam: 'Manchester City',
        awayTeam: 'Arsenal',
        homeTeamLogo: 'https://media.api-sports.io/football/teams/50.png',
        awayTeamLogo: 'https://media.api-sports.io/football/teams/42.png',
        matchDate: '2024-05-15T19:45:00+00:00',
        league: 'Premier League',
        venue: 'Etihad Stadium',
        homeTeamForm: {
          wins: 4,
          draws: 1,
          losses: 0,
          goalsScored: 12,
          goalsConceded: 3,
          lastFiveForm: ['W', 'W', 'D', 'W', 'W']
        },
        awayTeamForm: {
          wins: 5,
          draws: 0,
          losses: 0,
          goalsScored: 14,
          goalsConceded: 2,
          lastFiveForm: ['W', 'W', 'W', 'W', 'W']
        },
        homeWinProbability: 45,
        drawProbability: 25,
        awayWinProbability: 30,
        predictedScore: '2-1',
        keyFactors: [
          'Manchester City unbeaten in last 15 home games',
          'Arsenal on 5-game winning streak',
          'Key player Kevin De Bruyne returning from injury'
        ]
      },
      {
        id: '2',
        homeTeam: 'Liverpool',
        awayTeam: 'Chelsea',
        homeTeamLogo: 'https://media.api-sports.io/football/teams/40.png',
        awayTeamLogo: 'https://media.api-sports.io/football/teams/49.png',
        matchDate: '2024-05-16T14:00:00+00:00',
        league: 'Premier League',
        venue: 'Anfield',
        homeTeamForm: {
          wins: 3,
          draws: 1,
          losses: 1,
          goalsScored: 10,
          goalsConceded: 5,
          lastFiveForm: ['W', 'L', 'W', 'D', 'W']
        },
        awayTeamForm: {
          wins: 2,
          draws: 2,
          losses: 1,
          goalsScored: 9,
          goalsConceded: 7,
          lastFiveForm: ['D', 'W', 'L', 'W', 'D']
        },
        homeWinProbability: 55,
        drawProbability: 25,
        awayWinProbability: 20,
        predictedScore: '2-0',
        keyFactors: [
          'Liverpool strong home record against Chelsea',
          'Chelsea struggling with defensive consistency',
          'Mohamed Salah in excellent scoring form'
        ]
      }
    ]
  },
  {
    leagueId: '140',
    leagueName: 'La Liga',
    predictions: [
      {
        id: '3',
        homeTeam: 'Barcelona',
        awayTeam: 'Real Madrid',
        homeTeamLogo: 'https://media.api-sports.io/football/teams/529.png',
        awayTeamLogo: 'https://media.api-sports.io/football/teams/541.png',
        matchDate: '2024-05-17T19:00:00+00:00',
        league: 'La Liga',
        venue: 'Camp Nou',
        homeTeamForm: {
          wins: 3,
          draws: 2,
          losses: 0,
          goalsScored: 11,
          goalsConceded: 4,
          lastFiveForm: ['W', 'D', 'W', 'D', 'W']
        },
        awayTeamForm: {
          wins: 4,
          draws: 1,
          losses: 0,
          goalsScored: 13,
          goalsConceded: 3,
          lastFiveForm: ['W', 'W', 'D', 'W', 'W']
        },
        homeWinProbability: 40,
        drawProbability: 30,
        awayWinProbability: 30,
        predictedScore: '2-2',
        keyFactors: [
          'El Clásico historically unpredictable',
          'Both teams in strong form',
          'Barcelona home advantage significant'
        ]
      }
    ]
  }
];

export default function Predictions() {
  const [predictions, setPredictions] = useState<LeaguePredictions[]>(mockPredictions);
  const [selectedLeague, setSelectedLeague] = useState<string>(mockPredictions[0]?.leagueId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // In the future, this will fetch real data from the API
  const fetchPredictions = useCallback(async (leagueId: string) => {
    try {
      setLoading(true);
      // This will be replaced with actual API call
      // const data = await fetchLeaguePredictions(leagueId);
      // setPredictions(data);
      
      // For now, we're using mock data
      console.log(`Fetching predictions for league ${leagueId}`);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError('Failed to load match predictions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a debounced version of fetchPredictions
  const debouncedFetchPredictions = useCallback(
    debounce((leagueId: string) => {
      console.log('Debounced fetch predictions triggered');
      fetchPredictions(leagueId);
    }, 500),
    [fetchPredictions]
  );

  useEffect(() => {
    if (selectedLeague) {
      debouncedFetchPredictions(selectedLeague);
    }
  }, [selectedLeague, debouncedFetchPredictions]);

  // Get the current selected league predictions
  const currentLeaguePredictions = predictions.find(league => league.leagueId === selectedLeague);

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

  // Format date to readable format
  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Match Predictions</h1>
        
        {/* League selector tabs */}
        <Tabs defaultValue={selectedLeague} onValueChange={setSelectedLeague} className="mb-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {predictions.map(league => (
              <TabsTrigger key={league.leagueId} value={league.leagueId} className="text-sm">
                {league.leagueName}
              </TabsTrigger>
            ))}
          </TabsList>

          {predictions.map(league => (
            <TabsContent key={league.leagueId} value={league.leagueId}>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
                </div>
              ) : error ? (
                <div className="text-center p-8 text-red-600 dark:text-red-400">{error}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {league.predictions.map(prediction => (
                    <Card key={prediction.id} className="overflow-hidden border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{prediction.league}</CardTitle>
                          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{formatMatchDate(prediction.matchDate)}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{prediction.venue}</p>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        {/* Teams and predicted score */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {prediction.homeTeamLogo && (
                              <img 
                                src={prediction.homeTeamLogo} 
                                alt={`${prediction.homeTeam} logo`} 
                                className="w-10 h-10 object-contain"
                              />
                            )}
                            <span className="font-medium text-gray-900 dark:text-white">{prediction.homeTeam}</span>
                          </div>
                          {prediction.predictedScore && (
                            <div className="text-xl font-bold text-gray-900 dark:text-white px-4 py-2 bg-gray-50/80 dark:bg-gray-800/80 rounded-lg">
                              {prediction.predictedScore}
                            </div>
                          )}
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-gray-900 dark:text-white">{prediction.awayTeam}</span>
                            {prediction.awayTeamLogo && (
                              <img 
                                src={prediction.awayTeamLogo} 
                                alt={`${prediction.awayTeam} logo`} 
                                className="w-10 h-10 object-contain"
                              />
                            )}
                          </div>
                        </div>
                        
                        {/* Win probability bar */}
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Win Probability</p>
                          <div className="flex h-4 rounded-full overflow-hidden">
                            <div 
                              className="bg-green-500 text-xs flex items-center justify-center text-white" 
                              style={{ width: `${prediction.homeWinProbability}%` }}
                            >
                              {prediction.homeWinProbability > 15 && `${prediction.homeWinProbability}%`}
                            </div>
                            <div 
                              className="bg-gray-400 text-xs flex items-center justify-center text-white" 
                              style={{ width: `${prediction.drawProbability}%` }}
                            >
                              {prediction.drawProbability > 15 && `${prediction.drawProbability}%`}
                            </div>
                            <div 
                              className="bg-blue-500 text-xs flex items-center justify-center text-white" 
                              style={{ width: `${prediction.awayWinProbability}%` }}
                            >
                              {prediction.awayWinProbability > 15 && `${prediction.awayWinProbability}%`}
                            </div>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-green-600 dark:text-green-400 font-medium">{prediction.homeTeam}</span>
                            <span className="text-gray-600 dark:text-gray-400 font-medium">Draw</span>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">{prediction.awayTeam}</span>
                          </div>
                        </div>
                        
                        {/* Team form */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{prediction.homeTeam} Form</p>
                            <div className="flex space-x-1 mb-2">
                              {prediction.homeTeamForm.lastFiveForm.map((result, index) => (
                                <div key={index}>{getFormIndicator(result)}</div>
                              ))}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                              <p>Wins: {prediction.homeTeamForm.wins}</p>
                              <p>Draws: {prediction.homeTeamForm.draws}</p>
                              <p>Losses: {prediction.homeTeamForm.losses}</p>
                              <p>Goals: {prediction.homeTeamForm.goalsScored} / {prediction.homeTeamForm.goalsConceded}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{prediction.awayTeam} Form</p>
                            <div className="flex space-x-1 mb-2">
                              {prediction.awayTeamForm.lastFiveForm.map((result, index) => (
                                <div key={index}>{getFormIndicator(result)}</div>
                              ))}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                              <p>Wins: {prediction.awayTeamForm.wins}</p>
                              <p>Draws: {prediction.awayTeamForm.draws}</p>
                              <p>Losses: {prediction.awayTeamForm.losses}</p>
                              <p>Goals: {prediction.awayTeamForm.goalsScored} / {prediction.awayTeamForm.goalsConceded}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Key factors */}
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Factors</p>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 pl-5 list-disc">
                            {prediction.keyFactors.map((factor, index) => (
                              <li key={index}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}