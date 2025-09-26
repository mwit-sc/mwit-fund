import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์ในการเข้าถึง' },
        { status: 403 }
      );
    }

    const { role } = await request.json();
    const userId = parseInt(params.id);

    if (!role || !['user', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'ข้อมูลบทบาทไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // Prevent admin from changing their own role
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (targetUser?.email === session.user.email) {
      return NextResponse.json(
        { error: 'ไม่สามารถเปลี่ยนบทบาทของตนเองได้' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        role: role,
        updated_at: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        image_url: true,
        role: true,
        created_at: true,
        updated_at: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตบทบาทผู้ใช้' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์ในการเข้าถึง' },
        { status: 403 }
      );
    }

    const userId = parseInt(params.id);

    // Prevent admin from deleting their own account
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (targetUser?.email === session.user.email) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบบัญชีของตนเองได้' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบผู้ใช้' },
      { status: 500 }
    );
  }
}