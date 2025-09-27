"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Avatar from '../../components/Avatar';

interface User {
  id: number;
  email: string;
  name: string | null;
  image_url: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: 'user' | 'admin') => {
    if (updatingUserId) return;

    if (!confirm(`คุณต้องการเปลี่ยนบทบาทของผู้ใช้นี้เป็น ${newRole === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'} หรือไม่?`)) {
      return;
    }

    try {
      setUpdatingUserId(userId);
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(user => 
          user.id === userId ? updatedUser : user
        ));
        toast.success('อัปเดตบทบาทผู้ใช้เรียบร้อยแล้ว');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'เกิดข้อผิดพลาดในการอัปเดตบทบาท');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตบทบาท');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string | null) => {
    if (!confirm(`คุณต้องการลบผู้ใช้ "${userName || 'ไม่มีชื่อ'}" หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
        toast.success('ลบผู้ใช้เรียบร้อยแล้ว');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'เกิดข้อผิดพลาดในการลบผู้ใช้');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('เกิดข้อผิดพลาดในการลบผู้ใช้');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <h2 className="text-2xl font-bold mb-2">จัดการผู้ใช้</h2>
        <p className="text-white/70">จัดการบทบาทและสิทธิ์ของผู้ใช้ในระบบ</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">👥</div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-400">
                {users.length}
              </div>
              <div className="text-sm text-white/60">ผู้ใช้ทั้งหมด</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">👑</div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">
                {users.filter(user => user.role === 'admin').length}
              </div>
              <div className="text-sm text-white/60">ผู้ดูแลระบบ</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">👤</div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                {users.filter(user => user.role === 'user').length}
              </div>
              <div className="text-sm text-white/60">ผู้ใช้ทั่วไป</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
      >
        <h3 className="text-xl font-bold mb-6">รายชื่อผู้ใช้</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4">ผู้ใช้</th>
                <th className="text-left py-3 px-4">อีเมล</th>
                <th className="text-left py-3 px-4">บทบาท</th>
                <th className="text-left py-3 px-4">สมัครเมื่อ</th>
                <th className="text-right py-3 px-4">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr 
                  key={user.id} 
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <Avatar 
                        src={user.image_url} 
                        name={user.name}
                        size="md"
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-white">
                          {user.name || 'ไม่มีชื่อ'}
                        </div>
                        <div className="text-sm text-white/60">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white/80">{user.email}</span>
                  </td>
                  <td className="py-4 px-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin')}
                      disabled={updatingUserId === user.id}
                      className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      <option value="user">ผู้ใช้ทั่วไป</option>
                      <option value="admin">ผู้ดูแลระบบ</option>
                    </select>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white/60 text-sm">
                      {formatDate(user.created_at)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                      disabled={updatingUserId === user.id}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && (
            <div className="text-center py-8 text-white/60">
              ไม่พบข้อมูลผู้ใช้
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}