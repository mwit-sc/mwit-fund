import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

// Initialize R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ไม่ได้เข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    // Check user role from database if not in session
    let userRole = (session.user as any)?.role;
    if (!userRole && session.user.email) {
      const { prisma } = await import('@/app/lib/prisma');
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
      });
      userRole = dbUser?.role;
    }
    
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์ในการอัปโหลดไฟล์' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const blogId = formData.get('blogId') as string;
    const uploadType = formData.get('uploadType') as string; // 'thumbnail' or 'detail'
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'ไม่พบไฟล์ที่จะอัปโหลด' },
        { status: 400 }
      );
    }

    // Generate blog folder name and datetime
    const datetime = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5); // Format: YYYY-MM-DDTHH-mm-ss
    const blogFolder = blogId ? `blog/${blogId}` : `blog/temp-${datetime}`;

    const uploadedFiles = [];
    let detailCounter = 1;

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        continue; // Skip non-image files
      }

      const extension = file.name.split('.').pop();
      let fileName: string;

      // Generate filename based on upload type
      if (uploadType === 'thumbnail') {
        fileName = `${blogFolder}/thumbnail-${datetime}.${extension}`;
      } else {
        fileName = `${blogFolder}/detail-${datetime}-${detailCounter.toString().padStart(2, '0')}.${extension}`;
        detailCounter++;
      }

      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      try {
        // Upload to Cloudflare R2
        const uploadCommand = new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: file.type,
          ContentLength: buffer.length,
        });

        await r2Client.send(uploadCommand);

        // Generate public URL
        const fileUrl = `${R2_PUBLIC_URL}/${fileName}`;
        
        uploadedFiles.push({
          originalName: file.name,
          fileName: fileName,
          url: fileUrl,
          size: file.size,
          type: file.type,
          uploadType: uploadType,
        });
        
        console.log(`Successfully uploaded to R2: ${file.name} -> ${fileUrl}`);
        
      } catch (error) {
        console.error(`Failed to upload ${file.name} to R2:`, error);
        // Don't add failed uploads to the response
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: 'ไม่สามารถอัปโหลดไฟล์ใดๆ ได้ กรุณาลองใหม่อีกครั้ง' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `อัปโหลดไฟล์ไปยัง Cloudflare R2 สำเร็จ ${uploadedFiles.length} ไฟล์`
    });

  } catch (error) {
    console.error('Error uploading files to R2:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์ไปยัง Cloudflare R2' },
      { status: 500 }
    );
  }
}