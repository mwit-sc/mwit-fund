import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const messageId = parseInt(params.id);
    
    if (isNaN(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 });
    }

    const body = await request.json();
    const { admin_note } = body;

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { admin_note }
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Error updating message note:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตโน้ต' },
      { status: 500 }
    );
  }
}