"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { IBM_Plex_Sans_Thai } from 'next/font/google';

const ibmPlexSansThai = IBM_Plex_Sans_Thai({ 
  subsets: ['thai', 'latin'], 
  weight: ['100','200','300','400','500','600','700'], 
  display: 'swap' 
});

export default function NotFound() {
  return (
    <div className={`max-h-screen min-h-screen bg-gradient-to-b from-[#204396] to-[#152a5f] text-white ${ibmPlexSansThai.className}`}>
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto"
        >
          {/* 404 Number */}
          {/* <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-bold text-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text leading-none">
              404
            </h1>
          </motion.div> */}

          {/* MWIT Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <img 
              src="/img/alumni.png" 
              alt="MWIT Alumni Logo" 
              className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-xl shadow-lg" 
            />
          </motion.div>

          {/* Thai Message */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              ไม่พบหน้าที่คุณต้องการ
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-2">
              หน้าที่คุณกำลังมองหาอาจถูกย้ายหรือไม่มีอยู่
            </p>
            <p className="text-base md:text-lg text-white/60">
              กรุณาตรวจสอบ URL อีกครั้ง หรือกลับสู่หน้าหลัก
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/"
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#204396] font-bold rounded-xl hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>กลับสู่หน้าหลัก</span>
              </div>
            </Link>

            <Link
              href="/donate"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>ไปหน้าบริจาค</span>
              </div>
            </Link>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-16 text-white/30"
          >
            <div className="flex justify-center space-x-4 text-sm">
              <span>สมาคมนักเรียนเก่าโรงเรียนมหิดลวิทยานุสรณ์</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Background Animation */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          />
        </div>
      </div>
    </div>
  );
}