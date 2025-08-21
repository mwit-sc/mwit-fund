"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import Link from "next/link";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({ 
  subsets: ['thai', 'latin'], 
  weight: ['100','200','300','400','500','600','700'], 
  display: 'swap' 
});

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Redirect logged-in users based on their role
  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (session?.user) {
      // Redirect based on user role
      if (session.user.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/my-donations');
      }
    }
  }, [session, status, router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google", { 
        callbackUrl: "/",
        redirect: true 
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setLoading(false);
    }
  };

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className={`min-h-screen bg-gradient-to-b from-[#204396] to-[#152a5f] text-white flex items-center justify-center ${ibmPlexSansThai.className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl">กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  // Don't show sign-in form if user is already logged in (will redirect)
  if (session?.user) {
    return (
      <div className={`min-h-screen bg-gradient-to-b from-[#204396] to-[#152a5f] text-white flex items-center justify-center ${ibmPlexSansThai.className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl">กำลังเปลี่ยนเส้นทาง...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-[#204396] to-[#152a5f] text-white ${ibmPlexSansThai.className}`}>
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8">
            <Link href="/" className="inline-block mb-10">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>กลับสู่หน้าหลัก</span>
              </div>
            </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-lg"
        >
          {/* MWIT Logo */}
          <div className="text-center mb-8">
            <img 
              src="/img/alumni.png" 
              alt="MWIT Alumni Logo" 
              className="w-20 h-20 mx-auto rounded-xl shadow-lg mb-4" 
            />
            <h2 className="text-2xl font-bold">เข้าสู่ระบบรับบริจาค</h2>
            <p className="text-white/80 mt-2">สมาคมศิษย์เก่าโรงเรียนมหิดลวิทยานุสรณ์</p>
          </div>

          {/* Google Sign In Button */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={`w-full flex items-center justify-center px-6 py-4 bg-white text-gray-700 font-semibold rounded-xl transition duration-300 transform hover:scale-105 shadow-lg ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-700"></div>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>เข้าสู่ระบบด้วย Google</span>
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-white/60">
                กรุณาใช้อีเมล @mwit.ac.th หรือ @gmail.com
              </p>
            </div>
          </div>

          {/* Security Notice */}
          {/* <div className="mt-8 p-4 bg-blue-600/20 rounded-lg border border-blue-400/30">
            <div className="flex items-start space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-400">ระบบความปลอดภัย</h3>
                <p className="text-sm text-white/80 mt-1">
                  ระบบนี้ได้รับการป้องกันด้วย Google Authentication เพื่อความปลอดภัยสูงสุด
                </p>
              </div>
            </div>
          </div> */}
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 text-center"
        >
          <p className="text-white/60">
            หากมีปัญหาในการเข้าสู่ระบบ กรุณาติดต่อ{" "}
            <a href="mailto:alumni@mwit.ac.th" className="text-yellow-400 hover:text-yellow-300">
              alumni@mwit.ac.th
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}