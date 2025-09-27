"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IBM_Plex_Sans_Thai } from 'next/font/google';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const ibmPlexSansThai = IBM_Plex_Sans_Thai({ 
  subsets: ['thai', 'latin'], 
  weight: ['100','200','300','400','500','600','700'], 
  display: 'swap' 
});

interface GenerationStat {
  generation: string;
  total_amount: number;
  donor_count: number;
}

interface YearlyStat {
  academic_year: string;
  total_donations: number;
  total_expenses: number;
  total_income: number;
  donor_count: number;
  balance: number;
}

interface ExpenseRecord {
  id: number;
  title: string;
  description: string;
  amount: number;
  expense_type: 'income' | 'outcome';
  category: string;
  academic_year: string;
  expense_date: string;
  created_at: string;
}

export default function StatsPage() {
  const [generationStats, setGenerationStats] = useState<GenerationStat[]>([]);
  const [yearlyStats, setYearlyStats] = useState<YearlyStat[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('2567');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchExpenses(selectedYear);
    }
  }, [selectedYear]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [generationsRes, yearlyRes] = await Promise.all([
        fetch('/api/stats/generations'),
        fetch('/api/stats/yearly')
      ]);

      if (generationsRes.ok) {
        const generationData = await generationsRes.json();
        setGenerationStats(generationData);
      }

      if (yearlyRes.ok) {
        const yearlyData = await yearlyRes.json();
        setYearlyStats(yearlyData);
        if (yearlyData.length > 0 && !selectedYear) {
          setSelectedYear(yearlyData[0].academic_year);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async (year: string) => {
    try {
      const response = await fetch(`/api/expenses?year=${year}`);
      if (response.ok) {
        const expenseData = await response.json();
        setExpenses(expenseData);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  // Chart configurations
  const generationChartData = {
    labels: generationStats.map(stat => `รุ่น ${stat.generation}`),
    datasets: [
      {
        label: 'ยอดบริจาค (บาท)',
        data: generationStats.map(stat => stat.total_amount),
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
        borderColor: 'rgba(251, 191, 36, 1)',
        borderWidth: 2,
      },
    ],
  };

  const generationChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white',
          font: {
            family: 'IBM Plex Sans Thai',
          },
        },
      },
      title: {
        display: true,
        text: 'ยอดบริจาคแยกตามรุ่น',
        color: 'white',
        font: {
          family: 'IBM Plex Sans Thai',
          size: 18,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'white',
          callback: function(value: unknown) {
            return Number(value).toLocaleString() + ' ฿';
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  const currentYearData = yearlyStats.find(stat => stat.academic_year === selectedYear);
  const incomeOutcomeData = {
    labels: ['รายรับ', 'รายจ่าย', 'คงเหลือ'],
    datasets: [
      {
        data: [
          (currentYearData?.total_donations || 0) + (currentYearData?.total_income || 0),
          currentYearData?.total_expenses || 0,
          currentYearData?.balance || 0,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const yearlyTrendData = {
    labels: yearlyStats.map(stat => `ปี ${stat.academic_year}`),
    datasets: [
      {
        label: 'ยอดบริจาค',
        data: yearlyStats.map(stat => stat.total_donations),
        borderColor: 'rgba(251, 191, 36, 1)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        tension: 0.4,
      },
      {
        label: 'รายจ่าย',
        data: yearlyStats.map(stat => stat.total_expenses),
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
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
    <div className={`min-h-screen bg-gradient-to-b from-[#204396] to-[#152a5f] text-white ${ibmPlexSansThai.className}`}>
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
        
        <h1 className="text-3xl md:text-5xl font-bold mb-4">สถิติกองทุนแบ่งสรรปันน้อง</h1>
        <p className="text-xl max-w-2xl mx-auto">
          ข้อมูลสถิติการบริจาค รายรับ-รายจ่าย และแนวโน้มกองทุน
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        {/* Year Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
        >
          <label className="block text-lg font-semibold mb-4">เลือกปีการศึกษา:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            {yearlyStats.map(stat => (
              <option key={stat.academic_year} value={stat.academic_year} className="text-black">
                ปีการศึกษา {stat.academic_year}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Overview Cards */}
        {currentYearData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">ยอดบริจาครวม</h3>
              <p className="text-3xl font-bold">{currentYearData.total_donations.toLocaleString()} ฿</p>
            </div>
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">รายจ่ายรวม</h3>
              <p className="text-3xl font-bold">{currentYearData.total_expenses.toLocaleString()} ฿</p>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">ยอดคงเหลือ</h3>
              <p className="text-3xl font-bold">{currentYearData.balance.toLocaleString()} ฿</p>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">จำนวนผู้บริจาค</h3>
              <p className="text-3xl font-bold">{currentYearData.donor_count} คน</p>
            </div>
          </motion.div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generation Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
          >
            <Bar data={generationChartData} options={generationChartOptions} />
          </motion.div>

          {/* Income/Outcome Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
          >
            <h3 className="text-xl font-bold mb-4 text-center">รายรับ-รายจ่าย ปี {selectedYear}</h3>
            <Doughnut 
              data={incomeOutcomeData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: 'white',
                      font: {
                        family: 'IBM Plex Sans Thai',
                      },
                    },
                  },
                },
              }}
            />
          </motion.div>
        </div>

        {/* Yearly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-4">แนวโน้มตลอดปีการศึกษา</h3>
          <Line 
            data={yearlyTrendData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  labels: {
                    color: 'white',
                    font: {
                      family: 'IBM Plex Sans Thai',
                    },
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: 'white',
                    callback: function(value: unknown) {
                      return Number(value).toLocaleString() + ' ฿';
                    },
                  },
                  grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                  },
                },
                x: {
                  ticks: {
                    color: 'white',
                  },
                  grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                  },
                },
              },
            }}
          />
        </motion.div>

        {/* Expenses Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
        >
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="pb-3">วันที่</th>
                  <th className="pb-3">รายการ</th>
                  <th className="pb-3">ประเภท</th>
                  <th className="pb-3">จำนวนเงิน</th>
                  <th className="pb-3">หมวดหมู่</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-white/10">
                    <td className="py-3">
                      {new Date(expense.expense_date).toLocaleDateString('th-TH')}
                    </td>
                    <td className="py-3">{expense.title}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        expense.expense_type === 'income' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-red-600 text-white'
                      }`}>
                        {expense.expense_type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                      </span>
                    </td>
                    <td className="py-3 font-semibold">
                      {expense.amount.toLocaleString()} ฿
                    </td>
                    <td className="py-3">{expense.category || '-'}</td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-white/60">
                      ไม่มีข้อมูลรายรับ-รายจ่ายในปีนี้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}