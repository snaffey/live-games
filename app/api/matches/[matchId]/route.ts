import { NextResponse } from 'next/server';
import type { MatchDetails } from '@/app/types/matchStats';

// Mock data for demonstration
const mockMatchDetails: MatchDetails = {
  id: '1',
  homeTeam: 'Manchester United',
  awayTeam: 'Liverpool',
  homeScore: 2,
  awayScore: 1,
  status: 'finished',
  league: 'Premier League',
  events: [
    {
      minute: 15,
      type: 'goal',
      team: 'home',
      player: 'Marcus Rashford',
      assistedBy: 'Bruno Fernandes',
      description: 'Beautiful through ball from Fernandes'
    },
    {
      minute: 35,
      type: 'yellow_card',
      team: 'away',
      player: 'Virgil van Dijk',
      description: 'Tactical foul'
    },
    {
      minute: 55,
      type: 'goal',
      team: 'away',
      player: 'Mohamed Salah',
      description: 'Counter attack goal'
    },
    {
      minute: 78,
      type: 'goal',
      team: 'home',
      player: 'Bruno Fernandes',
      description: 'Penalty kick'
    }
  ],
  statistics: {
    possession: {
      home: 55,
      away: 45
    },
    shots: {
      home: 12,
      away: 10
    },
    shotsOnTarget: {
      home: 6,
      away: 4
    },
    corners: {
      home: 7,
      away: 5
    },
    fouls: {
      home: 10,
      away: 12
    },
    yellowCards: {
      home: 2,
      away: 3
    },
    redCards: {
      home: 0,
      away: 0
    }
  }
};

export async function GET(
  request: Request,
  { params }: { params: { matchId: string } }
) {
  try {
    // In a real application, you would fetch the match details from a database
    // For now, we'll return mock data
    if (params.matchId) {
      // Simulate a delay to mimic a real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return NextResponse.json(mockMatchDetails);
    }
    
    return NextResponse.json(
      { error: 'Match ID is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching match details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch match details' },
      { status: 500 }
    );
  }
}