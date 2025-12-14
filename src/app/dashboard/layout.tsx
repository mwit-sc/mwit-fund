"use client";

import { IBM_Plex_Sans_Thai } from 'next/font/google';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import AdminRoute from '../components/AdminRoute';
import Avatar from '../components/Avatar';

const ibmPlexSansThai = IBM_Plex_Sans_Thai({ 
  subsets: ['thai', 'latin'], 
  weight: ['100','200','300','400','500','600','700'], 
  display: 'swap' 
});

const navigation = [
  { name: 'ภาพรวม', href: '/dashboard', icon: '📊' },
  { name: 'การบริจาค', href: '/dashboard/donations', icon: '💰' },
  { name: 'ข้อความ', href: '/dashboard/messages', icon: '💬' },
  { name: 'จัดการผู้ใช้', href: '/dashboard/users', icon: '👥' },
  { name: 'บทความ', href: '/dashboard/blog', icon: '📰' },
  { name: 'ลิงก์สั้น', href: '/dashboard/short-links', icon: '🔗' },
  { name: 'จัดการเนื้อหา', href: '/dashboard/content', icon: '📝' },
  { name: 'คำถาม-คำตอบ', href: '/dashboard/qa', icon: '❓' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <AdminRoute>
      <div className={`min-h-screen bg-linear-to-b from-[#204396] to-[#152a5f] text-white ${ibmPlexSansThai.className}`}>
        {/* Header */}
        <div className="py-8 px-4 bg-linear-to-r from-[#204396] to-[#2a5ac9]">
          <div className="max-w-7xl mx-auto">
            {/* User Info and Navigation */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center hover:text-yellow-400 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>กลับสู่หน้าหลัก</span>
                </Link>
                <span className="text-white/50">|</span>
                <Link href="/stats" className="flex items-center hover:text-yellow-400 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>ดูสถิติ</span>
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                {session?.user && (
                  <div className="flex items-center space-x-3">
                    <Avatar 
                      src={session.user.image} 
                      name={session.user.name}
                      size="md"
                    />
                    <div className="text-left">
                      <p className="font-semibold">{session.user.name}</p>
                      <p className="text-sm text-white/70">{session.user.email}</p>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition duration-300 flex items-center space-x-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">แดชบอร์ดจัดการระบบ</h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/5 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex space-x-8 overflow-x-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      isActive
                        ? 'border-yellow-400 text-yellow-400'
                        : 'border-transparent text-white/70 hover:text-white hover:border-white/30'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </AdminRoute>
  );
}