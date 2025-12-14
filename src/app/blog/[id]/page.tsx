"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IBM_Plex_Sans_Thai } from 'next/font/google';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const ibmPlexSansThai = IBM_Plex_Sans_Thai({ 
  subsets: ['thai', 'latin'], 
  weight: ['100','200','300','400','500','600','700'], 
  display: 'swap' 
});

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author: {
    id: number;
    name: string;
    email: string;
  };
  images: Array<{
    id: number;
    image_url: string;
    alt_text: string | null;
    order: number;
  }>;
}

export default function BlogPostPage() {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const params = useParams();
  const idOrSlug = params.id as string;

  useEffect(() => {
    if (idOrSlug) {
      fetchPost();
    }
  }, [idOrSlug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/blog/' + idOrSlug);
      
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else if (response.status === 404) {
        setError('ไม่พบบทความที่ต้องการ');
      } else {
        setError('เกิดข้อผิดพลาดในการดึงข้อมูลบทความ');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลบทความ');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatContent = (content: string) => {
    // Process rich text formatting
    const processText = (text: string) => {
      // Handle bold **text**
      text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Handle italic *text*
      text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
      // Handle underline __text__
      text = text.replace(/__(.*?)__/g, '<u>$1</u>');
      // Handle tabs (convert to 4 spaces)
      text = text.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
      return text;
    };

    // Split content by line breaks and format
    return content.split('\n').map((paragraph, index) => {
      if (paragraph.trim() === '') {
        return <br key={index} />;
      }
      
      const formattedText = processText(paragraph);
      
      return (
        <p 
          key={index} 
          className="mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
      );
    });
  };

  const containerClass = "min-h-screen bg-linear-to-b from-[#204396] to-[#152a5f] text-white " + ibmPlexSansThai.className;

  if (loading) {
    return (
      <div className={containerClass}>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-xl">กำลังโหลดบทความ...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={containerClass}>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-6xl mb-8">😔</div>
            <h1 className="text-2xl font-bold mb-4">{error || 'ไม่พบบทความ'}</h1>
            <p className="text-white/70 mb-8">ขออภัย เราไม่สามารถแสดงบทความที่คุณต้องการได้</p>
            <Link
              href="/blog"
              className="inline-block px-6 py-3 bg-yellow-400 text-[#204396] font-bold rounded-lg hover:bg-yellow-300 transition duration-300"
            >
              กลับไปดูบทความอื่น
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {/* Navigation */}
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4 text-sm">
            <Link href="/" className="text-white/60 hover:text-white transition">
              หน้าหลัก
            </Link>
            <span className="text-white/40">/</span>
            <Link href="/blog" className="text-white/60 hover:text-white transition">
              บทความ
            </Link>
            <span className="text-white/40">/</span>
            <span className="text-white">{post.title}</span>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-between mb-6 text-white/70">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>โดย {post.author.name}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
                </span>
              </div>

              {post.images.length > 0 && (
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{post.images.length} รูปภาพ</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Link
                href="/blog"
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition duration-300 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>กลับไปดูบทความอื่น</span>
              </Link>
            </div>
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-6 mb-8">
              <p className="text-lg text-white/90 leading-relaxed">
                {post.excerpt}
              </p>
            </div>
          )}
        </motion.header>

        {/* Thumbnail */}
        {post.thumbnail_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <img
              src={post.thumbnail_url}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-xl shadow-2xl"
            />
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg prose-invert max-w-none mb-12"
        >
          <div className="text-white/90 text-lg leading-relaxed">
            {formatContent(post.content)}
          </div>
        </motion.div>

        {/* Images Gallery */}
        {post.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">รูปภาพประกอบ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {post.images
                .sort((a, b) => a.order - b.order)
                .map((image, index) => (
                  <div key={image.id} className="relative group cursor-pointer">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || ("รูปภาพที่ " + (index + 1))}
                      className="w-full h-64 object-cover rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                      onClick={() => setLightboxImage(image.image_url)}
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                    {image.alt_text && (
                      <div className="mt-2 text-sm text-white/60 text-center">
                        {image.alt_text}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border-t border-white/10 pt-8"
        >
          <div className="flex flex-wrap items-center justify-between">
            <div className="text-white/60 text-sm">
              <p>บทความนี้เผยแพร่โดย {post.author.name}</p>
              <p>
                สร้างเมื่อ: {formatDate(post.created_at)}
                {post.updated_at !== post.created_at && (
                  <span> • แก้ไขล่าสุด: {formatDate(post.updated_at)}</span>
                )}
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Link
                href="/blog"
                className="px-6 py-3 bg-yellow-400 text-[#204396] font-bold rounded-lg hover:bg-yellow-300 transition duration-300 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>ดูบทความอื่นๆ</span>
              </Link>
            </div>
          </div>
        </motion.footer>
      </article>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={lightboxImage}
              alt="Enlarged view"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}