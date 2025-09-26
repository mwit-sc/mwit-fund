import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export async function GET() {
  try {
    const content = await prisma.landingPageContent.findMany({
      orderBy: [
        { section: 'asc' },
        { order: 'asc' }
      ]
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลเนื้อหา' },
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
    const { section, title, content, image_url, order, active } = body;

    if (!section) {
      return NextResponse.json(
        { error: 'กรุณาระบุส่วนของเนื้อหา' },
        { status: 400 }
      );
    }

    const newContent = await prisma.landingPageContent.create({
      data: {
        section,
        title,
        content,
        image_url,
        order: order || 0,
        active: active !== undefined ? active : true,
        updated_by: session.user.email,
      },
    });

    return NextResponse.json(newContent);
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างเนื้อหา' },
      { status: 500 }
    );
  }
}