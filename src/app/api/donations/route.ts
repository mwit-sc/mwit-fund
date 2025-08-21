import { NextRequest, NextResponse } from 'next/server';
import { DatabaseAPI } from '../../lib/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { donationData, slipImageUrl } = body;
    
    const result = await DatabaseAPI.insertDonation(donationData, slipImageUrl);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error inserting donation:', error);
    return NextResponse.json(
      { error: 'Failed to submit donation' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const donations = await DatabaseAPI.getAllDonations();
    return NextResponse.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}