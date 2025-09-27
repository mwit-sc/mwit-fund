"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  admin_note?: string;
  created_at: string;
  read: boolean;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);


  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessageDetail = (message: Message) => {
    setSelectedMessage(message);
    setNoteText(message.admin_note || '');
    setEditingNote(false);
    setShowMessageModal(true);
    if (!message.read) {
      markMessageAsRead(message.id);
    }
  };

  const saveNote = async () => {
    if (!selectedMessage) return;

    try {
      const response = await fetch(`/api/messages/${selectedMessage.id}/note`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ admin_note: noteText }),
      });

      if (response.ok) {
        const updatedMessage = await response.json();
        setMessages(messages.map(m => 
          m.id === selectedMessage.id ? { ...m, admin_note: updatedMessage.admin_note } : m
        ));
        setSelectedMessage({ ...selectedMessage, admin_note: updatedMessage.admin_note });
        setEditingNote(false);
        toast.success('บันทึกโน้ตเรียบร้อยแล้ว');
      } else {
        toast.error('เกิดข้อผิดพลาดในการบันทึกโน้ต');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกโน้ต');
    }
  };

  const markMessageAsRead = async (messageId: number) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setMessages(messages.map(m => 
          m.id === messageId ? { ...m, read: true } : m
        ));
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
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
        <h2 className="text-2xl font-bold mb-2">ข้อความจากผู้เยี่ยมชม</h2>
        <p className="text-white/70">จัดการข้อความที่ส่งผ่านแบบฟอร์มติดต่อ</p>
      </div>


      {/* Messages Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">รายการข้อความ</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              ทั้งหมด: {messages.length} | 
              ยังไม่อ่าน: <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs ml-1">
                {messages.filter(m => !m.read).length}
              </span>
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/20">
                <th className="pb-3">วันที่</th>
                <th className="pb-3">ชื่อ</th>
                <th className="pb-3">อีเมล</th>
                <th className="pb-3">ข้อความ (ตัวอย่าง)</th>
                <th className="pb-3">โน้ต</th>
                <th className="pb-3">สถานะ</th>
                <th className="pb-3">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id} className={`border-b border-white/10 ${!message.read ? 'bg-blue-600/10' : ''}`}>
                  <td className="py-3">
                    {new Date(message.created_at).toLocaleDateString('th-TH')}
                  </td>
                  <td className="py-3 font-medium">{message.name}</td>
                  <td className="py-3">{message.email}</td>
                  <td className="py-3 max-w-xs">
                    <div className="truncate">
                      {message.message.length > 50 
                        ? `${message.message.substring(0, 50)}...` 
                        : message.message
                      }
                    </div>
                  </td>
                  <td className="py-3 max-w-xs">
                    {message.admin_note ? (
                      <div className="truncate text-yellow-400 text-sm">
                        {message.admin_note.length > 30 
                          ? `${message.admin_note.substring(0, 30)}...` 
                          : message.admin_note
                        }
                      </div>
                    ) : (
                      <span className="text-white/40 text-sm">-</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      message.read
                        ? 'bg-gray-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}>
                      {message.read ? 'อ่านแล้ว' : 'ยังไม่อ่าน'}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => showMessageDetail(message)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                    >
                      อ่านข้อความ
                    </button>
                  </td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-white/60">
                    ไม่มีข้อความ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Message Detail Modal */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">รายละเอียดข้อความ</h3>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ชื่อผู้ส่ง</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{selectedMessage.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">อีเมล</label>
                    <p className="mt-1 text-lg text-gray-900">
                      <a 
                        href={`mailto:${selectedMessage.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {selectedMessage.email}
                      </a>
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">วันที่ส่ง</label>
                    <p className="mt-1 text-lg text-gray-900">{new Date(selectedMessage.created_at).toLocaleDateString('th-TH', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">สถานะ</label>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                      selectedMessage.read 
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedMessage.read ? 'อ่านแล้ว' : 'ยังไม่อ่าน'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-3">ข้อความ</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Admin Notes Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-600">โน้ตสำหรับแอดมิน</label>
                    <button
                      onClick={() => setEditingNote(!editingNote)}
                      className="text-sm text-blue-600 hover:text-blue-800 transition"
                    >
                      {editingNote ? 'ยกเลิก' : 'แก้ไข'}
                    </button>
                  </div>
                  
                  {editingNote ? (
                    <div className="space-y-3">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 bg-white"
                        placeholder="เพิ่มโน้ตสำหรับการติดตาม หรือข้อมูลเพิ่มเติม..."
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={saveNote}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                        >
                          บันทึก
                        </button>
                        <button
                          onClick={() => {
                            setEditingNote(false);
                            setNoteText(selectedMessage.admin_note || '');
                          }}
                          className="px-4 py-2 bg-gray-400 text-white text-sm rounded-lg hover:bg-gray-500 transition"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      {selectedMessage.admin_note ? (
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.admin_note}</p>
                      ) : (
                        <p className="text-gray-500 italic">ไม่มีโน้ต (คลิก "แก้ไข" เพื่อเพิ่มโน้ต)</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ข้อความจากเว็บไซต์สมาคมนักเรียนเก่า&body=เรียน คุณ${selectedMessage.name},%0A%0A`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>ตอบกลับทางอีเมล</span>
                  </a>
                  <button
                    onClick={() => setShowMessageModal(false)}
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
    </div>
  );
}