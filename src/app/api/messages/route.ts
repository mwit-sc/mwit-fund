import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' },
        { status: 400 }
      );
    }

    const newMessage = await prisma.message.create({
      data: {
        name,
        email,
        message,
      },
    });

    return NextResponse.json({ 
      message: 'ส่งข้อความเรียบร้อยแล้ว', 
      id: newMessage.id 
    });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการส่งข้อความ' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    const messages = await prisma.message.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลข้อความ' },
      { status: 500 }
    );
  }
}