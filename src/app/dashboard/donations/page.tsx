"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';

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

export default function DonationsPage() {
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

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
          created_by: 'admin'
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
      if (statusChangeData.newStatus !== 'pending') {
        await updateDonationStatus(statusChangeData.donation.id, statusChangeData.newStatus);
      }
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
    
    // Add hyperlinks to the evidence URL column
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: 11 });
      const cell = ws[cellRef];
      if (cell && cell.v && typeof cell.v === 'string' && cell.v.startsWith('http')) {
        cell.l = { Target: cell.v, Tooltip: 'คลิกเพื่อดูหลักฐานการโอนเงิน' };
        cell.s = {
          font: { color: { rgb: '0000FF' }, underline: true },
        };
      }
    }
    
    const colWidths = [
      { wch: 12 }, { wch: 20 }, { wch: 8 }, { wch: 12 }, { wch: 20 }, { wch: 25 },
      { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 12 }, { wch: 40 }
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'การบริจาค');
    XLSX.writeFile(wb, `donations_${new Date().toISOString().split('T')[0]}.xlsx`);
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
        <h2 className="text-2xl font-bold mb-2">จัดการการบริจาค</h2>
        <p className="text-white/70">อนุมัติ ปฏิเสธ และจัดการข้อมูลการบริจาค</p>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-6">
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

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-4 justify-center mb-8"
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
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8"
        >
          <h3 className="text-xl font-bold mb-6">เพิ่มรายการรายรับ-รายจ่าย</h3>
          
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

      {/* Donations Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
      >
        <h3 className="text-xl font-bold mb-6">รายการการบริจาค</h3>
        
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

      {/* Donation Detail Modal - I'll add this later to keep file manageable */}
      
      {/* Status Change Modal - I'll add this later to keep file manageable */}
    </div>
  );
}