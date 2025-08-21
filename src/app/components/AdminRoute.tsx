"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { IBM_Plex_Sans_Thai } from 'next/font/google';

const ibmPlexSansThai = IBM_Plex_Sans_Thai({ 
  subsets: ['thai', 'latin'], 
  weight: ['100','200','300','400','500','600','700'], 
  display: 'swap' 
});

interface Props {
  children: ReactNode;
}

export default function AdminRoute({ children }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (session.user?.role !== 'admin') {
      router.push("/"); // Redirect non-admins to home page
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className={`min-h-screen bg-gradient-to-b from-[#204396] to-[#152a5f] text-white flex items-center justify-center ${ibmPlexSansThai.className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl">กำลังตรวจสอบสิทธิ์การเข้าถึง...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to sign in
  }

  if (session.user?.role !== 'admin') {
    return (
      <div className={`min-h-screen bg-gradient-to-b from-[#204396] to-[#152a5f] text-white flex items-center justify-center ${ibmPlexSansThai.className}`}>
        <div className="text-center">
          <div className="mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">ไม่มีสิทธิ์การเข้าถึง</h1>
          <p className="text-xl mb-8">คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้</p>
          <button 
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-yellow-400 text-[#204396] font-bold rounded-lg hover:bg-yellow-300 transition duration-300"
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}