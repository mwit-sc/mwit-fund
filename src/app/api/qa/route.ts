import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export async function GET() {
  try {
    const questions = await prisma.questions.findMany({
      orderBy: [
        { order: 'asc' },
        { created_at: 'asc' }
      ]
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching Questions:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำถาม' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { question, answer, order, active } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'กรุณากรอกคำถามและคำตอบ' },
        { status: 400 }
      );
    }

    const newQuestion = await prisma.questions.create({
      data: {
        question,
        answer,
        order: order || 0,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json(newQuestion);
  } catch (error) {
    console.error('Error creating Question:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างคำถาม' },
      { status: 500 }
    );
  }
}