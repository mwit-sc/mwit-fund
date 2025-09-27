"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IBM_Plex_Sans_Thai } from 'next/font/google';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import ProtectedRoute from '../components/ProtectedRoute';
import Avatar from '../components/Avatar';

const ibmPlexSansThai = IBM_Plex_Sans_Thai({ 
  subsets: ['thai', 'latin'], 
  weight: ['100','200','300','400','500','600','700'], 
  display: 'swap' 
});

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

export default function MyDonationsPage() {
  const { data: session } = useSession();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const fetchMyDonations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/donations');
      if (response.ok) {
        const data = await response.json();
        setDonations(data);
      }
    } catch (error) {
      console.error('Error fetching my donations:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-b from-[#204396] to-[#152a5f] text-white flex items-center justify-center ${ibmPlexSansThai.className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className={`min-h-screen bg-gradient-to-b from-[#204396] to-[#152a5f] text-white ${ibmPlexSansThai.className}`}>
        {/* Header */}
        <div className="py-16 px-4 bg-gradient-to-r from-[#204396] to-[#2a5ac9] text-center">
          {/* User Info and Logout */}
          <div className="flex justify-between items-center mb-10 max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>กลับสู่หน้าหลัก</span>
              </Link>
              <span className="text-white/50">|</span>
              <Link href="/donate" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>บริจาคอีกครั้ง</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {session?.user && (
                <div className="flex items-center space-x-3">
                  <Avatar 
                    src={session.user.image} 
                    name={session.user.name}
                    size="md"
                  />
                  <div className="text-left">
                    <p className="font-semibold">{session.user.name}</p>
                    <p className="text-sm text-white/70">{session.user.email}</p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition duration-300 flex items-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-4">ประวัติการบริจาคของฉัน</h1>
          <p className="text-xl max-w-2xl mx-auto">
            ดูประวัติการบริจาคทั้งหมดของคุณ
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Donations History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold mb-6">ประวัติการบริจาค</h2>
            
            {donations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="pb-3">วันที่</th>
                      <th className="pb-3">ชื่อผู้บริจาค</th>
                      <th className="pb-3">รุ่น</th>
                      <th className="pb-3">จำนวนเงิน</th>
                      <th className="pb-3">สถานะ</th>
                      <th className="pb-3">ใบเสร็จในนาม</th>
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
                          <span className={`px-2 py-1 rounded text-sm ${getStatusColor(donation.status)}`}>
                            {getStatusText(donation.status)}
                          </span>
                        </td>
                        <td className="py-3">
                          {donation.receipt_name || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">ยังไม่มีประวัติการบริจาค</h3>
                <p className="text-white/70 mb-6">คุณยังไม่เคยบริจาคเงิน เริ่มต้นบริจาคเพื่อช่วยเหลือน้องๆ กันเลย</p>
                <Link href="/donate">
                  <div className="inline-block px-6 py-3 bg-yellow-400 text-[#204396] font-bold rounded-lg hover:bg-yellow-300 transition duration-300">
                    บริจาคเลย
                  </div>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Summary Stats */}
          {donations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6"
            >
              <h2 className="text-2xl font-bold mb-6">สรุปการบริจาค</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-yellow-400">จำนวนครั้งที่บริจาค</h3>
                  <p className="text-3xl font-bold">{donations.length} ครั้ง</p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-yellow-400">ยอดบริจาครวม</h3>
                  <p className="text-3xl font-bold">
                    {donations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()} บาท
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-yellow-400">การบริจาคที่อนุมัติแล้ว</h3>
                  <p className="text-3xl font-bold">
                    {donations.filter(d => d.status === 'approved').length} ครั้ง
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}