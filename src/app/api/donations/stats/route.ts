import { NextResponse } from 'next/server';
import { DatabaseAPI } from '../../../lib/api';

export async function GET() {
  try {
    const stats = await DatabaseAPI.getDonationStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donation stats' },
      { status: 500 }
    );
  }
}