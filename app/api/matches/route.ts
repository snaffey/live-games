import { NextResponse } from 'next/server';
import { fetchLiveMatches } from '@/app/services/api';

export const dynamic = 'force-static';

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

export async function OPTIONS(request: Request) {
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