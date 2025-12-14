"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface ShortLink {
  id: number;
  short_code: string;
  target_url: string;
  title: string | null;
  clicks: number;
  active: boolean;
  created_at: string;
  expires_at: string | null;
  creator: {
    id: number;
    name: string;
    email: string;
  };
}

interface ShortLinksResponse {
  shortLinks: ShortLink[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function ShortLinksPage() {
  const [shortLinks, setShortLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Form state
  const [formData, setFormData] = useState({
    target_url: '',
    title: '',
    short_code: '',
    expires_at: '',
  });

  useEffect(() => {
    fetchShortLinks();
  }, [pagination.page]);

  const fetchShortLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/short-links?page=' + pagination.page + '&limit=' + pagination.limit);
      
      if (response.ok) {
        const data: ShortLinksResponse = await response.json();
        setShortLinks(data.shortLinks);
        setPagination(data.pagination);
      } else {
        toast.error('ไม่สามารถโหลดข้อมูลได้');
      }
    } catch (error) {
      console.error('Error fetching short links:', error);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShortLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.target_url.trim()) {
      toast.error('กรุณาระบุ URL ปลายทาง');
      return;
    }

    setCreating(true);
    
    try {
      const response = await fetch('/api/short-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_url: formData.target_url.trim(),
          title: formData.title.trim() || null,
          short_code: formData.short_code.trim() || null,
          expires_at: formData.expires_at || null,
        }),
      });

      if (response.ok) {
        toast.success('สร้างลิงก์สั้นเรียบร้อยแล้ว');
        setFormData({ target_url: '', title: '', short_code: '', expires_at: '' });
        setShowCreateForm(false);
        fetchShortLinks();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error creating short link:', error);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (id: number, currentActive: boolean) => {
    try {
      const response = await fetch('/api/short-links/' + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (response.ok) {
        toast.success(currentActive ? 'ปิดการใช้งานแล้ว' : 'เปิดการใช้งานแล้ว');
        fetchShortLinks();
      } else {
        toast.error('เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error toggling active:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const deleteShortLink = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบลิงก์สั้นนี้?')) return;

    try {
      const response = await fetch('/api/short-links/' + id, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('ลบลิงก์สั้นเรียบร้อยแล้ว');
        fetchShortLinks();
      } else {
        toast.error('เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error deleting short link:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const copyShortLink = (code: string) => {
    const shortUrl = window.location.origin + '/s/' + code;
    navigator.clipboard.writeText(shortUrl);
    toast.success('คัดลอกลิงก์แล้ว');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">จัดการลิงก์สั้น</h2>
          <p className="text-white/70">สร้างและจัดการลิงก์สั้นสำหรับแชร์</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-yellow-400 text-[#204396] font-bold rounded-lg hover:bg-yellow-300 transition duration-300 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>สร้างลิงก์สั้น</span>
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xs rounded-xl p-6 mb-8"
        >
          <h3 className="text-xl font-bold mb-6">สร้างลิงก์สั้นใหม่</h3>
          <form onSubmit={handleCreateShortLink} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  URL ปลายทาง *
                </label>
                <input
                  type="url"
                  value={formData.target_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-hidden focus:ring-2 focus:ring-yellow-400"
                  placeholder="https://example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  ชื่อเรื่อง
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-hidden focus:ring-2 focus:ring-yellow-400"
                  placeholder="ชื่อเรื่องของลิงก์"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  รหัสสั้น (ไม่ระบุจะสุ่มให้อัตโนมัติ)
                </label>
                <input
                  type="text"
                  value={formData.short_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, short_code: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-hidden focus:ring-2 focus:ring-yellow-400"
                  placeholder="abc123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  วันหมดอายุ
                </label>
                <input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-hidden focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition duration-300"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-3 bg-yellow-400 text-[#204396] font-bold rounded-lg hover:bg-yellow-300 transition duration-300 disabled:opacity-50"
              >
                {creating ? 'กำลังสร้าง...' : 'สร้างลิงก์'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Short Links List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl">กำลังโหลด...</p>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-xs rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/70">ลิงก์สั้น</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/70">ปลายทาง</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/70">คลิก</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/70">สถานะ</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/70">สร้างเมื่อ</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/70">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {shortLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-yellow-400">
                          /s/{link.short_code}
                        </div>
                        {link.title && (
                          <div className="text-sm text-white/60">{link.title}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white/80 truncate max-w-xs">
                        {link.target_url}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">{link.clicks}</td>
                    <td className="px-6 py-4">
                      <span className={"px-2 py-1 rounded-full text-xs font-medium " + (link.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
                        {link.active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/60">
                      {formatDate(link.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyShortLink(link.short_code)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition"
                          title="คัดลอกลิงก์"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => toggleActive(link.id, link.active)}
                          className={"p-2 hover:bg-opacity-20 rounded-lg transition " + (link.active ? 'text-red-400 hover:bg-red-500/20' : 'text-green-400 hover:bg-green-500/20')}
                          title={link.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {link.active ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            )}
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteShortLink(link.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                          title="ลบ"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {shortLinks.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔗</div>
              <h3 className="text-xl font-bold mb-2">ยังไม่มีลิงก์สั้น</h3>
              <p className="text-white/70">เริ่มสร้างลิงก์สั้นแรกของคุณ</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}