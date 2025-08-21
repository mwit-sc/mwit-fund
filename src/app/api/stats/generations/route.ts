import { NextResponse } from 'next/server';
import { DatabaseAPI } from '../../../lib/api';

export async function GET() {
  try {
    const generationStats = await DatabaseAPI.getDonationsByGeneration();
    return NextResponse.json(generationStats);
  } catch (error) {
    console.error('Error fetching generation stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch generation statistics' },
      { status: 500 }
    );
  }
}