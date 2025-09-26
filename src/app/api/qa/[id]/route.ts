import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export async function PUT(
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

    const questionId = parseInt(params.id);
    
    if (isNaN(questionId)) {
      return NextResponse.json({ error: 'Invalid Question ID' }, { status: 400 });
    }

    const body = await request.json();
    const { question, answer, order, active } = body;

    const updatedQuestion = await prisma.questions.update({
      where: { id: questionId },
      data: {
        question,
        answer,
        order: order || 0,
        active: active !== undefined ? active : true,
      }
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating Question:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตคำถาม' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const questionId = parseInt(params.id);
    
    if (isNaN(questionId)) {
      return NextResponse.json({ error: 'Invalid Question ID' }, { status: 400 });
    }

    await prisma.questions.delete({
      where: { id: questionId }
    });

    return NextResponse.json({ message: 'ลบคำถามเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error deleting Question:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบคำถาม' },
      { status: 500 }
    );
  }
}