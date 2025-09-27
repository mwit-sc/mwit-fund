import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

// GET - Get single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    let userRole = (session?.user as any)?.role;
    
    if (!userRole && session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
      });
      userRole = dbUser?.role;
    }

    const where: any = {};
    
    // Check if accessing by ID or slug
    if (isNaN(parseInt(id))) {
      where.slug = id;
    } else {
      where.id = parseInt(id);
    }

    // If not admin, only show published posts
    if (userRole !== 'admin') {
      where.status = 'published';
      where.published_at = { lte: new Date() };
    }

    const blogPost = await prisma.blogPost.findFirst({
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
        }
      }
    });

    if (!blogPost) {
      return NextResponse.json(
        { error: 'ไม่พบบทความ' },
        { status: 404 }
      );
    }

    return NextResponse.json(blogPost);

  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลบทความ' },
      { status: 500 }
    );
  }
}

// PUT - Update blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        select: { role: true }
      });
      userRole = dbUser?.role;
    }
    
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์ในการแก้ไขบทความ' },
        { status: 403 }
      );
    }

    const blogId = parseInt(id);
    const body = await request.json();
    const { title, content, excerpt, thumbnail_url, status, images } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'กรุณากรอกหัวข้อและเนื้อหา' },
        { status: 400 }
      );
    }

    // Check if blog post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: blogId }
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'ไม่พบบทความ' },
        { status: 404 }
      );
    }

    // Generate new slug if title changed
    let finalSlug = existingPost.slug;
    if (title !== existingPost.title) {
      const newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\u0E00-\u0E7F\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      let counter = 1;
      finalSlug = newSlug;
      while (await prisma.blogPost.findFirst({ 
        where: { slug: finalSlug, id: { not: blogId } } 
      })) {
        finalSlug = `${newSlug}-${counter}`;
        counter++;
      }
    }

    const publishedAt = status === 'published' && existingPost.status !== 'published' 
      ? new Date() 
      : existingPost.published_at;

    // Update blog post with transaction
    const blogPost = await prisma.$transaction(async (tx) => {
      // Delete existing images
      await tx.blogImage.deleteMany({
        where: { blog_post_id: blogId }
      });

      // Update blog post
      return await tx.blogPost.update({
        where: { id: blogId },
        data: {
          title,
          slug: finalSlug,
          content,
          excerpt,
          thumbnail_url,
          status: status || existingPost.status,
          published_at: publishedAt,
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
    });

    return NextResponse.json(blogPost);

  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการแก้ไขบทความ' },
      { status: 500 }
    );
  }
}

// DELETE - Delete blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        select: { role: true }
      });
      userRole = dbUser?.role;
    }
    
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์ในการลบบทความ' },
        { status: 403 }
      );
    }

    const blogId = parseInt(id);

    const existingPost = await prisma.blogPost.findUnique({
      where: { id: blogId }
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'ไม่พบบทความ' },
        { status: 404 }
      );
    }

    await prisma.blogPost.delete({
      where: { id: blogId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบบทความ' },
      { status: 500 }
    );
  }
}