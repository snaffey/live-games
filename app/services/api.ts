import { Match } from '../types/match';
import { MatchDetails } from '../types/matchStats';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const API_BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';

interface ApiResponse {
  matches: Match[];
  error?: string;
}

export async function fetchMatchDetails(matchId: string): Promise<MatchDetails | null> {
  try {
    // Fetch basic match details
    const matchResponse = await fetch(`${API_BASE_URL}/fixtures?id=${matchId}`, {
      headers: {
        'x-rapidapi-key': API_KEY || '',
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
      }
    });

    if (!matchResponse.ok) {
      throw new Error('Failed to fetch match details');
    }

    const matchData = await matchResponse.json();
    
    if (!matchData.response || !Array.isArray(matchData.response) || matchData.response.length === 0) {
      throw new Error('Invalid API response format for match details');
    }

    const match = matchData.response[0];
    
    // Fetch statistics separately using the dedicated endpoint
    const statsResponse = await fetch(`${API_BASE_URL}/fixtures/statistics?fixture=${matchId}`, {
      headers: {
        'x-rapidapi-key': API_KEY || '',
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
      }
    });

    if (!statsResponse.ok) {
      throw new Error('Failed to fetch match statistics');
    }

    const statsData = await statsResponse.json();
    
    if (!statsData.response || !Array.isArray(statsData.response)) {
      throw new Error('Invalid API response format for statistics');
    }

    // Helper function to parse statistic values
    const parseStatValue = (value: string | number | null | undefined): number => {
      if (value === null || value === undefined) return 0;
      if (typeof value === 'number') return value;
      // Remove '%' if present and convert to number
      const stringValue = String(value).replace('%', '');
      return parseInt(stringValue) || 0;
    };

    // Helper function to find and parse statistic
    const getStatValue = (teamStats: any[] | undefined, type: string): number => {
      if (!teamStats || !Array.isArray(teamStats)) return 0;
      const stat = teamStats.find((s: any) => s.type === type);
      return parseStatValue(stat?.value);
    };
    
    // Extract statistics from the dedicated statistics endpoint
    let homeStats: any[] = [];
    let awayStats: any[] = [];
    
    if (statsData.response && Array.isArray(statsData.response) && statsData.response.length >= 2) {
      // The API returns an array with home team stats at index 0 and away team stats at index 1
      homeStats = statsData.response[0]?.statistics || [];
      awayStats = statsData.response[1]?.statistics || [];
      
      // Debug log to check the structure of the statistics data
      console.log('Home team statistics:', JSON.stringify(homeStats));
      console.log('Away team statistics:', JSON.stringify(awayStats));
    }
    
    // Transform API response to match our app's data structure
    return {
      id: match.fixture.id.toString(),
      homeTeam: match.teams.home.name,
      awayTeam: match.teams.away.name,
      homeScore: match.goals.home || 0,
      awayScore: match.goals.away || 0,
      status: getMatchStatus(match.fixture.status.short),
      time: match.fixture.status.elapsed ? `${match.fixture.status.elapsed}'` : undefined,
      league: match.league.name,
      homeTeamLogo: match.teams.home.logo,
      awayTeamLogo: match.teams.away.logo,
      events: match.events?.map((event: any) => ({
        minute: event.time.elapsed,
        type: getEventType(event.type),
        team: event.team.id === match.teams.home.id ? 'home' : 'away',
        player: event.player.name,
        assistedBy: event.assist?.name,
        description: event.detail
      })) || [],
      statistics: {
        possession: {
          home: getStatValue(homeStats, 'Ball Possession'),
          away: getStatValue(awayStats, 'Ball Possession')
        },
        shots: {
          home: getStatValue(homeStats, 'Total Shots'),
          away: getStatValue(awayStats, 'Total Shots')
        },
        shotsOnTarget: {
          home: getStatValue(homeStats, 'Shots on Goal'),
          away: getStatValue(awayStats, 'Shots on Goal')
        },
        corners: {
          home: getStatValue(homeStats, 'Corner Kicks'),
          away: getStatValue(awayStats, 'Corner Kicks')
        },
        fouls: {
          home: getStatValue(homeStats, 'Fouls'),
          away: getStatValue(awayStats, 'Fouls')
        },
        yellowCards: {
          home: getStatValue(homeStats, 'Yellow Cards'),
          away: getStatValue(awayStats, 'Yellow Cards')
        },
        redCards: {
          home: getStatValue(homeStats, 'Red Cards'),
          away: getStatValue(awayStats, 'Red Cards')
        }
      }
    };
  } catch (error) {
    console.error('Error fetching match details:', error);
    return null;
  }
}

export async function fetchLiveMatches(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/fixtures?live=all`, {
      headers: {
        'x-rapidapi-key': API_KEY || '',
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch live matches');
    }

    const data = await response.json();
    
    if (!data.response || !Array.isArray(data.response)) {
      throw new Error('Invalid API response format');
    }
    
    // Transform API response to match our app's data structure
    const matches: Match[] = data.response.map((match: any) => ({
      id: match.fixture.id.toString(),
      homeTeam: match.teams.home.name,
      awayTeam: match.teams.away.name,
      homeScore: match.goals.home || 0,
      awayScore: match.goals.away || 0,
      status: getMatchStatus(match.fixture.status.short),
      time: match.fixture.status.elapsed ? `${match.fixture.status.elapsed}'` : undefined,
      league: match.league.name
    }));

    return { matches };
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return { matches: [], error: 'Failed to load live matches' };
  }
}

function getMatchStatus(apiStatus: string): 'live' | 'finished' | 'scheduled' {
  switch (apiStatus) {
    case '1H':
    case '2H':
    case 'HT':
      return 'live';
    case 'FT':
    case 'AET':
    case 'PEN':
      return 'finished';
    default:
      return 'scheduled';
  }
}

function getEventType(apiEventType: string): 'goal' | 'yellow_card' | 'red_card' | 'substitution' {
  // Convert to lowercase and trim for more robust matching
  const normalizedType = apiEventType.toLowerCase().trim();
  
  if (normalizedType.includes('goal')) {
    return 'goal';
  } else if (normalizedType.includes('yellow') || normalizedType === 'card') {
    return 'yellow_card';
  } else if (normalizedType.includes('red')) {
    return 'red_card';
  } else if (normalizedType.includes('sub')) {
    return 'substitution';
  } else {
    console.log('Unrecognized event type:', apiEventType);
    // Default to substitution as it's less misleading than defaulting to goal
    return 'substitution';
  }
}