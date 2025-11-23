import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveMatches } from '@/app/services/api';
import { rateLimit } from '@/lib/rate-limit';

// Create a limiter that allows 10 requests per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max number of unique tokens per interval
  limit: 10, // Max number of requests per token per interval
});

export async function GET() {
  try {
    // Fetch matches data
    const { matches, error } = await fetchLiveMatches();
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch matches' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Error in matches API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}