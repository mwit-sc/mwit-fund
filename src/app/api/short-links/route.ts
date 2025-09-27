import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

// Helper function to generate short code
function generateShortCode(length = 6): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// GET - List short links (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ไม่ได้เข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    // Check user role
    let userRole = (session.user as any)?.role;
    if (!userRole && session.user.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
      });
      userRole = dbUser?.role;
    }
    
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์ในการเข้าถึง' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const shortLinks = await prisma.shortLink.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.shortLink.count();

    return NextResponse.json({
      shortLinks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    console.error('Error fetching short links:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  }
}

// POST - Create short link (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ไม่ได้เข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    // Check user role and get user ID
    let userRole = (session.user as any)?.role;
    let userId: number;
    
    if (!userRole && session.user.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true, id: true }
      });
      userRole = dbUser?.role;
      userId = dbUser?.id!;
    } else {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { id: true }
      });
      userId = dbUser?.id!;
    }
    
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์ในการสร้างลิงก์สั้น' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { target_url, title, short_code, expires_at } = body;

    if (!target_url) {
      return NextResponse.json(
        { error: 'กรุณาระบุ URL ปลายทาง' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(target_url);
    } catch {
      return NextResponse.json(
        { error: 'URL ไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // Generate or validate short code
    let finalShortCode = short_code;
    if (!finalShortCode) {
      // Generate unique short code
      let attempts = 0;
      do {
        finalShortCode = generateShortCode();
        attempts++;
        if (attempts > 100) {
          return NextResponse.json(
            { error: 'ไม่สามารถสร้างรหัสสั้นได้' },
            { status: 500 }
          );
        }
      } while (await prisma.shortLink.findUnique({ where: { short_code: finalShortCode } }));
    } else {
      // Check if custom short code already exists
      const existing = await prisma.shortLink.findUnique({
        where: { short_code: finalShortCode }
      });
      if (existing) {
        return NextResponse.json(
          { error: 'รหัสสั้นนี้ถูกใช้แล้ว' },
          { status: 400 }
        );
      }
    }

    const shortLink = await prisma.shortLink.create({
      data: {
        short_code: finalShortCode,
        target_url,
        title,
        expires_at: expires_at ? new Date(expires_at) : null,
        created_by: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(shortLink);

  } catch (error) {
    console.error('Error creating short link:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างลิงก์สั้น' },
      { status: 500 }
    );
  }
}