import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const content = await prisma.landingPageContent.findMany({
      where: {
        active: true
      },
      select: {
        id: true,
        section: true,
        title: true,
        content: true,
        image_url: true,
        order: true
      },
      orderBy: [
        { section: 'asc' },
        { order: 'asc' }
      ]
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching public content:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลเนื้อหา' },
      { status: 500 }
    );
  }
}