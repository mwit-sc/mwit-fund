"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IBM_Plex_Sans_Thai } from 'next/font/google';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

const ibmPlexSansThai = IBM_Plex_Sans_Thai({ 
  subsets: ['thai', 'latin'], 
  weight: ['100','200','300','400','500','600','700'], 
  display: 'swap' 
});

interface AlumniProfile {
  id: number;
  first_name: string;
  last_name: string;
  generation: string;
  graduation_year: string;
  current_job: string;
  company: string;
  contact_email: string;
  phone: string;
  line_id: string;
  facebook: string;
  linkedin: string;
  address: string;
  skills: string;
  interests: string;
  achievements: string;
  profile_image_url: string;
  created_at: string;
  updated_at: string;
}

interface Donation {
  id: number;
  donor_name: string;
  generation: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  contact_info: string;
  receipt_name: string;
  tax_id: string;
  address: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [alumniProfile, setAlumniProfile] = useState<AlumniProfile | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editData, setEditData] = useState<Partial<AlumniProfile>>({});

  useEffect(() => {
    if (session?.user?.email) {
      fetchAlumniProfile();
      fetchMyDonations();
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [session, status]);

  const fetchAlumniProfile = async () => {
    try {
      const response = await fetch('/api/alumni/profile');
      if (response.ok) {
        const data = await response.json();
        setAlumniProfile(data);
        setEditData(data);
      } else if (response.status === 404) {
        // Profile not found, user needs to register
        setAlumniProfile(null);
      }
    } catch (error) {
      console.error('Error fetching alumni profile:', error);
    }
  };

  const fetchMyDonations = async () => {
    try {
      const response = await fetch('/api/user/donations');
      if (response.ok) {
        const data = await response.json();
        setDonations(data);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/alumni/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: editData.first_name,
          lastName: editData.last_name,
          generation: editData.generation,
          graduationYear: editData.graduation_year,
          currentJob: editData.current_job,
          company: editData.company,
          contactEmail: editData.contact_email,
          phone: editData.phone,
          lineId: editData.line_id,
          facebook: editData.facebook,
          linkedin: editData.linkedin,
          address: editData.address,
          skills: editData.skills,
          interests: editData.interests,
          achievements: editData.achievements,
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setAlumniProfile(updatedProfile);
        setIsEditing(false);
        toast.success('บันทึกข้อมูลสำเร็จ!');
      } else {
        toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'อนุมัติแล้ว';
      case 'rejected': return 'ปฏิเสธ';
      default: return 'รอดำเนินการ';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-600 text-white';
      case 'rejected': return 'bg-red-600 text-white';
      default: return 'bg-yellow-600 text-white';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-b from-[#204396] to-[#152a5f] text-white flex items-center justify-center ${ibmPlexSansThai.className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={`min-h-screen bg-gradient-to-b from-[#204396] to-[#152a5f] text-white flex items-center justify-center ${ibmPlexSansThai.className}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-lg mb-6">คุณต้องเข้าสู่ระบบเพื่อดูโปรไฟล์</p>
          <Link href="/auth/signin" className="inline-block px-6 py-3 bg-yellow-400 text-[#204396] font-bold rounded-lg hover:bg-yellow-300 transition duration-300">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-[#204396] to-[#152a5f] text-white ${ibmPlexSansThai.className}`}>
      {/* Header */}
      <div className="py-16 px-4 bg-gradient-to-r from-[#204396] to-[#2a5ac9] text-center">
        <Link href="/" className="inline-block mb-10">
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>กลับสู่หน้าหลัก</span>
          </div>
        </Link>
        
        <h1 className="text-3xl md:text-5xl font-bold mb-4">โปรไฟล์ของฉัน</h1>
        <p className="text-xl max-w-2xl mx-auto">
          ข้อมูลส่วนตัวและประวัติการบริจาค
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* User Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">ข้อมูลบัญชี</h2>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'Profile'}
                  className="w-20 h-20 rounded-full object-cover border-2 border-yellow-400/30"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center text-[#204396] font-bold text-xl">
                  {session.user?.name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-yellow-400">{session.user?.name}</h3>
              <p className="text-white/70">{session.user?.email}</p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm text-green-300">ออนไลน์</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alumni Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">ข้อมูลศิษย์เก่า</h2>
            {alumniProfile && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-300 flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>{isEditing ? 'ยกเลิกการแก้ไข' : 'แก้ไขข้อมูล'}</span>
              </button>
            )}
          </div>

          {!alumniProfile ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">ยังไม่ได้ลงทะเบียนศิษย์เก่า</h3>
              <p className="text-white/70 mb-6">ลงทะเบียนเพื่อเข้าร่วมเครือข่ายศิษย์เก่า MWIT</p>
              <Link href="/alumni" className="inline-block px-6 py-3 bg-yellow-400 text-[#204396] font-bold rounded-lg hover:bg-yellow-300 transition duration-300">
                ลงทะเบียนศิษย์เก่า
              </Link>
            </div>
          ) : isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium">ชื่อ</label>
                  <input
                    type="text"
                    name="first_name"
                    value={editData.first_name || ''}
                    onChange={handleEditChange}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">นามสกุล</label>
                  <input
                    type="text"
                    name="last_name"
                    value={editData.last_name || ''}
                    onChange={handleEditChange}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium">รุ่น</label>
                  <input
                    type="text"
                    name="generation"
                    value={editData.generation || ''}
                    onChange={handleEditChange}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">ปีที่จบ</label>
                  <input
                    type="text"
                    name="graduation_year"
                    value={editData.graduation_year || ''}
                    onChange={handleEditChange}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium">ตำแหน่งงาน</label>
                  <input
                    type="text"
                    name="current_job"
                    value={editData.current_job || ''}
                    onChange={handleEditChange}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">บริษัท/องค์กร</label>
                  <input
                    type="text"
                    name="company"
                    value={editData.company || ''}
                    onChange={handleEditChange}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium">อีเมลติดต่อ</label>
                  <input
                    type="email"
                    name="contact_email"
                    value={editData.contact_email || ''}
                    onChange={handleEditChange}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">เบอร์โทร</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone || ''}
                    onChange={handleEditChange}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block mb-2 font-medium">Line ID</label>
                  <input
                    type="text"
                    name="line_id"
                    value={editData.line_id || ''}
                    onChange={handleEditChange}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Facebook</label>
                  <input
                    type="url"
                    name="facebook"
                    value={editData.facebook || ''}
                    onChange={handleEditChange}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">LinkedIn</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={editData.linkedin || ''}
                    onChange={handleEditChange}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">ที่อยู่</label>
                <textarea
                  name="address"
                  value={editData.address || ''}
                  onChange={handleEditChange}
                  rows={3}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">ความเชี่ยวชาญ/ทักษะ</label>
                <textarea
                  name="skills"
                  value={editData.skills || ''}
                  onChange={handleEditChange}
                  rows={3}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">ความสนใจ</label>
                <textarea
                  name="interests"
                  value={editData.interests || ''}
                  onChange={handleEditChange}
                  rows={3}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">ผลงาน/รางวัล</label>
                <textarea
                  name="achievements"
                  value={editData.achievements || ''}
                  onChange={handleEditChange}
                  rows={3}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSubmitting}
                  className={`px-6 py-3 font-bold rounded-lg transition duration-300 ${
                    isSubmitting
                      ? 'bg-yellow-400/50 text-[#204396]/50 cursor-not-allowed'
                      : 'bg-yellow-400 text-[#204396] hover:bg-yellow-300'
                  }`}
                >
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData(alumniProfile);
                  }}
                  className="px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition duration-300"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-yellow-400 mb-1">ชื่อ-นามสกุล</label>
                <p className="text-lg">{alumniProfile.first_name} {alumniProfile.last_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-400 mb-1">รุ่น</label>
                <p className="text-lg">รุ่น {alumniProfile.generation}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-400 mb-1">ปีที่จบ</label>
                <p className="text-lg">{alumniProfile.graduation_year || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-400 mb-1">ตำแหน่งงาน</label>
                <p className="text-lg">{alumniProfile.current_job || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-400 mb-1">บริษัท/องค์กร</label>
                <p className="text-lg">{alumniProfile.company || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-400 mb-1">อีเมลติดต่อ</label>
                <p className="text-lg">{alumniProfile.contact_email}</p>
              </div>
              {(alumniProfile.skills || alumniProfile.interests || alumniProfile.achievements) && (
                <div className="md:col-span-2 grid grid-cols-1 gap-4">
                  {alumniProfile.skills && (
                    <div>
                      <label className="block text-sm font-medium text-yellow-400 mb-1">ความเชี่ยวชาญ/ทักษะ</label>
                      <p className="text-white/90">{alumniProfile.skills}</p>
                    </div>
                  )}
                  {alumniProfile.interests && (
                    <div>
                      <label className="block text-sm font-medium text-yellow-400 mb-1">ความสนใจ</label>
                      <p className="text-white/90">{alumniProfile.interests}</p>
                    </div>
                  )}
                  {alumniProfile.achievements && (
                    <div>
                      <label className="block text-sm font-medium text-yellow-400 mb-1">ผลงาน/รางวัล</label>
                      <p className="text-white/90">{alumniProfile.achievements}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Donations History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6">ประวัติการบริจาค</h2>
          
          {donations.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="pb-3">วันที่</th>
                      <th className="pb-3">ชื่อผู้บริจาค</th>
                      <th className="pb-3">รุ่น</th>
                      <th className="pb-3">จำนวนเงิน</th>
                      <th className="pb-3">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((donation) => (
                      <tr key={donation.id} className="border-b border-white/10">
                        <td className="py-3">
                          {new Date(donation.created_at).toLocaleDateString('th-TH')}
                        </td>
                        <td className="py-3">{donation.donor_name}</td>
                        <td className="py-3">รุ่น {donation.generation}</td>
                        <td className="py-3 font-semibold">
                          {donation.amount.toLocaleString()} ฿
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(donation.status)}`}>
                            {getStatusText(donation.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{donation.donor_name}</h3>
                        <p className="text-sm text-white/70">รุ่น {donation.generation}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(donation.status)}`}>
                        {getStatusText(donation.status)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-white/70">จำนวนเงิน:</span>
                        <span className="font-semibold text-yellow-400">
                          {donation.amount.toLocaleString()} ฿
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-white/70">วันที่บริจาค:</span>
                        <span className="text-sm">
                          {new Date(donation.created_at).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center bg-white/5 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-yellow-400 mb-2">จำนวนครั้งที่บริจาค</h3>
                    <p className="text-2xl font-bold">{donations.length} ครั้ง</p>
                  </div>
                  
                  <div className="text-center bg-white/5 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-yellow-400 mb-2">ยอดบริจาครวม</h3>
                    <p className="text-2xl font-bold">
                      {donations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()} บาท
                    </p>
                  </div>
                  
                  <div className="text-center bg-white/5 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-yellow-400 mb-2">การบริจาคที่อนุมัติแล้ว</h3>
                    <p className="text-2xl font-bold">
                      {donations.filter(d => d.status === 'approved').length} ครั้ง
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">ยังไม่มีประวัติการบริจาค</h3>
              <p className="text-white/70 mb-6">เริ่มต้นบริจาคเพื่อช่วยเหลือน้องๆ กันเลย</p>
              <Link href="/donate" className="inline-block px-6 py-3 bg-yellow-400 text-[#204396] font-bold rounded-lg hover:bg-yellow-300 transition duration-300">
                บริจาคเลย
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}