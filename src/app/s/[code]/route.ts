import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Find the short link
    const shortLink = await prisma.shortLink.findUnique({
      where: { 
        short_code: code,
        active: true,
      }
    });

    if (!shortLink) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Check if expired
    if (shortLink.expires_at && shortLink.expires_at < new Date()) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Increment click count
    await prisma.shortLink.update({
      where: { id: shortLink.id },
      data: { clicks: { increment: 1 } }
    });

    // Redirect to target URL
    return NextResponse.redirect(shortLink.target_url);

  } catch (error) {
    console.error('Error handling short link redirect:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}