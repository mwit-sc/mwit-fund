"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DashboardStats {
  totalDonations: number;
  totalDonors: number;
  pendingDonations: number;
  totalMessages: number;
  unreadMessages: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch donations stats
      const donationsResponse = await fetch('/api/donations');
      const donations = donationsResponse.ok ? await donationsResponse.json() : [];
      
      // Fetch messages stats
      const messagesResponse = await fetch('/api/messages');
      const messages = messagesResponse.ok ? await messagesResponse.json() : [];

      const stats: DashboardStats = {
        totalDonations: donations.reduce((sum: number, d: any) => sum + (d.status === 'approved' ? Number(d.amount) : 0), 0),
        totalDonors: donations.filter((d: any) => d.status === 'approved').length,
        pendingDonations: donations.filter((d: any) => d.status === 'pending').length,
        totalMessages: messages.length,
        unreadMessages: messages.filter((m: any) => !m.read).length,
      };

      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
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
        <h2 className="text-2xl font-bold mb-2">ภาพรวมระบบ</h2>
        <p className="text-white/70">สรุปข้อมูลสำคัญและสถิติการใช้งาน</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">💰</div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                {stats?.totalDonations.toLocaleString()} ฿
              </div>
              <div className="text-sm text-white/60">ยอดบริจาครวม</div>
            </div>
          </div>
          <div className="text-sm text-white/80">
            จาก {stats?.totalDonors} ผู้บริจาค
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">⏳</div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">
                {stats?.pendingDonations}
              </div>
              <div className="text-sm text-white/60">รอการอนุมัติ</div>
            </div>
          </div>
          <div className="text-sm text-white/80">
            การบริจาครออนุมัติ
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">💬</div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-400">
                {stats?.totalMessages}
              </div>
              <div className="text-sm text-white/60">ข้อความทั้งหมด</div>
            </div>
          </div>
          <div className="text-sm text-white/80">
            ยังไม่อ่าน: {stats?.unreadMessages}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">📊</div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-400">
                {((stats?.totalDonations || 0) / 750000 * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-white/60">ความคืบหนา</div>
            </div>
          </div>
          <div className="text-sm text-white/80">
            เป้าหมาย 750,000 ฿
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
      >
        <h3 className="text-xl font-bold mb-6">การดำเนินการด่วน</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <a
            href="/dashboard/donations"
            className="flex items-center p-4 bg-yellow-400/20 hover:bg-yellow-400/30 rounded-lg transition-colors group"
          >
            <div className="text-2xl mr-4">💰</div>
            <div>
              <div className="font-medium group-hover:text-yellow-300 transition-colors">
                จัดการการบริจาค
              </div>
              <div className="text-sm text-white/60">
                อนุมัติ/ปฏิเสธการบริจาค
              </div>
            </div>
          </a>

          <a
            href="/dashboard/messages"
            className="flex items-center p-4 bg-blue-400/20 hover:bg-blue-400/30 rounded-lg transition-colors group relative"
          >
            <div className="text-2xl mr-4">💬</div>
            <div>
              <div className="font-medium group-hover:text-blue-300 transition-colors">
                ตรวจสอบข้อความ
              </div>
              <div className="text-sm text-white/60">
                ข้อความจากผู้เยี่ยมชม
              </div>
            </div>
            {(stats?.unreadMessages || 0) > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {stats?.unreadMessages}
              </div>
            )}
          </a>

          <a
            href="/dashboard/users"
            className="flex items-center p-4 bg-cyan-400/20 hover:bg-cyan-400/30 rounded-lg transition-colors group"
          >
            <div className="text-2xl mr-4">👥</div>
            <div>
              <div className="font-medium group-hover:text-cyan-300 transition-colors">
                จัดการผู้ใช้
              </div>
              <div className="text-sm text-white/60">
                บทบาทและสิทธิ์
              </div>
            </div>
          </a>

          <a
            href="/dashboard/content"
            className="flex items-center p-4 bg-green-400/20 hover:bg-green-400/30 rounded-lg transition-colors group"
          >
            <div className="text-2xl mr-4">📝</div>
            <div>
              <div className="font-medium group-hover:text-green-300 transition-colors">
                จัดการเนื้อหา
              </div>
              <div className="text-sm text-white/60">
                แก้ไขหน้าแรก
              </div>
            </div>
          </a>

          <a
            href="/dashboard/qa"
            className="flex items-center p-4 bg-purple-400/20 hover:bg-purple-400/30 rounded-lg transition-colors group"
          >
            <div className="text-2xl mr-4">❓</div>
            <div>
              <div className="font-medium group-hover:text-purple-300 transition-colors">
                คำถาม-คำตอบ
              </div>
              <div className="text-sm text-white/60">
                จัดการ FAQ
              </div>
            </div>
          </a>
        </div>
      </motion.div>
    </div>
  );
}