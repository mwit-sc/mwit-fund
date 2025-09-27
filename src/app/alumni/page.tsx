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

interface AlumniData {
  firstName: string;
  lastName: string;
  generation: string;
  graduationYear: string;
  currentJob: string;
  company: string;
  contactEmail: string;
  phone: string;
  lineId: string;
  facebook: string;
  linkedin: string;
  address: string;
  skills: string;
  interests: string;
  achievements: string;
  profileImage: File | null;
}

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

export default function AlumniPage() {
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [alumniProfiles, setAlumniProfiles] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'register' | 'directory'>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGeneration, setFilterGeneration] = useState('');
  const [alumniData, setAlumniData] = useState<AlumniData>({
    firstName: '',
    lastName: '',
    generation: '',
    graduationYear: '',
    currentJob: '',
    company: '',
    contactEmail: '',
    phone: '',
    lineId: '',
    facebook: '',
    linkedin: '',
    address: '',
    skills: '',
    interests: '',
    achievements: '',
    profileImage: null
  });

  useEffect(() => {
    fetchAlumniProfiles();
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      setAlumniData(prev => ({
        ...prev,
        contactEmail: session.user.email || prev.contactEmail
      }));
    }
  }, [session]);

  const fetchAlumniProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/alumni');
      if (response.ok) {
        const data = await response.json();
        setAlumniProfiles(data);
      }
    } catch (error) {
      console.error('Error fetching alumni profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAlumniData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAlumniData(prev => ({ ...prev, profileImage: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (!alumniData.firstName || !alumniData.lastName || !alumniData.generation) {
        throw new Error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      }

      const loadingToast = toast.loading('กำลังบันทึกข้อมูล...');

      // Upload profile image if provided
      let profileImageUrl = null;
      if (alumniData.profileImage) {
        const formData = new FormData();
        formData.append('file', alumniData.profileImage);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          profileImageUrl = uploadResult.url;
        }
      }

      const response = await fetch('/api/alumni', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...alumniData,
          profileImageUrl
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
      }

      toast.success('ลงทะเบียนศิษย์เก่าสำเร็จ!', { id: loadingToast });
      
      setCurrentStep(3);
      setAlumniData({
        firstName: '',
        lastName: '',
        generation: '',
        graduationYear: '',
        currentJob: '',
        company: '',
        contactEmail: '',
        phone: '',
        lineId: '',
        facebook: '',
        linkedin: '',
        address: '',
        skills: '',
        interests: '',
        achievements: '',
        profileImage: null
      });
      
      // Refresh alumni profiles
      fetchAlumniProfiles();
      
    } catch (error) {
      console.error('Error submitting alumni registration:', error);
      setSubmitError((error as Error).message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      toast.error((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className={`min-h-screen bg-gradient-to-b from-[#204396] to-[#152a5f] text-white flex items-center justify-center ${ibmPlexSansThai.className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  const filteredAlumni = alumniProfiles.filter(alumni => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      alumni.first_name.toLowerCase().includes(searchLower) ||
      alumni.last_name.toLowerCase().includes(searchLower) ||
      alumni.company.toLowerCase().includes(searchLower) ||
      alumni.current_job.toLowerCase().includes(searchLower);
    
    const matchesGeneration = !filterGeneration || alumni.generation === filterGeneration;
    
    return matchesSearch && matchesGeneration;
  });

  const generations = [...new Set(alumniProfiles.map(alumni => alumni.generation))].sort();

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
        
        <h1 className="text-3xl md:text-5xl font-bold mb-4">ทะเบียนศิษย์เก่า MWIT</h1>
        <p className="text-xl max-w-2xl mx-auto">
          ลงทะเบียนและเชื่อมต่อกับเครือข่ายศิษย์เก่าโรงเรียนมหิดลวิทยานุสรณ์
        </p>
      </div>

      {/* Toggle Buttons */}
      <div className="max-w-6xl mx-auto px-4 -mt-10">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setViewMode('directory')}
              className={`px-6 py-3 rounded-lg font-semibold transition duration-300 ${
                viewMode === 'directory'
                  ? 'bg-yellow-400 text-[#204396]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              ดูทะเบียนศิษย์เก่า
            </button>
            <button
              onClick={() => setViewMode('register')}
              className={`px-6 py-3 rounded-lg font-semibold transition duration-300 ${
                viewMode === 'register'
                  ? 'bg-yellow-400 text-[#204396]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              ลงทะเบียนศิษย์เก่า
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'directory' && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">ค้นหาชื่อ, บริษัท, หรือตำแหน่งงาน</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                  placeholder="พิมพ์เพื่อค้นหา..."
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">กรองตามรุ่น</label>
                <select
                  value={filterGeneration}
                  onChange={(e) => setFilterGeneration(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                >
                  <option value="">ทุกรุ่น</option>
                  {generations.map(gen => (
                    <option key={gen} value={gen} className="bg-[#204396]">รุ่น {gen}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Alumni Directory */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-6">ทะเบียนศิษย์เก่า ({filteredAlumni.length} คน)</h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                <p className="text-xl">กำลังโหลดข้อมูล...</p>
              </div>
            ) : filteredAlumni.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlumni.map((alumni) => (
                  <motion.div
                    key={alumni.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:border-yellow-400/50 transition-all duration-300"
                  >
                    <div className="text-center mb-4">
                      {alumni.profile_image_url ? (
                        <img
                          src={alumni.profile_image_url}
                          alt={`${alumni.first_name} ${alumni.last_name}`}
                          className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-yellow-400/30"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full mx-auto bg-yellow-400 flex items-center justify-center text-[#204396] font-bold text-xl">
                          {alumni.first_name.charAt(0)}{alumni.last_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-yellow-400 mb-2">
                        {alumni.first_name} {alumni.last_name}
                      </h3>
                      <p className="text-sm text-white/70 mb-1">รุ่น {alumni.generation}</p>
                      <p className="text-sm text-white/70 mb-2">จบปี {alumni.graduation_year}</p>
                      
                      {alumni.current_job && (
                        <p className="font-medium mb-1">{alumni.current_job}</p>
                      )}
                      {alumni.company && (
                        <p className="text-sm text-white/80">{alumni.company}</p>
                      )}
                      
                      {alumni.skills && (
                        <div className="mt-3">
                          <p className="text-xs text-yellow-400 mb-1">ความเชี่ยวชาญ:</p>
                          <p className="text-xs text-white/70 line-clamp-2">{alumni.skills}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-center space-x-2 mt-4">
                        {alumni.facebook && (
                          <a
                            href={alumni.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </a>
                        )}
                        {alumni.linkedin && (
                          <a
                            href={alumni.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-800 rounded-full hover:bg-blue-900 transition"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">ไม่พบข้อมูลศิษย์เก่า</h3>
                <p className="text-white/70 mb-4">ลองใช้คำค้นหาอื่น หรือเปลี่ยนตัวกรอง</p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {viewMode === 'register' && (
        <div className="max-w-4xl mx-auto px-4 py-12">
          {!session ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-lg text-center"
            >
              <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">กรุณาเข้าสู่ระบบ</h2>
              <p className="text-lg mb-6">คุณต้องเข้าสู่ระบบเพื่อลงทะเบียนศิษย์เก่า</p>
              <Link href="/auth/signin" className="inline-block px-6 py-3 bg-yellow-400 text-[#204396] font-bold rounded-lg hover:bg-yellow-300 transition duration-300">
                เข้าสู่ระบบ
              </Link>
            </motion.div>
          ) : currentStep === 3 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-lg text-center"
            >
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold mb-4">ลงทะเบียนสำเร็จ!</h2>
              <p className="text-lg mb-8">ขอบคุณที่ลงทะเบียนเข้าสู่ทะเบียนศิษย์เก่า MWIT</p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                <button
                  onClick={() => setViewMode('directory')}
                  className="px-6 py-3 bg-yellow-400 text-[#204396] font-bold rounded-lg hover:bg-yellow-300 transition duration-300"
                >
                  ดูทะเบียนศิษย์เก่า
                </button>
                <Link href="/profile" className="inline-block px-6 py-3 bg-white/20 text-white font-bold rounded-lg hover:bg-white/30 transition duration-300">
                  ดูโปรไฟล์ของฉัน
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-6">ลงทะเบียนศิษย์เก่า</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block mb-2 font-medium">
                      ชื่อ <span className="text-yellow-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={alumniData.firstName}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                      placeholder="กรอกชื่อ"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block mb-2 font-medium">
                      นามสกุล <span className="text-yellow-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={alumniData.lastName}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                      placeholder="กรอกนามสกุล"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="generation" className="block mb-2 font-medium">
                      รุ่น <span className="text-yellow-400">*</span>
                    </label>
                    <input
                      type="number"
                      id="generation"
                      name="generation"
                      value={alumniData.generation}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                      placeholder="เช่น 1, 15, 20"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="graduationYear" className="block mb-2 font-medium">
                      ปีที่จบการศึกษา
                    </label>
                    <input
                      type="number"
                      id="graduationYear"
                      name="graduationYear"
                      value={alumniData.graduationYear}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                      placeholder="เช่น 2567"
                      min="2550"
                      max="2600"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="currentJob" className="block mb-2 font-medium">
                      ตำแหน่งงานปัจจุบัน
                    </label>
                    <input
                      type="text"
                      id="currentJob"
                      name="currentJob"
                      value={alumniData.currentJob}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                      placeholder="เช่น Software Engineer, หมอ, ครู"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="company" className="block mb-2 font-medium">
                      บริษัท/องค์กร
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={alumniData.company}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                      placeholder="ชื่อบริษัทหรือองค์กร"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contactEmail" className="block mb-2 font-medium">
                      อีเมลติดต่อ
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={alumniData.contactEmail}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                      placeholder="อีเมลสำหรับติดต่อ"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block mb-2 font-medium">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={alumniData.phone}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                      placeholder="เบอร์โทรศัพท์"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="lineId" className="block mb-2 font-medium">
                      Line ID
                    </label>
                    <input
                      type="text"
                      id="lineId"
                      name="lineId"
                      value={alumniData.lineId}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                      placeholder="Line ID"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="facebook" className="block mb-2 font-medium">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      id="facebook"
                      name="facebook"
                      value={alumniData.facebook}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="linkedin" className="block mb-2 font-medium">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      id="linkedin"
                      name="linkedin"
                      value={alumniData.linkedin}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="address" className="block mb-2 font-medium">
                    ที่อยู่ปัจจุบัน
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={alumniData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                    placeholder="ที่อยู่ปัจจุบัน"
                  />
                </div>
                
                <div>
                  <label htmlFor="skills" className="block mb-2 font-medium">
                    ความเชี่ยวชาญ/ทักษะ
                  </label>
                  <textarea
                    id="skills"
                    name="skills"
                    value={alumniData.skills}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                    placeholder="เช่น Programming, Design, การตลาด, การเงิน"
                  />
                </div>
                
                <div>
                  <label htmlFor="interests" className="block mb-2 font-medium">
                    ความสนใจ
                  </label>
                  <textarea
                    id="interests"
                    name="interests"
                    value={alumniData.interests}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                    placeholder="สิ่งที่สนใจหรืองานอดิเรก"
                  />
                </div>
                
                <div>
                  <label htmlFor="achievements" className="block mb-2 font-medium">
                    ผลงาน/รางวัลที่โดดเด่น
                  </label>
                  <textarea
                    id="achievements"
                    name="achievements"
                    value={alumniData.achievements}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                    placeholder="ผลงานหรือรางวัลที่ภาคภูมิใจ"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">
                    รูปโปรไฟล์
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-400 file:text-[#204396] file:font-semibold hover:file:bg-yellow-300"
                  />
                </div>

                {submitError && (
                  <div className="bg-red-500/20 text-red-100 p-3 rounded-lg">
                    {submitError}
                  </div>
                )}
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 font-bold rounded-lg transition duration-300 ${
                      isSubmitting
                        ? 'bg-yellow-400/50 text-[#204396]/50 cursor-not-allowed'
                        : 'bg-yellow-400 text-[#204396] hover:bg-yellow-300'
                    }`}
                  >
                    {isSubmitting ? 'กำลังบันทึก...' : 'ลงทะเบียน'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}