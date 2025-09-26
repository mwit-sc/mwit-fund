import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const questions = await prisma.questions.findMany({
      where: {
        active: true
      },
      select: {
        id: true,
        question: true,
        answer: true,
        order: true
      },
      orderBy: [
        { order: 'asc' },
        { created_at: 'asc' }
      ]
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching public Questions:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำถาม' },
      { status: 500 }
    );
  }
}