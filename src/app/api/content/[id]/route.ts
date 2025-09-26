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

    const contentId = parseInt(params.id);
    
    if (isNaN(contentId)) {
      return NextResponse.json({ error: 'Invalid content ID' }, { status: 400 });
    }

    const body = await request.json();
    const { section, title, content, image_url, order, active } = body;

    const updatedContent = await prisma.landingPageContent.update({
      where: { id: contentId },
      data: {
        section,
        title,
        content,
        image_url,
        order: order || 0,
        active: active !== undefined ? active : true,
        updated_by: session.user.email,
      }
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตเนื้อหา' },
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

    const contentId = parseInt(params.id);
    
    if (isNaN(contentId)) {
      return NextResponse.json({ error: 'Invalid content ID' }, { status: 400 });
    }

    await prisma.landingPageContent.delete({
      where: { id: contentId }
    });

    return NextResponse.json({ message: 'ลบเนื้อหาเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบเนื้อหา' },
      { status: 500 }
    );
  }
}