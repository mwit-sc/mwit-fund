"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface ContentItem {
  id: number;
  section: string;
  title?: string;
  content?: string;
  image_url?: string;
  order: number;
  active: boolean;
  updated_at: string;
  updated_by?: string;
}

interface ContentForm {
  section: string;
  title: string;
  content: string;
  image_url: string;
  order: string;
  active: boolean;
}

const SECTION_OPTIONS = [
  { value: 'hero', label: 'Hero Section (หัวเรื่องหลัก)' },
  { value: 'about', label: 'About Section (เกี่ยวกับเรา)' },
  { value: 'achievements', label: 'Achievements (ผลงาน)' },
  { value: 'donation_cta', label: 'Donation CTA (เรียกร้องบริจาค)' },
  { value: 'contact', label: 'Contact (ติดต่อเรา)' },
  { value: 'footer', label: 'Footer (ส่วนท้าย)' },
];

export default function ContentPage() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<ContentForm>({
    section: 'hero',
    title: '',
    content: '',
    image_url: '',
    order: '0',
    active: true,
  });

  useEffect(() => {
    fetchContents();
  }, []);


  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/content');
      if (response.ok) {
        const data = await response.json();
        setContents(data);
      }
    } catch (error) {
      console.error('Error fetching contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingContent ? `/api/content/${editingContent.id}` : '/api/content';
      const method = editingContent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          order: parseInt(form.order),
        }),
      });

      if (response.ok) {
        toast.success(editingContent ? 'อัปเดตเนื้อหาเรียบร้อยแล้ว' : 'เพิ่มเนื้อหาเรียบร้อยแล้ว');
        setForm({
          section: 'hero',
          title: '',
          content: '',
          image_url: '',
          order: '0',
          active: true,
        });
        setEditingContent(null);
        setShowForm(false);
        fetchContents();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (error) {
      console.error('Error submitting content:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (content: ContentItem) => {
    setEditingContent(content);
    setForm({
      section: content.section,
      title: content.title || '',
      content: content.content || '',
      image_url: content.image_url || '',
      order: content.order.toString(),
      active: content.active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณต้องการลบเนื้อหานี้หรือไม่?')) return;

    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('ลบเนื้อหาเรียบร้อยแล้ว');
        fetchContents();
      } else {
        toast.error('เกิดข้อผิดพลาดในการลบ');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const cancelEdit = () => {
    setEditingContent(null);
    setForm({
      section: 'hero',
      title: '',
      content: '',
      image_url: '',
      order: '0',
      active: true,
    });
    setShowForm(false);
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
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">จัดการเนื้อหาหน้าแรก</h2>
        <p className="text-white/70">แก้ไขเนื้อหาที่แสดงในหน้าแรกของเว็บไซต์</p>
      </div>


      {/* Add Content Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-yellow-400 text-[#204396] font-bold rounded-lg hover:bg-yellow-300 transition duration-300"
        >
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>{editingContent ? 'แก้ไขเนื้อหา' : 'เพิ่มเนื้อหาใหม่'}</span>
          </div>
        </button>
      </motion.div>

      {/* Content Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white/10 backdrop-blur-xs rounded-xl p-6 mb-8"
        >
          <h3 className="text-xl font-bold mb-6">
            {editingContent ? 'แก้ไขเนื้อหา' : 'เพิ่มเนื้อหาใหม่'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-medium">ส่วนของเนื้อหา *</label>
                <select
                  name="section"
                  value={form.section}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-hidden focus:ring-2 focus:ring-yellow-400 text-white"
                  required
                >
                  {SECTION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value} className="text-black">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">ลำดับการแสดง</label>
                <input
                  type="number"
                  name="order"
                  value={form.order}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-hidden focus:ring-2 focus:ring-yellow-400 text-white"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium">หัวข้อ</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-hidden focus:ring-2 focus:ring-yellow-400 text-white"
                placeholder="หัวข้อของเนื้อหา"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">เนื้อหา</label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleInputChange}
                rows={5}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-hidden focus:ring-2 focus:ring-yellow-400 text-white"
                placeholder="เนื้อหาที่จะแสดง"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">URL รูปภาพ</label>
              <input
                type="url"
                name="image_url"
                value={form.image_url}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-hidden focus:ring-2 focus:ring-yellow-400 text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-yellow-400 bg-white/10 border-white/20 rounded-sm focus:ring-yellow-400"
                />
                <span>แสดงเนื้อหานี้</span>
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 py-3 font-bold rounded-lg transition duration-300 ${
                  submitting
                    ? 'bg-yellow-400/50 text-[#204396]/50 cursor-not-allowed'
                    : 'bg-yellow-400 text-[#204396] hover:bg-yellow-300'
                }`}
              >
                {submitting ? 'กำลังบันทึก...' : (editingContent ? 'อัปเดต' : 'บันทึก')}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 py-3 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30 transition duration-300"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Content List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-xs rounded-xl p-6"
      >
        <h3 className="text-xl font-bold mb-6">รายการเนื้อหา</h3>
        
        <div className="space-y-4">
          {contents.map((content) => (
            <div
              key={content.id}
              className="bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold">
                      {SECTION_OPTIONS.find(opt => opt.value === content.section)?.label || content.section}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded ${
                      content.active ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                    }`}>
                      {content.active ? 'แสดง' : 'ซ่อน'}
                    </span>
                    <span className="text-sm text-white/60">
                      ลำดับ: {content.order}
                    </span>
                  </div>
                  {content.title && (
                    <p className="font-medium text-yellow-400 mb-1">{content.title}</p>
                  )}
                  {content.content && (
                    <p className="text-white/80 line-clamp-2">
                      {content.content.length > 100 
                        ? `${content.content.substring(0, 100)}...` 
                        : content.content
                      }
                    </p>
                  )}
                  {content.image_url && (
                    <p className="text-blue-400 text-sm mt-1">
                      🖼️ มีรูปภาพ
                    </p>
                  )}
                  <p className="text-xs text-white/50 mt-2">
                    อัปเดตล่าสุด: {new Date(content.updated_at).toLocaleDateString('th-TH')} 
                    {content.updated_by && ` โดย ${content.updated_by}`}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(content)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-sm hover:bg-blue-700 transition"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(content.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-sm hover:bg-red-700 transition"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {contents.length === 0 && (
            <div className="text-center py-8 text-white/60">
              ยังไม่มีเนื้อหา
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}