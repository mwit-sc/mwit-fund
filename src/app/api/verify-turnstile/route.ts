import { NextRequest, NextResponse } from 'next/server';

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบ CAPTCHA token' },
        { status: 400 }
      );
    }

    if (!TURNSTILE_SECRET_KEY) {
      console.error('Turnstile secret key not configured');
      return NextResponse.json(
        { success: false, error: 'CAPTCHA ไม่ได้ถูกกำหนดค่า' },
        { status: 500 }
      );
    }

    // Verify the token with Cloudflare Turnstile
    const formData = new FormData();
    formData.append('secret', TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    
    // Get the real IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || '127.0.0.1';
    formData.append('remoteip', ip);

    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const verifyResult = await verifyResponse.json();

    if (verifyResult.success) {
      return NextResponse.json({ success: true });
    } else {
      console.error('Turnstile verification failed:', verifyResult);
      return NextResponse.json(
        { success: false, error: 'การยืนยัน CAPTCHA ล้มเหลว กรุณาลองใหม่อีกครั้ง', details: verifyResult['error-codes'] },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error verifying Turnstile:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการยืนยัน CAPTCHA' },
      { status: 500 }
    );
  }
}