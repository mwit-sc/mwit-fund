import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

// GET - List blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    
    // If not admin, only show published posts
    const session = await getServerSession(authOptions);
    let userRole = (session?.user as any)?.role;
    
    if (!userRole && session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
      });
      userRole = dbUser?.role;
    }

    if (userRole !== 'admin') {
      where.status = 'published';
      where.published_at = { lte: new Date() };
    } else if (status) {
      where.status = status;
    }

    const posts = await prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        images: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { images: true }
        }
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.blogPost.count({ where });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลบทความ' },
      { status: 500 }
    );
  }
}

// POST - Create blog post
export async function POST(request: NextRequest) {
  try {
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
        select: { role: true, id: true }
      });
      userRole = dbUser?.role;
    }
    
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์ในการสร้างบทความ' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, excerpt, thumbnail_url, status, images } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'กรุณากรอกหัวข้อและเนื้อหา' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u0E00-\u0E7F\s-]/g, '') // Keep Thai characters
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if slug already exists
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.blogPost.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    // Get author ID
    const author = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true }
    });

    if (!author) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลผู้เขียน' },
        { status: 400 }
      );
    }

    const publishedAt = status === 'published' ? new Date() : null;

    const blogPost = await prisma.blogPost.create({
      data: {
        title,
        slug: finalSlug,
        content,
        excerpt,
        thumbnail_url,
        status: status || 'draft',
        published_at: publishedAt,
        author_id: author.id,
        images: {
          create: images?.map((img: any, index: number) => ({
            image_url: img.url,
            alt_text: img.alt_text || '',
            order: index,
          })) || []
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        images: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return NextResponse.json(blogPost);

  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างบทความ' },
      { status: 500 }
    );
  }
}