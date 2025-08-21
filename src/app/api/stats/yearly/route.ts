import { NextResponse } from 'next/server';
import { DatabaseAPI } from '../../../lib/api';

export async function GET() {
  try {
    const yearlyStats = await DatabaseAPI.getYearlyStats();
    return NextResponse.json(yearlyStats);
  } catch (error) {
    console.error('Error fetching yearly stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch yearly statistics' },
      { status: 500 }
    );
  }
}