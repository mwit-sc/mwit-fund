import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/app/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Debug logging
    console.log('Session in /api/users:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      userRole: (session?.user as any)?.role,
      fullUser: session?.user
    });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ไม่ได้เข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    // Check user role from database if not in session
    let userRole = (session.user as any)?.role;
    if (!userRole && session.user.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
      });
      userRole = dbUser?.role;
      console.log('Role from database:', userRole);
    }
    
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์ในการเข้าถึง' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image_url: true,
        role: true,
        created_at: true,
        updated_at: true
      },
      orderBy: [
        { role: 'desc' },
        { created_at: 'desc' }
      ]
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' },
      { status: 500 }
    );
  }
}