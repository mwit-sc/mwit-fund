"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IBM_Plex_Sans_Thai } from 'next/font/google';
import Link from 'next/link';

const ibmPlexSansThai = IBM_Plex_Sans_Thai({ 
  subsets: ['thai', 'latin'], 
  weight: ['100','200','300','400','500','600','700'], 
  display: 'swap' 
});

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
  author: {
    id: number;
    name: string;
  };
  _count: {
    images: number;
  };
}

interface BlogResponse {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const fetchPosts = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/blog?page=' + page + '&limit=6');
      
      if (response.ok) {
        const data: BlogResponse = await response.json();
        setPosts(data.posts || []);
        setPagination(data.pagination || { page: 1, limit: 6, total: 0, pages: 0 });
      } else {
        setError('ไม่สามารถโหลดบทความได้');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('เกิดข้อผิดพลาดในการโหลดบทความ');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'ไม่ระบุวันที่';
    }
  };

  const truncateText = (text: string, length: number) => {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.pages) {
      setCurrentPage(page);
    }
  };

  const containerClass = "min-h-screen bg-gradient-to-b from-[#204396] to-[#152a5f] text-white " + ibmPlexSansThai.className;

  // Loading state
  if (loading) {
    return (
      <div className={containerClass}>
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-xl">กำลังโหลดบทความ...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={containerClass}>
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-6xl mb-8">😞</div>
            <h2 className="text-2xl font-bold mb-4">เกิดข้อผิดพลาด</h2>
            <p className="text-white/70 mb-8">{error}</p>
            <button
              onClick={() => fetchPosts(currentPage)}
              className="px-6 py-3 bg-yellow-400 text-[#204396] font-bold rounded-lg hover:bg-yellow-300 transition duration-300"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="py-16 px-4 bg-gradient-to-r from-[#204396] to-[#2a5ac9] text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-4">บทความและข่าวสาร</h1>
            <p className="text-xl max-w-2xl mx-auto text-white/90">
              ติดตามข่าวสารและกิจกรรมต่างๆ ของสมาคมนักเรียนเก่าโรงเรียนมหิดลวิทยานุสรณ์
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center space-x-4"
          >
            <Link
              href="/"
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition duration-300 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>กลับสู่หน้าหลัก</span>
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-8">📄</div>
            <h2 className="text-2xl font-bold mb-4">ยังไม่มีบทความ</h2>
            <p className="text-white/70">กรุณากลับมาดูอีกครั้งในภายหลัง</p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/15 transition-all duration-300 group"
                >
                  <Link href={"/blog/" + post.slug} className="block">
                    <div className="relative h-48 overflow-hidden">
                      {post.thumbnail_url ? (
                        <img
                          src={post.thumbnail_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={"w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center " + (post.thumbnail_url ? 'hidden' : 'flex')}
                      >
                        <div className="text-4xl">📰</div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-sm">
                        {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
                      </div>
                      
                      {post._count?.images > 0 && (
                        <div className="absolute top-4 right-4 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-sm flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{post._count.images}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                        {post.title}
                      </h2>
                      
                      {post.excerpt && (
                        <p className="text-white/70 mb-4 line-clamp-3">
                          {truncateText(post.excerpt, 120)}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-white/60">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{post.author?.name || 'ไม่ระบุผู้เขียน'}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-yellow-400 group-hover:translate-x-1 transition-transform">
                          <span className="text-sm font-medium">อ่านต่อ</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>

            {pagination.pages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center items-center space-x-2 flex-wrap"
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>ก่อนหน้า</span>
                </button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                    let pageNum = i + 1;
                    if (pagination.pages > 5) {
                      if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                    }
                    
                    const buttonClass = currentPage === pageNum
                      ? 'px-4 py-2 rounded-lg transition duration-300 bg-yellow-400 text-[#204396] font-bold'
                      : 'px-4 py-2 rounded-lg transition duration-300 bg-white/10 text-white hover:bg-white/20';
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={buttonClass}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>ถัดไป</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}