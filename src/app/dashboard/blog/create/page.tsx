"use client";

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RichTextEditor from '@/app/components/RichTextEditor';

interface UploadedImage {
  originalName: string;
  fileName: string;
  url: string;
  size: number;
  type: string;
  uploadType?: string;
}

export default function CreateBlogPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageUpload = async (files: FileList | null, isThumbnail = false) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    // Add files to form data
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    // Add upload type and temporary blog ID
    formData.append('uploadType', isThumbnail ? 'thumbnail' : 'detail');
    formData.append('blogId', 'new-' + Date.now()); // Temporary ID for new blog

    try {
      const response = await fetch('/api/upload/blog', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (isThumbnail && data.files.length > 0) {
          setThumbnailUrl(data.files[0].url);
          toast.success('อัปโหลดรูปปกสำเร็จ');
        } else {
          setImages(prev => [...prev, ...data.files]);
          toast.success(`อัปโหลดรูปภาพสำเร็จ ${data.files.length} ไฟล์`);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'เกิดข้อผิดพลาดในการอัปโหลด');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error('กรุณากรอกหัวข้อและเนื้อหา');
      return;
    }

    setSaving(true);
    
    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || null,
          thumbnail_url: thumbnailUrl || null,
          status,
          images: images.map((img, index) => ({
            url: img.url,
            alt_text: img.originalName,
            order: index,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('สร้างบทความเรียบร้อยแล้ว');
        router.push('/dashboard/blog');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'เกิดข้อผิดพลาดในการสร้างบทความ');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างบทความ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">สร้างบทความใหม่</h2>
          <p className="text-white/70">เขียนและเผยแพร่บทความใหม่</p>
        </div>
        <Link
          href="/dashboard/blog"
          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition duration-300 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>กลับ</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xs rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-6">ข้อมูลพื้นฐาน</h3>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                หัวข้อบทความ *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-hidden focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="ใส่หัวข้อบทความ..."
                required
              />
            </div>

            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-white mb-2">
                คำอธิบายสั้น
              </label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-hidden focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="สรุปเนื้อหาของบทความในบางบรรทัด..."
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-white mb-2">
                สถานะ
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-hidden focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              >
                <option value="draft">แบบร่าง</option>
                <option value="published">เผยแพร่</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Thumbnail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-xs rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-6">รูปปก</h3>
          
          <div className="space-y-4">
            <div>
              <input
                type="file"
                ref={thumbnailInputRef}
                onChange={(e) => handleImageUpload(e.target.files, true)}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>{uploading ? 'กำลังอัปโหลด...' : 'เลือกรูปปก'}</span>
              </button>
            </div>

            {thumbnailUrl && (
              <div className="relative inline-block">
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail"
                  className="w-64 h-40 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setThumbnailUrl('')}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xs rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-6">เนื้อหา</h3>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              เนื้อหาบทความ *
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="เขียนเนื้อหาบทความที่นี่..."
            />
          </div>
        </motion.div>

        {/* Images */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-xs rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-6">รูปภาพประกอบ</h3>
          
          <div className="space-y-6">
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleImageUpload(e.target.files)}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 disabled:opacity-50 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>{uploading ? 'กำลังอัปโหลด...' : 'เพิ่มรูปภาพ'}</span>
              </button>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={image.originalName}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImage(index, index - 1)}
                          className="p-1 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition"
                          title="ย้ายขึ้น"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                      )}
                      {index < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImage(index, index + 1)}
                          className="p-1 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition"
                          title="ย้ายลง"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-1 bg-red-600 text-white rounded-sm hover:bg-red-700 transition"
                        title="ลบ"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-white/60 truncate">
                      {image.originalName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end space-x-4"
        >
          <Link
            href="/dashboard/blog"
            className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition duration-300"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-6 py-3 bg-yellow-400 text-[#204396] font-bold rounded-lg hover:bg-yellow-300 transition duration-300 disabled:opacity-50 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{saving ? 'กำลังบันทึก...' : 'บันทึกบทความ'}</span>
          </button>
        </motion.div>
      </form>
    </div>
  );
}