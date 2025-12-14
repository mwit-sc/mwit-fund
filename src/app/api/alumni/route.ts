import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const alumni = await prisma.alumni.findMany({
      orderBy: [
        { generation: 'asc' },
        { first_name: 'asc' }
      ]
    });

    return NextResponse.json(alumni);
  } catch (error) {
    console.error('Error fetching alumni:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alumni' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.generation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if alumni with this email already exists
    const existingAlumni = await prisma.alumni.findUnique({
      where: { contact_email: data.contactEmail || session.user.email }
    });

    if (existingAlumni) {
      return NextResponse.json(
        { error: 'Alumni profile already exists for this email' },
        { status: 409 }
      );
    }

    const alumni = await prisma.alumni.create({
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        generation: data.generation,
        graduation_year: data.graduationYear || '',
        current_job: data.currentJob || '',
        company: data.company || '',
        contact_email: data.contactEmail || session.user.email,
        phone: data.phone || '',
        line_id: data.lineId || '',
        facebook: data.facebook || '',
        linkedin: data.linkedin || '',
        address: data.address || '',
        skills: data.skills || '',
        interests: data.interests || '',
        achievements: data.achievements || '',
        profile_image_url: data.profileImageUrl || '',
        user_email: session.user.email
      }
    });

    return NextResponse.json(alumni, { status: 201 });
  } catch (error) {
    console.error('Error creating alumni profile:', error);
    return NextResponse.json(
      { error: 'Failed to create alumni profile' },
      { status: 500 }
    );
  }
}