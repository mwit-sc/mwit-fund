"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { IBM_Plex_Sans_Thai } from 'next/font/google';
import { createClient } from '@supabase/supabase-js';

const ibmPlexSansThai = IBM_Plex_Sans_Thai({ 
  subsets: ['thai', 'latin'], 
  weight: ['100','200','300','400','500','600','700'], 
  display: 'swap' 
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ? createClient(supabaseUrl, supabaseKey) : undefined;

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

export default function DonatePage() {
  const [currentStep, setCurrentStep] = useState(1);
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
  const [stats, setStats] = useState({
    totalDonation: 0,
    totalDonors: 0,
    targetAmount: 750000
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return;
    }
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from('donation_stats')
          .select('*')
          .single();

        if (error) throw error;

        if (data) {
          setStats({
            totalDonation: data.total_amount || 0,
            totalDonors: data.total_donors || 0,
            targetAmount: data.target_amount || 750000
          });
        }
      } catch (error) {
        console.error('Error fetching donation stats:', error);
      }
    };

    fetchStats();
  }, []);

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
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return;
    }
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (!donationData.donorName || !donationData.generation || !donationData.contactInfo || !donationData.slip) {
        throw new Error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ช่องที่มีเครื่องหมาย *)');
      }

      const fileExt = (donationData.slip as File).name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('donationslips')
        .upload(fileName, donationData.slip);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('donationslips')
        .getPublicUrl(fileName);

      const slipUrl = publicUrlData.publicUrl;

      const { error } = await supabase
        .from('donations')
        .insert([
          {
            donor_name: donationData.donorName,
            generation: donationData.generation,
            amount: parseFloat(donationData.amount) || 0,
            receipt_name: donationData.receiptName,
            donor_email: donationData.email,
            tax_id: donationData.taxId,
            address: donationData.address,
            contact_info: donationData.contactInfo,
            publication_consent: donationData.publicationConsent,
            slip_image_url: slipUrl,
            status: 'pending'
          }
        ]);

      if (error) throw error;

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

  const progressPercentage = Math.min(100, (stats.totalDonation / stats.targetAmount) * 100);

  // The rest of your component (JSX) remains unchanged.
  // You already have a large return block for rendering the page, which is syntactically correct.
  // No need to copy again unless you request.

  return (
    <div>
      <div className={`min-h-screen bg-gradient-to-b from-[#204396] to-[#152a5f] text-white pb-20 ${ibmPlexSansThai.className}`}>
      {/* Header */}
      <div className="py-16 px-4 bg-gradient-to-r from-[#204396] to-[#2a5ac9] text-center">
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
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
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
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
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
            className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-lg max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-bold mb-6">ข้อมูลผู้บริจาค</h2>
            
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
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                  placeholder="กรอกชื่อ-นามสกุล" 
                  required
                />
              </div>
              
              <div>
                <label htmlFor="generation" className="block mb-2 font-medium">
                  รุ่น <span className="text-yellow-400">*</span>
                </label>
                <input 
                  type="text" 
                  id="generation" 
                  name="generation"
                  value={donationData.generation}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
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
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
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
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
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
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
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
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
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
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
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
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
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
            className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-lg max-w-3xl mx-auto"
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
                  disabled={isSubmitting || !donationData.slip}
                  className={`w-1/2 py-3 font-bold rounded-lg transition duration-300 ${
                    isSubmitting || !donationData.slip
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
            className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-lg max-w-3xl mx-auto text-center"
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
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-lg">
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
    </div>
    </div>
  );
}
