import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const alumni = await prisma.alumni.findUnique({
      where: { user_email: session.user.email }
    });

    if (!alumni) {
      return NextResponse.json(
        { error: 'Alumni profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(alumni);
  } catch (error) {
    console.error('Error fetching alumni profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alumni profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    const alumni = await prisma.alumni.findUnique({
      where: { user_email: session.user.email }
    });

    if (!alumni) {
      return NextResponse.json(
        { error: 'Alumni profile not found' },
        { status: 404 }
      );
    }

    const updatedAlumni = await prisma.alumni.update({
      where: { user_email: session.user.email },
      data: {
        first_name: data.firstName || alumni.first_name,
        last_name: data.lastName || alumni.last_name,
        generation: data.generation || alumni.generation,
        graduation_year: data.graduationYear || alumni.graduation_year,
        current_job: data.currentJob || alumni.current_job,
        company: data.company || alumni.company,
        contact_email: data.contactEmail || alumni.contact_email,
        phone: data.phone || alumni.phone,
        line_id: data.lineId || alumni.line_id,
        facebook: data.facebook || alumni.facebook,
        linkedin: data.linkedin || alumni.linkedin,
        address: data.address || alumni.address,
        skills: data.skills || alumni.skills,
        interests: data.interests || alumni.interests,
        achievements: data.achievements || alumni.achievements,
        profile_image_url: data.profileImageUrl || alumni.profile_image_url,
        updated_at: new Date()
      }
    });

    return NextResponse.json(updatedAlumni);
  } catch (error) {
    console.error('Error updating alumni profile:', error);
    return NextResponse.json(
      { error: 'Failed to update alumni profile' },
      { status: 500 }
    );
  }
}