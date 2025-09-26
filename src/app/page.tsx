"use client";

import Link from "next/link";
import { IBM_Plex_Sans_Thai } from 'next/font/google';
import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ibmPlexSansThai = IBM_Plex_Sans_Thai({ 
  subsets: ['thai', 'latin'], 
  weight: ['100','200','300','400','500','600','700'], 
  display: 'swap' 
});

export default function Home() {
  const [, setScrollY] = useState(0);
  const [messageForm, setMessageForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMessageForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageForm.name || !messageForm.email || !messageForm.message) {
      toast.error('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    setIsSubmitting(true);
    
    // Show loading toast
    const loadingToast = toast.loading('กำลังส่งข้อความ...');
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageForm),
      });

      if (response.ok) {
        toast.success('ส่งข้อความเรียบร้อยแล้ว เราจะติดต่อกลับในไม่ช้า', {
          id: loadingToast,
        });
        setMessageForm({ name: '', email: '', message: '' });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'เกิดข้อผิดพลาดในการส่งข้อความ', {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error('Error submitting message:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งข้อความ', {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-[#204396] to-[#152a5f] ${ibmPlexSansThai.className}`}>
      {/* Hero Section */}
      <div className="relative h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0" 
          style={{ 
            backgroundImage: "url('/img/mwit-building.jpg')", 
            opacity: 0.4 
          }}
        />
        
        <div className="relative z-10 flex flex-col items-center justify-center p-5 text-white px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img 
              src="/img/alumni.png" 
              alt="MWIT Alumni Logo" 
              className="rounded w-32 h-32 md:w-40 md:h-40 mb-6" 
            />
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            สมาคมนักเรียนเก่า<br/>โรงเรียนมหิดลวิทยานุสรณ์
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl max-w-2xl mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            เชื่อมโยงอดีต สร้างสรรค์ปัจจุบัน เพื่ออนาคตที่ยั่งยืน
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link href="/donate">
              <div className="px-8 py-3 bg-yellow-400 text-[#204396] font-bold rounded-full text-lg hover:bg-yellow-300 transition duration-300 shadow-lg">
                บริจาคกองทุนแบ่งสรรปันน้อง
              </div>
            </Link>
            <Link href="#about">
              <div className="px-8 py-3 bg-white/20 text-white font-bold rounded-full text-lg hover:bg-white/30 transition duration-300 backdrop-blur-sm">
                เกี่ยวกับสมาคม
              </div>
            </Link>
          </motion.div>
          <div className="pt-8 bottom-10 left-1/2 transform -translate-x-1/2 z-10">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">เกี่ยวกับสมาคม</h2>
            <div className="w-20 h-1 bg-yellow-400 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img 
                src="/img/mob.png" 
                alt="MWIT Alumni Group" 
                className="rounded-lg shadow-xl w-full object-cover h-[400px]" 
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-white"
            >
              <h3 className="text-2xl font-bold mb-4 text-yellow-400">พันธกิจของเรา</h3>
              <p className="text-lg mb-6">
                สมาคมนักเรียนเก่าโรงเรียนมหิดลวิทยานุสรณ์ ก่อตั้งขึ้นเพื่อเป็นศูนย์กลางในการเชื่อมโยงนักเรียนเก่าทุกรุ่น 
                สร้างเครือข่ายความร่วมมือ และส่งเสริมการพัฒนาศักยภาพของนักเรียนปัจจุบัน
              </p>
              
              <h3 className="text-2xl font-bold mb-4 text-yellow-400">เป้าหมายของเรา</h3>
              <ul className="space-y-2 mb-6 list-disc pl-5">
                <li>สร้างชุมชนและเครือข่ายนักเรียนเก่าที่เข้มแข็ง</li>
                <li>สนับสนุนการศึกษาและกิจกรรมของนักเรียนปัจจุบัน</li>
                <li>ส่งเสริมการพัฒนาศักยภาพทางวิชาการและการสร้างนวัตกรรม</li>
                <li>ร่วมพัฒนาการศึกษาวิทยาศาสตร์และเทคโนโลยีของประเทศ</li>
              </ul>
              
              <Link href="/donate">
                <div className="inline-block px-6 py-3 bg-yellow-400 text-[#204396] font-bold rounded-full text-lg hover:bg-yellow-300 transition duration-300 shadow-lg">
                  ร่วมสนับสนุนกองทุน
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="py-20 px-4 md:px-8 bg-white/10">
        <div className="max-w-6xl mx-auto text-white">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">ผลงานที่ผ่านมา</h2>
            <div className="w-20 h-1 bg-yellow-400 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-[#1a367d] p-6 rounded-lg shadow-lg"
            >
              <div className="text-yellow-400 text-4xl font-bold mb-4">250+</div>
              <h3 className="text-xl font-bold mb-2">ทุนการศึกษา</h3>
              <p>มอบทุนการศึกษาให้แก่นักเรียนปัจจุบันที่มีความสามารถและขาดแคลนทุนทรัพย์</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-[#1a367d] p-6 rounded-lg shadow-lg"
            >
              <div className="text-yellow-400 text-4xl font-bold mb-4">45+</div>
              <h3 className="text-xl font-bold mb-2">โครงการพัฒนา</h3>
              <p>สนับสนุนโครงการพัฒนาทักษะและการสร้างนวัตกรรมของนักเรียน</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-[#1a367d] p-6 rounded-lg shadow-lg"
            >
              <div className="text-yellow-400 text-4xl font-bold mb-4">20+</div>
              <h3 className="text-xl font-bold mb-2">การแข่งขันระดับนานาชาติ</h3>
              <p>สนับสนุนนักเรียนในการเข้าร่วมการแข่งขันทางวิชาการในระดับนานาชาติ</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Donation CTA */}
      <div className="py-20 px-4 md:px-8 bg-gradient-to-r from-[#204396] to-[#2a5ac9]">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            ร่วมเป็นส่วนหนึ่งในการสร้างโอกาสทางการศึกษา
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl mb-8"
          >
            กองทุนแบ่งสรรปันน้อง คือโครงการที่จะช่วยส่งต่อโอกาสดี ๆ ให้กับน้อง ๆ นักเรียนปัจจุบัน
            ของโรงเรียนมหิดลวิทยานุสรณ์ การบริจาคของท่านสามารถนำไปลดหย่อนภาษีได้ 2 เท่า
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link href="/donate">
              <div className="inline-block px-8 py-4 bg-yellow-400 text-[#204396] font-bold rounded-full text-xl hover:bg-yellow-300 transition duration-300 shadow-lg">
                บริจาคตอนนี้
              </div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto text-white">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">ติดต่อเรา</h2>
            <div className="w-20 h-1 bg-yellow-400 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6 text-yellow-400">ข้อมูลติดต่อ</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-[#1a367d] p-2 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">ที่อยู่</p>
                    <p>โรงเรียนมหิดลวิทยานุสรณ์</p>
                    <p>364 หมู่ 5 ต.ศาลายา อ.พุทธมณฑล จ.นครปฐม 73170</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#1a367d] p-2 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">อีเมล</p>
                    <p><a href="mailto:alumni@mwit.ac.th" className="hover:text-yellow-400">alumni@mwit.ac.th</a></p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#1a367d] p-2 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">โทรศัพท์</p>
                    <p>02-0277850 ต่อ 242</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#1a367d] p-2 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">ผู้ดูแลกองทุน</p>
                    <p>นายวัชชิรทาน เข็มทอง</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-[#1a367d] p-6 rounded-lg shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-6 text-yellow-400">ส่งข้อความถึงเรา</h3>
              
              <form onSubmit={handleSubmitMessage} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block mb-2 font-medium">ชื่อ-นามสกุล</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    value={messageForm.name}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
                    placeholder="กรอกชื่อ-นามสกุล" 
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block mb-2 font-medium">อีเมล</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    value={messageForm.email}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
                    placeholder="กรอกอีเมล" 
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block mb-2 font-medium">ข้อความ</label>
                  <textarea 
                    id="message"
                    name="message"
                    value={messageForm.message}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    rows={4} 
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
                    placeholder="กรอกข้อความ"
                    required
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 font-bold rounded-lg transition duration-300 ${
                    isSubmitting
                      ? 'bg-yellow-400/50 text-[#204396]/50 cursor-not-allowed'
                      : 'bg-yellow-400 text-[#204396] hover:bg-yellow-300'
                  }`}
                >
                  {isSubmitting ? 'กำลังส่ง...' : 'ส่งข้อความ'}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}