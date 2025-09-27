"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  status: 'draft' | 'published' | 'archived';
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
  _count: {
    images: number;
  };
}

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' ? '/api/blog' : `/api/blog?status=${filter}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      } else {
        toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลบทความ');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลบทความ');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`คุณต้องการลบบทความ "${title}" หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้`)) {
      return;
    }

    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== id));
        toast.success('ลบบทความเรียบร้อยแล้ว');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'เกิดข้อผิดพลาดในการลบบทความ');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('เกิดข้อผิดพลาดในการลบบทความ');
    }
  };

  const handleStatusChange = async (id: number, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      const post = posts.find(p => p.id === id);
      if (!post) return;

      const response = await fetch(`/api/blog/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: post.title,
          content: post.excerpt || '', // This is simplified, in real app you'd fetch full content
          excerpt: post.excerpt,
          thumbnail_url: post.thumbnail_url,
          status: newStatus,
          images: post.images,
        }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map(p => p.id === id ? updatedPost : p));
        toast.success('อัปเดตสถานะบทความเรียบร้อยแล้ว');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'เผยแพร่แล้ว';
      case 'draft': return 'แบบร่าง';
      case 'archived': return 'เก็บถาวร';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-600 text-white';
      case 'draft': return 'bg-yellow-600 text-white';
      case 'archived': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">จัดการบทความ</h2>
          <p className="text-white/70">สร้าง แก้ไข และจัดการบทความทั้งหมด</p>
        </div>
        <Link
          href="/dashboard/blog/create"
          className="px-6 py-3 bg-yellow-400 text-[#204396] font-bold rounded-lg hover:bg-yellow-300 transition duration-300 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>สร้างบทความใหม่</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex space-x-4">
          {[
            { key: 'all', label: 'ทั้งหมด', count: posts.length },
            { key: 'published', label: 'เผยแพร่แล้ว', count: posts.filter(p => p.status === 'published').length },
            { key: 'draft', label: 'แบบร่าง', count: posts.filter(p => p.status === 'draft').length },
            { key: 'archived', label: 'เก็บถาวร', count: posts.filter(p => p.status === 'archived').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                filter === tab.key
                  ? 'bg-yellow-400 text-[#204396]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">📝</div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-400">
                {posts.length}
              </div>
              <div className="text-sm text-white/60">บทความทั้งหมด</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">🌟</div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                {posts.filter(p => p.status === 'published').length}
              </div>
              <div className="text-sm text-white/60">เผยแพร่แล้ว</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">✏️</div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">
                {posts.filter(p => p.status === 'draft').length}
              </div>
              <div className="text-sm text-white/60">แบบร่าง</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">🖼️</div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-400">
                {posts.reduce((sum, p) => sum + p._count.images, 0)}
              </div>
              <div className="text-sm text-white/60">รูปภาพทั้งหมด</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Blog Posts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
      >
        <h3 className="text-xl font-bold mb-6">รายการบทความ</h3>
        
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold mb-2">ยังไม่มีบทความ</h3>
            <p className="text-white/70 mb-6">เริ่มต้นสร้างบทความแรกของคุณกันเลย</p>
            <Link
              href="/dashboard/blog/create"
              className="inline-block px-6 py-3 bg-yellow-400 text-[#204396] font-bold rounded-lg hover:bg-yellow-300 transition duration-300"
            >
              สร้างบทความใหม่
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4">บทความ</th>
                  <th className="text-left py-3 px-4">สถานะ</th>
                  <th className="text-left py-3 px-4">ผู้เขียน</th>
                  <th className="text-left py-3 px-4">วันที่สร้าง</th>
                  <th className="text-left py-3 px-4">รูปภาพ</th>
                  <th className="text-right py-3 px-4">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr 
                    key={post.id} 
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        {post.thumbnail_url && (
                          <img 
                            src={post.thumbnail_url} 
                            alt={post.title}
                            className="w-16 h-16 object-cover rounded-lg mr-4"
                          />
                        )}
                        <div>
                          <div className="font-medium text-white line-clamp-2">
                            {post.title}
                          </div>
                          {post.excerpt && (
                            <div className="text-sm text-white/60 mt-1 line-clamp-1">
                              {post.excerpt}
                            </div>
                          )}
                          <div className="text-xs text-white/40 mt-1">
                            /{post.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={post.status}
                        onChange={(e) => handleStatusChange(post.id, e.target.value as any)}
                        className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      >
                        <option value="draft">แบบร่าง</option>
                        <option value="published">เผยแพร่</option>
                        <option value="archived">เก็บถาวร</option>
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-white/80">{post.author.name}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-white/60 text-sm">
                        {formatDate(post.created_at)}
                      </span>
                      {post.published_at && (
                        <div className="text-xs text-green-400">
                          เผยแพร่: {formatDate(post.published_at)}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-white/60 text-sm">
                        {post._count.images} รูป
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                          title="ดูบทความ"
                        >
                          ดู
                        </Link>
                        <Link
                          href={`/dashboard/blog/edit/${post.id}`}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                          title="แก้ไข"
                        >
                          แก้ไข
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                          title="ลบ"
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}