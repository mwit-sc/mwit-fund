"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IBM_Plex_Sans_Thai } from 'next/font/google';

const ibmPlexSansThai = IBM_Plex_Sans_Thai({ 
  subsets: ['thai', 'latin'], 
  weight: ['100','200','300','400','500','600','700'], 
  display: 'swap' 
});

interface Question {
  id: number;
  question: string;
  answer: string;
  order: number;
}

export default function QuestionsPage() {
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
        setQuestions(data);
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

  return (
    <div className={`min-h-screen bg-gradient-to-b from-[#204396] to-[#152a5f] ${ibmPlexSansThai.className}`}>
      {/* Hero Section */}
      <section className="pt-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              คำถามที่พบบ่อย
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8">
              คำถามและคำตอบเกี่ยวกับสมาคมนักเรียนเก่าโรงเรียนมหิดลวิทยานุสรณ์
            </p>
          </motion.div>
        </div>
      </section>

      {/* Questions Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-xl text-white/80">กำลังโหลดคำถาม...</p>
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20"
                >
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="w-full p-6 text-left hover:bg-white/5 transition-colors duration-300 flex justify-between items-center"
                  >
                    <h3 className="text-lg md:text-xl font-semibold text-white pr-4">
                      {item.question}
                    </h3>
                    <div className={`transform transition-transform duration-300 ${
                      expandedItems.has(item.id) ? 'rotate-180' : ''
                    }`}>
                      <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <div className="px-6 pb-6 border-t border-white/10">
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
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">❓</div>
              <h3 className="text-2xl font-bold text-white mb-2">ยังไม่มีคำถาม</h3>
              <p className="text-white/70">คำถามจะแสดงที่นี่เมื่อมีการเพิ่มเข้าระบบ</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      {questions.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center border border-white/20"
            >
              <h3 className="text-2xl font-bold text-white mb-4">ไม่พบคำตอบที่ต้องการ?</h3>
              <p className="text-white/80 mb-6">
                หากคุณมีคำถามอื่นๆ ที่ไม่พบคำตอบในหน้านี้ สามารถติดต่อเราได้ผ่านช่องทางต่อไปนี้
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:alumni@mwit.ac.th"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  ส่งอีเมล
                </a>
                <a
                  href="/#contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-yellow-400 text-[#204396] font-semibold rounded-lg hover:bg-yellow-300 transition duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                  ส่งข้อความ
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}