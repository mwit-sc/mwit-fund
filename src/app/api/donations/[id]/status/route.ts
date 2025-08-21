import { NextRequest, NextResponse } from 'next/server';
import { DatabaseAPI } from '../../../../lib/api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const resolvedParams = await params;
    const donationId = parseInt(resolvedParams.id);

    if (isNaN(donationId)) {
      return NextResponse.json(
        { error: 'Invalid donation ID' },
        { status: 400 }
      );
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const result = await DatabaseAPI.updateDonationStatus(donationId, status);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating donation status:', error);
    return NextResponse.json(
      { error: 'Failed to update donation status' },
      { status: 500 }
    );
  }
}