"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { IBM_Plex_Sans_Thai } from 'next/font/google';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Turnstile from '../components/Turnstile';

const ibmPlexSansThai = IBM_Plex_Sans_Thai({ 
  subsets: ['thai', 'latin'], 
  weight: ['100','200','300','400','500','600','700'], 
  display: 'swap' 
});

// Database API is now handled through API routes

interface DonationData {
  donorName: string;
  generation: string;
  amount: string;
  receiptName: string;
  email: string;
  taxId: string;
  address: string;
  contactInfo: string;
  publicationConsent: 'full' | 'name_only' | 'anonymous';
  slip: File | null;
}

interface Question {
  id: number;
  question: string;
  answer: string;
  order: number;
}

function QuestionsSection() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/qa/public');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.slice(0, 5)); // Show only first 5 questions
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  if (loading || questions.length === 0) {
    return null; // Don't show section if loading or no questions
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xs rounded-xl p-8 shadow-lg"
        >
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold mb-4">คำถามที่พบบ่อย</h2>
            <p className="text-white/80">คำถามและคำตอบเกี่ยวกับกองทุนแบ่งสรรปันน้อง</p>
          </div>
          
          <div className="space-y-4 mb-8">
            {questions.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-xs rounded-lg overflow-hidden border border-white/10"
              >
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="w-full p-4 text-left hover:bg-white/5 transition-colors duration-300 flex justify-between items-center"
                >
                  <h3 className="text-lg font-semibold text-white pr-4">
                    {item.question}
                  </h3>
                  <div className={`transform transition-transform duration-300 ${
                    expandedItems.has(item.id) ? 'rotate-180' : ''
                  }`}>
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                <motion.div
                  initial={false}
                  animate={{
                    height: expandedItems.has(item.id) ? 'auto' : 0,
                    opacity: expandedItems.has(item.id) ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 border-t border-white/10">
                    <div className="pt-4">
                      <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/questions" className="inline-flex items-center px-6 py-3 bg-yellow-400 text-[#204396] font-semibold rounded-lg hover:bg-yellow-300 transition duration-300">
              <span>ดูคำถามทั้งหมด</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function DonatePage() {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [lastDonation, setLastDonation] = useState<unknown>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [donationData, setDonationData] = useState<DonationData>(() => {
    const savedData = typeof window !== 'undefined' ? localStorage.getItem('donationData') : null;
    return savedData ? JSON.parse(savedData) : {
      donorName: '',
      generation: '',
      amount: '',
      receiptName: '',
      email: '',
      taxId: '',
      address: '',
      contactInfo: '',
      publicationConsent: 'full',
      slip: null
    };
  });
  const [, setSubmitSuccess] = useState<boolean>(false);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(false);
  const [stats, setStats] = useState({
    totalDonation: 0,
    totalDonors: 0,
    targetAmount: 750000
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/donations/stats');
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setStats({
              totalDonation: data.total_amount || 0,
              totalDonors: data.total_donors || 0,
              targetAmount: data.target_amount || 750000
            });
          }
        }
      } catch (error) {
        console.error('Error fetching donation stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Auto-fill email for logged-in users and show popup for non-logged-in users
  useEffect(() => {
    if (session?.user?.email) {
      // Auto-fill email for logged-in users
      setDonationData(prev => ({
        ...prev,
        email: session.user.email || prev.email
      }));
      
      // Fetch last donation for auto-fill
      const fetchLastDonation = async () => {
        try {
          const response = await fetch('/api/user/last-donation');
          if (response.ok) {
            const data = await response.json();
            if (data) {
              setLastDonation(data);
            }
          }
        } catch (error) {
          console.error('Error fetching last donation:', error);
        }
      };
      fetchLastDonation();
    } else {
      // Show popup for non-logged-in users after a short delay
      const timer = setTimeout(() => {
        setShowLoginPopup(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('donationData', JSON.stringify(donationData));
    }
  }, [donationData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDonationData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setDonationData(prev => ({ ...prev, publicationConsent: value as 'full' | 'name_only' | 'anonymous' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setDonationData(prev => ({ ...prev, slip: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreview(reader.result as string | null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (!donationData.donorName || !donationData.generation || !donationData.contactInfo || !donationData.slip) {
        throw new Error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ช่องที่มีเครื่องหมาย *)');
      }

      if (!turnstileToken) {
        throw new Error('กรุณายืนยันว่าคุณไม่ใช่โปรแกรมอัตโนมัติ');
      }

      // Show loading toast
      const loadingToast = toast.loading('กำลังประมวลผลการบริจาค...');

      // First verify Turnstile token
      const turnstileVerify = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: turnstileToken }),
      });

      if (!turnstileVerify.ok) {
        const verifyError = await turnstileVerify.json();
        toast.error(verifyError.error || 'การยืนยันความปลอดภัยล้มเหลว', {
          id: loadingToast,
        });
        return;
      }

      // Upload slip image to Cloudflare R2
      let slipUrl = null;
      if (donationData.slip) {
        const formData = new FormData();
        formData.append('file', donationData.slip);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload slip image');
        }

        const uploadResult = await uploadResponse.json();
        slipUrl = uploadResult.url;
      }

      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donationData,
          slipImageUrl: slipUrl,
          turnstileToken
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'เกิดข้อผิดพลาดในการส่งข้อมูล', {
          id: loadingToast,
        });
        throw new Error('Failed to submit donation');
      }

      toast.success('บริจาคสำเร็จ! ขอบคุณสำหรับการสนับสนุน', {
        id: loadingToast,
      });

      setSubmitSuccess(true);
      setCurrentStep(3);
      setDonationData({
        donorName: '',
        generation: '',
        amount: '',
        receiptName: '',
        email: '',
        taxId: '',
        address: '',
        contactInfo: '',
        publicationConsent: 'full',
        slip: null
      });
      setSlipPreview(null);
      setTurnstileToken(null);
      setTurnstileReset(true);
      // Reset the turnstile reset flag after a brief delay
      setTimeout(() => setTurnstileReset(false), 100);
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('donationData');
      }
    } catch (error) {
      console.error('Error submitting donation:', error);
      setSubmitError((error as Error).message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const fillFromLastDonation = () => {
    if (lastDonation) {
      setDonationData(prev => ({
        ...prev,
        donorName: lastDonation.donor_name || '',
        generation: lastDonation.generation || '',
        receiptName: lastDonation.receipt_name || '',
        email: lastDonation.donor_email || session?.user?.email || '',
        taxId: lastDonation.tax_id || '',
        address: lastDonation.address || '',
        contactInfo: lastDonation.contact_info || '',
        publicationConsent: lastDonation.publication_consent || 'full'
      }));
    }
  };

  const progressPercentage = Math.min(100, (stats.totalDonation / stats.targetAmount) * 100);

  // The rest of your component (JSX) remains unchanged.
  // You already have a large return block for rendering the page, which is syntactically correct.
  // No need to copy again unless you request.

  return (
    <div>
      <div className={`min-h-screen bg-linear-to-b from-[#204396] to-[#152a5f] text-white pb-20 ${ibmPlexSansThai.className}`}>
      {/* Header */}
      <div className="py-16 px-4 bg-linear-to-r from-[#204396] to-[#2a5ac9] text-center">
        <Link href="/" className="inline-block mb-10">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>กลับสู่หน้าหลัก</span>
          </div>
        </Link>
        
        <h1 className="text-3xl md:text-5xl font-bold mb-4">กองทุนแบ่งสรรปันน้อง</h1>
        <p className="text-xl max-w-2xl mx-auto">
          ร่วมส่งต่อโอกาสดีๆ ที่เราได้รับ ผ่านการบริจาค<br/>
          การบริจาคของท่านสามารถนำไปลดหย่อนภาษีได้ 2 เท่า
        </p>
      </div>
      
      {/* Progress Tracker */}
      <div className="max-w-6xl mx-auto px-4 -mt-10">
        <div className="bg-white/10 backdrop-blur-xs rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-yellow-400">เป้าหมายการระดมทุน</h3>
              <p className="text-3xl font-bold">{stats.targetAmount.toLocaleString()} บาท</p>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-yellow-400">ยอดบริจาคปัจจุบัน</h3>
              <p className="text-3xl font-bold">{stats.totalDonation.toLocaleString()} บาท</p>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-yellow-400">จำนวนผู้บริจาค</h3>
              <p className="text-3xl font-bold">{stats.totalDonors.toLocaleString()} คน</p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="h-4 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-linear-to-r from-yellow-400 to-yellow-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="mt-2 text-right">{progressPercentage.toFixed(1)}% ของเป้าหมาย</p>
          </div>
        </div>
      </div>
      
      {/* Donation Steps */}
      <div className="max-w-6xl mx-auto mt-16 px-4">
        <div className="mb-12">
          <div className="relative flex justify-between max-w-3xl mx-auto">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center relative z-10">
                <div 
                  className={`w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold ${
                    currentStep >= step 
                      ? 'bg-yellow-400 text-[#204396]' 
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {step}
                </div>
                <p className="mt-2 text-center text-sm">
                  {step === 1 && 'กรอกข้อมูล'}
                  {step === 2 && 'อัพโหลดสลิป'}
                  {step === 3 && 'เสร็จสิ้น'}
                </p>
              </div>
            ))}
            
            {/* Connect steps with line */}
            <div className="absolute top-6 left-0 transform -translate-y-1/2 h-1 bg-white/20 w-full -z-10"></div>
            <div 
              className="absolute top-6 left-0 transform -translate-y-1/2 h-1 bg-yellow-400 -z-5 transition-all duration-500"
              style={{ width: `${(currentStep - 1) * 50}%` }}
            ></div>
          </div>
        </div>
        
        {currentStep === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-xs rounded-xl p-8 shadow-lg max-w-3xl mx-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">ข้อมูลผู้บริจาค</h2>
              {lastDonation && session?.user && (
                <button
                  type="button"
                  onClick={fillFromLastDonation}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-300 flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>ใช้ข้อมูลครั้งก่อน</span>
                </button>
              )}
            </div>
            
            <form className="space-y-6">
              <div>
                <label htmlFor="donorName" className="block mb-2 font-medium">
                  ชื่อ-สกุลผู้บริจาคภาษาไทย <span className="text-yellow-400">*</span>
                </label>
                <input 
                  type="text" 
                  id="donorName" 
                  name="donorName"
                  value={donationData.donorName}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-hidden focus:ring-2 focus:ring-yellow-400 text-white"
                  placeholder="กรอกชื่อ-นามสกุล" 
                  required
                />
              </div>
              
              <div>
                <label htmlFor="generation" className="block mb-2 font-medium">
                  รุ่น
                </label>
                <input 
                  type="number" 
                  id="generation" 
                  name="generation"
                  value={donationData.generation}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-hidden focus:ring-2 focus:ring-yellow-400 text-white"
                  placeholder="เช่น รุ่น 1, รุ่น 15" 
                  required
                />
              </div>
              
              <div>
                <label htmlFor="amount" className="block mb-2 font-medium">
                  จำนวนเงิน (บาท)
                </label>
                <input 
                  type="number" 
                  id="amount" 
                  name="amount"
                  value={donationData.amount}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-hidden focus:ring-2 focus:ring-yellow-400 text-white"
                  placeholder="ระบุจำนวนเงิน" 
                  min="1"
                />
              </div>
              
              <div>
                <label htmlFor="receiptName" className="block mb-2 font-medium">
                  ประสงค์ให้ออกใบเสร็จในนาม (ชื่อ-สกุล, บริษัท)
                </label>
                <input 
                  type="text" 
                  id="receiptName" 
                  name="receiptName"
                  value={donationData.receiptName}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-hidden focus:ring-2 focus:ring-yellow-400 text-white"
                  placeholder="กรอกชื่อที่ต้องการให้ปรากฏในใบเสร็จ" 
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block mb-2 font-medium">
                  Email
                </label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={donationData.email}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-hidden focus:ring-2 focus:ring-yellow-400 text-white"
                  placeholder="กรอกอีเมล" 
                />
              </div>
              
              <div>
                <label htmlFor="taxId" className="block mb-2 font-medium">
                  เลขประจำตัวผู้เสียภาษี (กรณีโอนเงินผ่านบัญชีโรงเรียน)
                </label>
                <input 
                  type="text" 
                  id="taxId" 
                  name="taxId"
                  value={donationData.taxId}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-hidden focus:ring-2 focus:ring-yellow-400 text-white"
                  placeholder="กรอกเลขประจำตัวผู้เสียภาษี" 
                />
              </div>
              
              <div>
                <label htmlFor="address" className="block mb-2 font-medium">
                  ที่อยู่ในการส่งเอกสาร
                </label>
                <textarea 
                  id="address" 
                  name="address"
                  value={donationData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-hidden focus:ring-2 focus:ring-yellow-400 text-white"
                  placeholder="กรอกที่อยู่สำหรับจัดส่งเอกสาร" 
                />
              </div>
              
              <div>
                <label htmlFor="contactInfo" className="block mb-2 font-medium">
                  Line ID หรือเบอร์โทรติดต่อกลับ <span className="text-yellow-400">*</span>
                </label>
                <input 
                  type="text" 
                  id="contactInfo" 
                  name="contactInfo"
                  value={donationData.contactInfo}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-hidden focus:ring-2 focus:ring-yellow-400 text-white"
                  placeholder="กรอก Line ID หรือเบอร์โทรศัพท์" 
                  required
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">
                  การอนุญาตออกนาม <span className="text-yellow-400">*</span>
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="consentFull" 
                      name="publicationConsent"
                      value="full"
                      checked={donationData.publicationConsent === 'full'}
                      onChange={handleRadioChange}
                      className="mr-2"
                    />
                    <label htmlFor="consentFull">
                      อนุญาตให้โรงเรียนประกาศชื่อผู้บริจาคและจำนวนเงินทางสื่อออนไลน์ได้
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="consentNameOnly" 
                      name="publicationConsent"
                      value="name_only"
                      checked={donationData.publicationConsent === 'name_only'}
                      onChange={handleRadioChange}
                      className="mr-2"
                    />
                    <label htmlFor="consentNameOnly">
                      อนุญาตให้โรงเรียนประกาศชื่อผู้บริจาคทางสื่อออนไลน์ได้ (โดยไม่ประกาศยอดเงิน)
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="consentAnonymous" 
                      name="publicationConsent"
                      value="anonymous"
                      checked={donationData.publicationConsent === 'anonymous'}
                      onChange={handleRadioChange}
                      className="mr-2"
                    />
                    <label htmlFor="consentAnonymous">
                      ไม่ประสงค์ออกนาม
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button 
                  type="button" 
                  onClick={() => setCurrentStep(2)}
                  className="w-full py-3 bg-yellow-400 text-[#204396] font-bold rounded-lg hover:bg-yellow-300 transition duration-300"
                >
                  ถัดไป
                </button>
              </div>
            </form>
          </motion.div>
        )}
        
        {currentStep === 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-xs rounded-xl p-8 shadow-lg max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-bold mb-6">อัพโหลดหลักฐานการโอนเงิน</h2>
            
            <div className="mb-6">
              <p className="mb-2 font-medium">ข้อมูลบัญชีสำหรับโอนเงิน</p>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="font-bold text-yellow-400">บัญชีโรงเรียนมหิดลวิทยานุสรณ์</p>
                <p>ธนาคารกรุงไทย</p>
                <p>เลขที่บัญชี 459-0-47124-8</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="mb-4">หรือ สแกน QR Code เพื่อบริจาคเข้าระบบ E-DONATION</p>
              <div className="flex justify-center">
                <img src="/img/qr-school.png" alt="QR Code" className="h-64 bg-white p-2 rounded-lg"/>
              </div>
              <p className="text-center mt-2 text-sm">กองบุญ : 09940000521472001</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mt-6">
                <label className="block mb-2 font-medium">
                  หลักฐานการโอนเงิน (รูปภาพ) <span className="text-yellow-400">*</span>
                </label>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {slipPreview ? (
                  <div className="mt-2">
                    <div className="relative w-full h-64 bg-white/10 rounded-lg overflow-hidden">
                      <img 
                        src={slipPreview} 
                        alt="Slip preview" 
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="absolute bottom-2 right-2 bg-yellow-400 text-[#204396] p-2 rounded-lg font-medium"
                      >
                        เปลี่ยนรูป
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={triggerFileInput}
                    className="mt-2 border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-yellow-400 transition duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>คลิกเพื่ออัพโหลดรูปภาพสลิปการโอนเงิน</p>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block mb-2 font-medium">
                  ยืนยันตัวตน <span className="text-yellow-400">*</span>
                </label>
                <Turnstile
                  onVerify={setTurnstileToken}
                  onError={() => setTurnstileToken(null)}
                  onExpire={() => setTurnstileToken(null)}
                  theme="dark"
                  className="flex justify-center"
                  reset={turnstileReset}
                />
              </div>

              {submitError && (
                <div className="bg-red-500/20 text-red-100 p-3 rounded-lg">
                  {submitError}
                </div>
              )}
              
              <div className="flex space-x-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setCurrentStep(1)}
                  className="w-1/2 py-3 bg-white/20 text-white font-bold rounded-lg hover:bg-white/30 transition duration-300"
                >
                  ย้อนกลับ
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !donationData.slip || !turnstileToken}
                  className={`w-1/2 py-3 font-bold rounded-lg transition duration-300 ${
                    isSubmitting || !donationData.slip || !turnstileToken
                      ? 'bg-yellow-400/50 text-[#204396]/50 cursor-not-allowed'
                      : 'bg-yellow-400 text-[#204396] hover:bg-yellow-300'
                  }`}
                >
                  {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันการบริจาค'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
        
        {currentStep === 3 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-xs rounded-xl p-8 shadow-lg max-w-3xl mx-auto text-center"
          >
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-4">ขอบคุณสำหรับการบริจาค</h2>
            <p className="text-lg mb-8">
              การบริจาคของท่านได้รับการบันทึกเรียบร้อยแล้ว เจ้าหน้าที่จะตรวจสอบและส่งเอกสารรับรองการบริจาคให้ท่านตามที่อยู่ที่ได้ระบุไว้
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <Link href="/">
                <div className="px-6 py-3 bg-white/20 text-white font-bold rounded-lg hover:bg-white/30 transition duration-300">
                  กลับสู่หน้าหลัก
                </div>
              </Link>
              <button 
                onClick={() => {
                  setCurrentStep(1);
                  setSubmitSuccess(false);
                }}
                className="px-6 py-3 bg-yellow-400 text-[#204396] font-bold rounded-lg hover:bg-yellow-300 transition duration-300"
              >
                บริจาคอีกครั้ง
              </button>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Donation Info */}
      <div className="max-w-6xl mx-auto mt-20 px-4">
        <div className="bg-white/10 backdrop-blur-xs rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">รายละเอียดกองทุนแบ่งสรรปันน้อง</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-4">เป้าหมายของกองทุน</h3>
              <ul className="space-y-2 list-disc pl-5">
                <li>เพื่อเป็นทุนการศึกษาให้นักเรียนปัจจุบันที่ต้องการความช่วยเหลือด้านทุนทรัพย์</li>
                <li>เพื่อเป็นทุนการศึกษาสำหรับนักเรียนในการทำกิจกรรมบำเพ็ญประโยชน์</li>
                <li>เพื่อเป็นทุนการศึกษาสำหรับนักเรียนในการนำเสนอโครงการหรือการเข้าร่วมการแข่งขันทั้งในและต่างประเทศ</li>
                <li>เพื่อเป็นทุนการศึกษาสำหรับกิจกรรมของคณะกรรมการสภานักเรียน</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-4">การจัดสรรทุนการศึกษา</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-bold">ทุนประจำปีการศึกษา 2567 : จำนวน 18 ทุน งบประมาณ 240,000 บาท</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>มูลค่าทุนละ 25,000 บาท</li>
                    <li>มูลค่าทุนละ 15,000 บาท</li>
                    <li>มูลค่าทุนละ 10,000 บาท</li>
                    <li>มูลค่าทุนละ 5,000 บาท</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-bold">ทุนสนับสนุนการนำเสนอผลงานและการแข่งขันทางวิชาการ</p>
                  <p>งบประมาณการจัดสรร: 100,000 บาทต่อปีการศึกษา</p>
                  <p>จำนวนทุนที่จัดสรร: 5-10 ทุน</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">คำถามที่พบบ่อย (FAQ)</h3>
            
            <div className="space-y-4">
              <div className="bg-white/10 p-4 rounded-lg">
                <h4 className="font-bold mb-2">1. การบริจาคสามารถนำไปลดหย่อนภาษีได้หรือไม่?</h4>
                <p>ได้ การบริจาคให้กับกองทุนแบ่งสรรปันน้องสามารถนำไปลดหย่อนภาษีได้ 2 เท่า ท่านจะได้รับใบเสร็จรับเงินและเอกสารรับรองการบริจาคหลังจากที่เจ้าหน้าที่ตรวจสอบการโอนเงินเรียบร้อยแล้ว</p>
              </div>
              
              <div className="bg-white/10 p-4 rounded-lg">
                <h4 className="font-bold mb-2">2. หลังจากบริจาคแล้ว จะได้รับเอกสารเมื่อไหร่?</h4>
                <p>เจ้าหน้าที่จะจัดส่งเอกสารรับรองการบริจาคให้ท่านทางอีเมลภายใน 7 วันทำการ และจัดส่งเอกสารตัวจริงทางไปรษณีย์ตามที่อยู่ที่ท่านระบุไว้</p>
              </div>
              
              <div className="bg-white/10 p-4 rounded-lg">
                <h4 className="font-bold mb-2">3. มีช่องทางการบริจาคอื่นๆ หรือไม่?</h4>
                <p>นอกจากการโอนเงินผ่านบัญชีธนาคารหรือสแกน QR Code แล้ว ท่านสามารถติดต่อบริจาคด้วยตนเองได้ที่ฝ่ายกิจการนักเรียนเก่า โรงเรียนมหิดลวิทยานุสรณ์ ในวันและเวลาทำการ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Popup */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-gray-800"
          >
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">บริจาคโดยไม่บันทึก?</h3>
              <p className="text-gray-600">
                เข้าสู่ระบบเพื่อบันทึกประวัติการบริจาคและเติมข้อมูลอัตโนมัติ
              </p>
            </div>

            <div className="space-y-4">
              {/* <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">ประโยชน์ของการเข้าสู่ระบบ:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• บันทึกประวัติการบริจาค</li>
                  <li>• เติมข้อมูลส่วนตัวอัตโนมัติ</li>
                  <li>• ติดตามสถานะการบริจาค</li>
                  <li>• ดาวน์โหลดใบเสร็จได้ทันที</li>
                </ul>
              </div> */}

              <div className="space-y-3">
                <Link 
                  href="/auth/signin"
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300 flex items-center justify-center space-x-2 font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>เข้าสู่ระบบด้วย Google</span>
                </Link>
                <button
                  onClick={() => setShowLoginPopup(false)}
                  className="w-full px-4 py-3 bg-yellow-200 text-gray-800 rounded-lg hover:bg-yellow-300 transition duration-300 font-medium"
                >
                  บริจาคต่อ
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                คุณสามารถบริจาคได้โดยไม่ต้องเข้าสู่ระบบ แต่จะไม่สามารถบันทึกประวัติได้
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Scholarship Committee Section */}
      <div className="max-w-6xl mx-auto mt-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-xs rounded-xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-yellow-400">คณะกรรมการพิจารณาทุน</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-yellow-300">1. ดร.สาโรจน์ บุญเส็ง</p>
              <p className="text-sm text-white/80">หัวหน้าฝ่ายบริหารการเรียนรู้และระบบโรงเรียนประจำ (ประธาน)</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-yellow-300">2. ดร.สุพรรณี เชื้อนุ่น</p>
              <p className="text-sm text-white/80">หัวหน้างานวิชาการ</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-yellow-300">3. นางสาวรัตนา สุขสำราญ</p>
              <p className="text-sm text-white/80">หัวหน้างานกิจการนักเรียน</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-yellow-300">4. ดร.ธรรมนูญ ผุยรอด</p>
              <p className="text-sm text-white/80">หัวหน้าครูที่ปรึกษาระดับชั้น ม.6</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-yellow-300">5. นางสาวนิธิกานต์ คิมอิ๋ง</p>
              <p className="text-sm text-white/80">หัวหน้าครูที่ปรึกษาระดับชั้น ม.5</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-yellow-300">6. ดร.สมพร บัวประทุม</p>
              <p className="text-sm text-white/80">หัวหน้าครูที่ปรึกษาระดับชั้น ม.4</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-yellow-300">7. นางทิพนาถ น้อยแก้ว</p>
              <p className="text-sm text-white/80">รองหัวหน้าครูที่ปรึกษาระดับชั้น ม.6</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-yellow-300">8. ดร.ถนอมศักดิ์ เหล่ากุล</p>
              <p className="text-sm text-white/80">รองหัวหน้าครูที่ปรึกษาระดับชั้น ม.5</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-yellow-300">9. ดร.สิริหทัย ศรีขวัญใจ</p>
              <p className="text-sm text-white/80">รองหัวหน้าครูที่ปรึกษาระดับชั้น ม.4</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-yellow-300">10. นางสาวพรทิพย์ พร้อมมูล</p>
              <p className="text-sm text-white/80">หัวหน้าครูหอพักประจำระดับชั้น ม.6</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-yellow-300">11. นายคมกริช สุนทรา</p>
              <p className="text-sm text-white/80">หัวหน้าครูหอพักประจำระดับชั้น ม.5</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-yellow-300">12. นายบุญเติม วัฒนพรหม</p>
              <p className="text-sm text-white/80">หัวหน้าครูหอพักประจำระดับชั้น ม.4</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-yellow-300">13. นางสาวอรวิสาส์ กิจพิทักษ์</p>
              <p className="text-sm text-white/80">เจ้าหน้าที่งานสุขภาพอนามัย</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-yellow-300">14. นางสาวสิริกร ทองเมืองหลวง</p>
              <p className="text-sm text-white/80">เจ้าหน้าที่งานสุขภาพอนามัย</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-yellow-300">15. นายสุภัทรชัย ภาสะเตมีย์</p>
              <p className="text-sm text-white/80">เจ้าหน้าที่งานสุขภาพอนามัย</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-yellow-300">16. นางสาวรัตตินันท์ พัชรวุฒิพันธุ์</p>
              <p className="text-sm text-white/80">เจ้าหน้าที่งานสุขภาพอนามัย</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-yellow-300">17. นางสาวธารินันท์ สารพัน</p>
              <p className="text-sm text-white/80">เจ้าหน้าที่งานสุขภาพอนามัย</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-yellow-300">18. นางสาวสุชาวดี บูรณสมภพ</p>
              <p className="text-sm text-white/80">หัวหน้างานสุขภาพอนามัย (เลขานุการ)</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-yellow-300">19. นายวัชชิรทาน เข็มทอง</p>
              <p className="text-sm text-white/80">เจ้าหน้าที่งานสุขภาพอนามัย (ผู้ช่วยเลขานุการ)</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Questions Section */}
      <QuestionsSection />
    </div>
    </div>
  );
}
