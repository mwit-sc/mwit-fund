import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { DatabaseAPI } from '../../../lib/api';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lastDonation = await DatabaseAPI.getLastDonationByEmail(session.user.email);
    return NextResponse.json(lastDonation);
  } catch (error) {
    console.error('Error fetching last donation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}