import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

// GET - Get single short link
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const shortLink = await prisma.shortLink.findUnique({
      where: { id: parseInt(id) },
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

    if (!shortLink) {
      return NextResponse.json(
        { error: 'ไม่พบลิงก์สั้น' },
        { status: 404 }
      );
    }

    return NextResponse.json(shortLink);

  } catch (error) {
    console.error('Error fetching short link:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  }
}

// PUT - Update short link
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        { error: 'ไม่มีสิทธิ์ในการแก้ไข' },
        { status: 403 }
      );
    }

    const shortLinkId = parseInt(id);
    const body = await request.json();
    const { target_url, title, short_code, active, expires_at } = body;

    // Check if short link exists
    const existingLink = await prisma.shortLink.findUnique({
      where: { id: shortLinkId }
    });

    if (!existingLink) {
      return NextResponse.json(
        { error: 'ไม่พบลิงก์สั้น' },
        { status: 404 }
      );
    }

    // Validate URL if provided
    if (target_url) {
      try {
        new URL(target_url);
      } catch {
        return NextResponse.json(
          { error: 'URL ไม่ถูกต้อง' },
          { status: 400 }
        );
      }
    }

    // Check short code uniqueness if changed
    if (short_code && short_code !== existingLink.short_code) {
      const codeExists = await prisma.shortLink.findUnique({
        where: { short_code }
      });
      if (codeExists) {
        return NextResponse.json(
          { error: 'รหัสสั้นนี้ถูกใช้แล้ว' },
          { status: 400 }
        );
      }
    }

    const updatedLink = await prisma.shortLink.update({
      where: { id: shortLinkId },
      data: {
        ...(target_url && { target_url }),
        ...(title !== undefined && { title }),
        ...(short_code && { short_code }),
        ...(active !== undefined && { active }),
        ...(expires_at !== undefined && { expires_at: expires_at ? new Date(expires_at) : null }),
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

    return NextResponse.json(updatedLink);

  } catch (error) {
    console.error('Error updating short link:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการแก้ไข' },
      { status: 500 }
    );
  }
}

// DELETE - Delete short link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        { error: 'ไม่มีสิทธิ์ในการลบ' },
        { status: 403 }
      );
    }

    const shortLinkId = parseInt(id);

    const existingLink = await prisma.shortLink.findUnique({
      where: { id: shortLinkId }
    });

    if (!existingLink) {
      return NextResponse.json(
        { error: 'ไม่พบลิงก์สั้น' },
        { status: 404 }
      );
    }

    await prisma.shortLink.delete({
      where: { id: shortLinkId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting short link:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบ' },
      { status: 500 }
    );
  }
}