"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface QuestionItem {
  id: number;
  question: string;
  answer: string;
  order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface QuestionForm {
  question: string;
  answer: string;
  order: string;
  active: boolean;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<QuestionForm>({
    question: '',
    answer: '',
    order: '0',
    active: true,
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/qa');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching Questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingQuestion ? `/api/qa/${editingQuestion.id}` : '/api/qa';
      const method = editingQuestion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          order: parseInt(form.order),
        }),
      });

      if (response.ok) {
        toast.success(editingQuestion ? 'อัปเดตคำถามเรียบร้อยแล้ว' : 'เพิ่มคำถามเรียบร้อยแล้ว');
        setForm({
          question: '',
          answer: '',
          order: '0',
          active: true,
        });
        setEditingQuestion(null);
        setShowForm(false);
        fetchQuestions();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (error) {
      console.error('Error submitting Question:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (question: QuestionItem) => {
    setEditingQuestion(question);
    setForm({
      question: question.question,
      answer: question.answer,
      order: question.order.toString(),
      active: question.active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณต้องการลบคำถามนี้หรือไม่?')) return;

    try {
      const response = await fetch(`/api/qa/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('ลบคำถามเรียบร้อยแล้ว');
        fetchQuestions();
      } else {
        toast.error('เกิดข้อผิดพลาดในการลบ');
      }
    } catch (error) {
      console.error('Error deleting Question:', error);
      toast.error('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const cancelEdit = () => {
    setEditingQuestion(null);
    setForm({
      question: '',
      answer: '',
      order: '0',
      active: true,
    });
    setShowForm(false);
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
        <h2 className="text-2xl font-bold mb-2">จัดการคำถาม-คำตอบ</h2>
        <p className="text-white/70">จัดการคำถามและคำตอบที่พบบ่อยสำหรับผู้เยี่ยมชม</p>
      </div>

      {/* Add Q&A Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-yellow-400 text-[#204396] font-bold rounded-lg hover:bg-yellow-300 transition duration-300"
        >
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>{editingQuestion ? 'แก้ไขคำถาม' : 'เพิ่มคำถามใหม่'}</span>
          </div>
        </button>
      </motion.div>

      {/* Q&A Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8"
        >
          <h3 className="text-xl font-bold mb-6">
            {editingQuestion ? 'แก้ไขคำถาม' : 'เพิ่มคำถามใหม่'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 font-medium">คำถาม *</label>
              <textarea
                name="question"
                value={form.question}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                placeholder="ใส่คำถามที่พบบ่อย"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">คำตอบ *</label>
              <textarea
                name="answer"
                value={form.answer}
                onChange={handleInputChange}
                rows={5}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                placeholder="ใส่คำตอบที่ชัดเจนและครบถ้วน"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-medium">ลำดับการแสดง</label>
                <input
                  type="number"
                  name="order"
                  value={form.order}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="active"
                    checked={form.active}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-yellow-400 bg-white/10 border-white/20 rounded focus:ring-yellow-400"
                  />
                  <span>แสดงคำถามนี้</span>
                </label>
              </div>
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
                {submitting ? 'กำลังบันทึก...' : (editingQuestion ? 'อัปเดต' : 'บันทึก')}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 py-3 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30 transition duration-300"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Q&A List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
      >
        <h3 className="text-xl font-bold mb-6">รายการคำถาม-คำตอบ</h3>
        
        <div className="space-y-4">
          {questions.map((question) => (
            <div
              key={question.id}
              className="bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      question.active ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                    }`}>
                      {question.active ? 'แสดง' : 'ซ่อน'}
                    </span>
                    <span className="text-sm text-white/60">
                      ลำดับ: {question.order}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="font-semibold text-yellow-400 mb-2 flex items-start">
                      <span className="text-yellow-400 mr-2 text-lg">❓</span>
                      {question.question}
                    </h4>
                    <div className="ml-6">
                      <p className="text-white/80 whitespace-pre-wrap">
                        {question.answer.length > 200 
                          ? `${question.answer.substring(0, 200)}...` 
                          : question.answer
                        }
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-white/50">
                    สร้างเมื่อ: {new Date(question.created_at).toLocaleDateString('th-TH')}
                    {question.updated_at !== question.created_at && (
                      <span> • อัปเดตเมื่อ: {new Date(question.updated_at).toLocaleDateString('th-TH')}</span>
                    )}
                  </p>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(question)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {questions.length === 0 && (
            <div className="text-center py-8 text-white/60">
              ยังไม่มีคำถาม
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}