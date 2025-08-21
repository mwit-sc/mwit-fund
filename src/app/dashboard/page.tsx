"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IBM_Plex_Sans_Thai } from 'next/font/google';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import AdminRoute from '../components/AdminRoute';
import * as XLSX from 'xlsx';

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
  receipt_name?: string;
  donor_email?: string;
  tax_id?: string;
  address?: string;
  publication_consent?: string;
  slip_image_url?: string;
}

interface ExpenseForm {
  title: string;
  description: string;
  amount: string;
  expense_type: 'income' | 'outcome';
  category: string;
  academic_year: string;
  expense_date: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [statusChangeData, setStatusChangeData] = useState<{donation: Donation | null, newStatus: 'pending' | 'approved' | 'rejected'}>({donation: null, newStatus: 'pending'});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [expenseForm, setExpenseForm] = useState<ExpenseForm>({
    title: '',
    description: '',
    amount: '',
    expense_type: 'outcome',
    category: '',
    academic_year: '2567',
    expense_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/donations');
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

  const updateDonationStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/donations/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setDonations(donations.map(d => 
          d.id === id ? { ...d, status } : d
        ));
        setMessage({ type: 'success', text: 'อัพเดทสถานะเรียบร้อยแล้ว' });
      } else {
        setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการอัพเดทสถานะ' });
      }
    } catch (error) {
      console.error('Error updating donation status:', error);
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการอัพเดทสถานะ' });
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...expenseForm,
          amount: parseFloat(expenseForm.amount),
          created_by: session?.user?.email || 'admin'
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'เพิ่มรายการรายรับ-รายจ่ายเรียบร้อยแล้ว' });
        setExpenseForm({
          title: '',
          description: '',
          amount: '',
          expense_type: 'outcome',
          category: '',
          academic_year: '2567',
          expense_date: new Date().toISOString().split('T')[0]
        });
        setShowExpenseForm(false);
      } else {
        setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเพิ่มรายการ' });
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเพิ่มรายการ' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExpenseForm(prev => ({ ...prev, [name]: value }));
  };

  const showDonationDetail = (donation: Donation) => {
    setSelectedDonation(donation);
    setShowDetailModal(true);
  };

  const openStatusChangeModal = (donation: Donation) => {
    setStatusChangeData({donation, newStatus: donation.status});
    setShowStatusChangeModal(true);
  };

  const confirmStatusChange = async () => {
    if (!statusChangeData.donation) return;
    
    try {
      await updateDonationStatus(statusChangeData.donation.id, statusChangeData.newStatus);
      setShowStatusChangeModal(false);
      setStatusChangeData({donation: null, newStatus: 'pending'});
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  const exportToCSV = () => {
    const csvData = donations.map(donation => ({
      'วันที่': new Date(donation.created_at).toLocaleDateString('th-TH'),
      'ชื่อผู้บริจาค': donation.donor_name,
      'รุ่น': donation.generation,
      'จำนวนเงิน': donation.amount,
      'ออกใบเสร็จในนาม': donation.receipt_name || '',
      'อีเมล': donation.donor_email || '',
      'ข้อมูลติดต่อ': donation.contact_info || '',
      'เลขประจำตัวผู้เสียภาษี': donation.tax_id || '',
      'ที่อยู่': donation.address || '',
      'การเผยแพร่ข้อมูล': donation.publication_consent === 'full' ? 'เผยแพร่ข้อมูลทั้งหมด' : 
                        donation.publication_consent === 'name_only' ? 'เผยแพร่เฉพาะชื่อ' : 
                        donation.publication_consent === 'anonymous' ? 'ไม่เผยแพร่ข้อมูล' : '',
      'สถานะ': donation.status === 'approved' ? 'อนุมัติ' : donation.status === 'rejected' ? 'ปฏิเสธ' : 'รอดำเนินการ',
      'URL หลักฐาน': donation.slip_image_url || ''
    }));

    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'การบริจาค');
    XLSX.writeFile(wb, `donations_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportToExcel = () => {
    const excelData = donations.map(donation => ({
      'วันที่': new Date(donation.created_at).toLocaleDateString('th-TH'),
      'ชื่อผู้บริจาค': donation.donor_name,
      'รุ่น': donation.generation,
      'จำนวนเงิน': donation.amount,
      'ออกใบเสร็จในนาม': donation.receipt_name || '',
      'อีเมล': donation.donor_email || '',
      'ข้อมูลติดต่อ': donation.contact_info || '',
      'เลขประจำตัวผู้เสียภาษี': donation.tax_id || '',
      'ที่อยู่': donation.address || '',
      'การเผยแพร่ข้อมูล': donation.publication_consent === 'full' ? 'เผยแพร่ข้อมูลทั้งหมด' : 
                        donation.publication_consent === 'name_only' ? 'เผยแพร่เฉพาะชื่อ' : 
                        donation.publication_consent === 'anonymous' ? 'ไม่เผยแพร่ข้อมูล' : '',
      'สถานะ': donation.status === 'approved' ? 'อนุมัติ' : donation.status === 'rejected' ? 'ปฏิเสธ' : 'รอดำเนินการ',
      'URL หลักฐาน': donation.slip_image_url || ''
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Add hyperlinks to the evidence URL column (column L, which is the 12th column)
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: 11 }); // Column L (0-indexed = 11)
      const cell = ws[cellRef];
      if (cell && cell.v && typeof cell.v === 'string' && cell.v.startsWith('http')) {
        // Create hyperlink
        cell.l = { Target: cell.v, Tooltip: 'คลิกเพื่อดูหลักฐานการโอนเงิน' };
        // Style the cell to look like a link
        cell.s = {
          font: { color: { rgb: '0000FF' }, underline: true },
        };
      }
    }
    
    // Set column widths for better readability
    const colWidths = [
      { wch: 12 }, // วันที่
      { wch: 20 }, // ชื่อผู้บริจาค
      { wch: 8 },  // รุ่น
      { wch: 12 }, // จำนวนเงิน
      { wch: 20 }, // ออกใบเสร็จในนาม
      { wch: 25 }, // อีเมล
      { wch: 15 }, // ข้อมูลติดต่อ
      { wch: 15 }, // เลขประจำตัวผู้เสียภาษี
      { wch: 30 }, // ที่อยู่
      { wch: 20 }, // การเผยแพร่ข้อมูล
      { wch: 12 }, // สถานะ
      { wch: 40 }  // URL หลักฐาน
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'การบริจาค');
    XLSX.writeFile(wb, `donations_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
    <AdminRoute>
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
              <Link href="/stats" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>ดูสถิติ</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {session?.user && (
                <div className="flex items-center space-x-3">
                  <img 
                    src={session.user.image || '/img/alumni.png'} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full"
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
          
          <h1 className="text-3xl md:text-5xl font-bold mb-4">แดชบอร์ดจัดการข้อมูล</h1>
          <p className="text-xl max-w-2xl mx-auto">
            จัดการการบริจาค รายรับ-รายจ่าย และข้อมูลกองทุน
          </p>
        </div>

      {/* Message */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
            }`}
          >
            {message.text}
          </motion.div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <button
            onClick={() => setShowExpenseForm(!showExpenseForm)}
            className="px-6 py-3 bg-yellow-400 text-[#204396] font-bold rounded-lg hover:bg-yellow-300 transition duration-300"
          >
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>เพิ่มรายรับ-รายจ่าย</span>
            </div>
          </button>
          
          <button
            onClick={exportToCSV}
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition duration-300"
          >
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>ส่งออก CSV</span>
            </div>
          </button>
          
          <button
            onClick={exportToExcel}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-300"
          >
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>ส่งออก Excel</span>
            </div>
          </button>
        </motion.div>

        {/* Expense Form */}
        {showExpenseForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold mb-6">เพิ่มรายการรายรับ-รายจ่าย</h2>
            
            <form onSubmit={handleExpenseSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium">ชื่อรายการ *</label>
                  <input
                    type="text"
                    name="title"
                    value={expenseForm.title}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">จำนวนเงิน (บาท) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={expenseForm.amount}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">ประเภท *</label>
                  <select
                    name="expense_type"
                    value={expenseForm.expense_type}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                    required
                  >
                    <option value="outcome" className="text-black">รายจ่าย</option>
                    <option value="income" className="text-black">รายรับ</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium">หมวดหมู่</label>
                  <input
                    type="text"
                    name="category"
                    value={expenseForm.category}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                    placeholder="เช่น ทุนการศึกษา, ค่าใช้จ่ายดำเนินงาน"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">ปีการศึกษา *</label>
                  <input
                    type="text"
                    name="academic_year"
                    value={expenseForm.academic_year}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                    placeholder="เช่น 2567"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">วันที่ *</label>
                  <input
                    type="date"
                    name="expense_date"
                    value={expenseForm.expense_date}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">รายละเอียด</label>
                <textarea
                  name="description"
                  value={expenseForm.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                  placeholder="รายละเอียดเพิ่มเติม"
                />
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
                  {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowExpenseForm(false)}
                  className="flex-1 py-3 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30 transition duration-300"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Donations Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
        >
          <h2 className="text-2xl font-bold mb-6">จัดการการบริจาค</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="pb-3">วันที่</th>
                  <th className="pb-3">ชื่อผู้บริจาค</th>
                  <th className="pb-3">รุ่น</th>
                  <th className="pb-3">จำนวนเงิน</th>
                  <th className="pb-3">สถานะ</th>
                  <th className="pb-3">การดำเนินการ</th>
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
                      <span className={`px-2 py-1 rounded text-sm ${
                        donation.status === 'approved' 
                          ? 'bg-green-600 text-white'
                          : donation.status === 'rejected'
                          ? 'bg-red-600 text-white'
                          : 'bg-yellow-600 text-white'
                      }`}>
                        {donation.status === 'approved' ? 'อนุมัติ' : 
                         donation.status === 'rejected' ? 'ปฏิเสธ' : 'รอดำเนินการ'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => showDonationDetail(donation)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                        >
                          รายละเอียด
                        </button>
                        <button
                          onClick={() => openStatusChangeModal(donation)}
                          className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition"
                        >
                          เปลี่ยนสถานะ
                        </button>
                        {donation.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateDonationStatus(donation.id, 'approved')}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                            >
                              อนุมัติ
                            </button>
                            <button
                              onClick={() => updateDonationStatus(donation.id, 'rejected')}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                            >
                              ปฏิเสธ
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {donations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-white/60">
                      ไม่มีข้อมูลการบริจาค
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Donation Detail Modal */}
      {showDetailModal && selectedDonation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">รายละเอียดการบริจาค</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ชื่อผู้บริจาค</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{selectedDonation.donor_name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">รุ่น</label>
                    <p className="mt-1 text-lg text-gray-900">รุ่น {selectedDonation.generation}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">จำนวนเงิน</label>
                    <p className="mt-1 text-2xl font-bold text-green-600">{selectedDonation.amount.toLocaleString()} บาท</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ออกใบเสร็จในนาม</label>
                    <p className="mt-1 text-lg text-gray-900">{selectedDonation.receipt_name || '-'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">เลขประจำตัวผู้เสียภาษี</label>
                    <p className="mt-1 text-lg text-gray-900 font-mono">{selectedDonation.tax_id || '-'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">วันที่บริจาค</label>
                    <p className="mt-1 text-lg text-gray-900">{new Date(selectedDonation.created_at).toLocaleDateString('th-TH', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">อีเมล</label>
                    <p className="mt-1 text-lg text-gray-900">{selectedDonation.donor_email || '-'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ข้อมูลติดต่อ</label>
                    <p className="mt-1 text-lg text-gray-900">{selectedDonation.contact_info || '-'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ที่อยู่</label>
                    <p className="mt-1 text-lg text-gray-900 leading-relaxed">{selectedDonation.address || '-'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">การเผยแพร่ข้อมูล</label>
                    <p className="mt-1 text-lg text-gray-900">
                      {selectedDonation.publication_consent === 'full' ? 'เผยแพร่ข้อมูลทั้งหมด' : 
                       selectedDonation.publication_consent === 'name_only' ? 'เผยแพร่เฉพาะชื่อ' : 
                       selectedDonation.publication_consent === 'anonymous' ? 'ไม่เผยแพร่ข้อมูล' : '-'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">สถานะ</label>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                      selectedDonation.status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : selectedDonation.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedDonation.status === 'approved' ? 'อนุมัติแล้ว' : 
                       selectedDonation.status === 'rejected' ? 'ปฏิเสธแล้ว' : 'รอดำเนินการ'}
                    </span>
                  </div>

                  {selectedDonation.slip_image_url && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">หลักฐานการโอนเงิน</label>
                      <div className="mt-2">
                        <img 
                          src={selectedDonation.slip_image_url} 
                          alt="หลักฐานการโอนเงิน"
                          className="max-w-full h-auto rounded-lg border border-gray-300"
                          style={{ maxHeight: '200px' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  {selectedDonation.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          updateDonationStatus(selectedDonation.id, 'approved');
                          setShowDetailModal(false);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        อนุมัติ
                      </button>
                      <button
                        onClick={() => {
                          updateDonationStatus(selectedDonation.id, 'rejected');
                          setShowDetailModal(false);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        ปฏิเสธ
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      {showStatusChangeModal && statusChangeData.donation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">เปลี่ยนสถานะการบริจาค</h3>
              <p className="text-gray-600">
                เปลี่ยนสถานะของการบริจาคจาก <strong>{statusChangeData.donation.donor_name}</strong>
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">สถานะปัจจุบัน:</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    statusChangeData.donation.status === 'approved' 
                      ? 'bg-green-100 text-green-800'
                      : statusChangeData.donation.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {statusChangeData.donation.status === 'approved' ? 'อนุมัติแล้ว' : 
                     statusChangeData.donation.status === 'rejected' ? 'ปฏิเสธแล้ว' : 'รอดำเนินการ'}
                  </span>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {statusChangeData.donation.amount.toLocaleString()} บาท
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เลือกสถานะใหม่:</label>
                <select
                  value={statusChangeData.newStatus}
                  onChange={(e) => setStatusChangeData(prev => ({
                    ...prev,
                    newStatus: e.target.value as 'pending' | 'approved' | 'rejected'
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                >
                  <option value="pending">รอดำเนินการ</option>
                  <option value="approved">อนุมัติ</option>
                  <option value="rejected">ปฏิเสธ</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={confirmStatusChange}
                  disabled={statusChangeData.newStatus === statusChangeData.donation.status}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition duration-300 ${
                    statusChangeData.newStatus === statusChangeData.donation.status
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  ยืนยันการเปลี่ยนแปลง
                </button>
                <button
                  onClick={() => setShowStatusChangeModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300 font-medium"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
    </AdminRoute>
  );
}