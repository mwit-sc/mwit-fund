"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import Avatar from "./Avatar";

export default function Navigation() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Close menu when clicking outside or on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsAboutDropdownOpen(false);
        setIsProfileDropdownOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const nav = document.getElementById('mobile-nav');
      const button = document.getElementById('menu-button');
      const dropdown = document.getElementById('about-dropdown');
      const dropdownButton = document.getElementById('about-dropdown-button');
      const profileDropdown = document.getElementById('profile-dropdown');
      const profileButton = document.getElementById('profile-dropdown-button');
      
      if (nav && button && !nav.contains(e.target as Node) && !button.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
      
      if (dropdown && dropdownButton && !dropdown.contains(e.target as Node) && !dropdownButton.contains(e.target as Node)) {
        setIsAboutDropdownOpen(false);
      }

      if (profileDropdown && profileButton && !profileDropdown.contains(e.target as Node) && !profileButton.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, isAboutDropdownOpen, isProfileDropdownOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  // Helper function to get first name
  const getFirstName = (fullName: string | null | undefined) => {
    if (!fullName) return 'ผู้ใช้';
    const names = fullName.trim().split(' ');
    return names[0] || 'ผู้ใช้';
  };

  return (
    <>
      {/* Mobile Menu Overlay - Outside of navbar container */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-md transition-all duration-500 animate-in fade-in"
            onClick={closeMenu}
          />
          
          {/* Menu Panel */}
          <div 
            id="mobile-nav"
            className="absolute top-0 right-0 w-72 max-w-[85vw] h-screen bg-gradient-to-br from-[#204396] via-[#1a3a87] to-[#152a5f] border-l border-white/20 shadow-2xl overflow-hidden transform transition-all duration-500 ease-out animate-in slide-in-from-right"
            style={{
              transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)'
            }}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border-b border-white/20">
              <div className="flex justify-between items-center p-4 sm:p-6">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 rounded-full flex items-center justify-center mr-2 sm:mr-3 shadow-lg flex-shrink-0">
                    <img src="/img/alumni.png" alt="Alumni" className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base sm:text-lg font-bold text-white truncate">เมนู</h2>
                    <p className="text-xs text-white/60 truncate">กองทุนช่วยเหลือนักเรียน</p>
                  </div>
                </div>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:text-red-200 transition-all duration-200 touch-manipulation group"
                  aria-label="ปิดเมนู"
                  type="button"
                >
                  <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Decorative line */}
              <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>
            </div>

            {/* Menu Content */}
            <div className="flex-1 flex flex-col h-full">
              {/* Primary CTA - Fixed at top */}
              <div className="px-4 py-4 sm:px-6 sm:py-6 border-b border-white/10">
                <Link
                  href="/donate"
                  onClick={closeMenu}
                  className="relative block w-full overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 animate-pulse rounded-2xl"></div>
                  <div className="relative px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-yellow-500 to-yellow-400 text-[#204396] font-bold rounded-2xl text-center transition-all duration-300 hover:shadow-2xl transform hover:scale-[0.98] touch-manipulation shadow-lg group-hover:shadow-yellow-400/25">
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#204396]/20 rounded-full flex items-center justify-center mr-2 sm:mr-3 group-hover:rotate-12 transition-transform duration-300 flex-shrink-0">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <span className="text-base sm:text-lg">บริจาคเดี่ยวนี้</span>
                      <div className="ml-1 sm:ml-2 text-lg sm:text-xl animate-bounce">💝</div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Menu Items - Scrollable */}
              <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 space-y-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {/* About Fund Section */}
                <div className="mb-8">
                  <div className="px-4 py-3 mb-4 bg-gradient-to-r from-yellow-400/10 to-yellow-500/10 rounded-xl border border-yellow-400/20">
                    <h3 className="text-yellow-300 font-bold text-sm uppercase tracking-wider flex items-center">
                      <div className="w-6 h-6 bg-yellow-400/20 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      เกี่ยวกับกองทุน
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Link
                      href="/questions"
                      onClick={closeMenu}
                      className="flex items-center px-3 py-3 sm:px-4 sm:py-4 text-white hover:text-yellow-400 hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 rounded-2xl transition-all duration-300 touch-manipulation group transform hover:scale-[1.02] hover:translate-x-1"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-gradient-to-br group-hover:from-blue-400/40 group-hover:to-blue-500/30 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 shadow-lg flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-sm sm:text-base truncate block">คำถามที่พบบ่อย</span>
                        <p className="text-xs text-white/60 mt-1 truncate">คำถามที่มักถูกเกี่ยวกับกองทุน</p>
                      </div>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 group-hover:text-yellow-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    
                    <Link
                      href="/#about"
                      onClick={closeMenu}
                      className="flex items-center px-3 py-3 sm:px-4 sm:py-4 text-white hover:text-yellow-400 hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 rounded-2xl transition-all duration-300 touch-manipulation group transform hover:scale-[1.02] hover:translate-x-1"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-gradient-to-br group-hover:from-green-400/40 group-hover:to-green-500/30 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 shadow-lg flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-sm sm:text-base truncate block">เกี่ยวกับกองทุน</span>
                        <p className="text-xs text-white/60 mt-1 truncate">รู้จักประวัติและวัตถุประสงค์</p>
                      </div>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 group-hover:text-yellow-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    
                    <Link
                      href="/#contact"
                      onClick={closeMenu}
                      className="flex items-center px-3 py-3 sm:px-4 sm:py-4 text-white hover:text-yellow-400 hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 rounded-2xl transition-all duration-300 touch-manipulation group transform hover:scale-[1.02] hover:translate-x-1"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500/30 to-purple-600/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-gradient-to-br group-hover:from-purple-400/40 group-hover:to-purple-500/30 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 shadow-lg flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-sm sm:text-base truncate block">ติดต่อเรา</span>
                        <p className="text-xs text-white/60 mt-1 truncate">สอบถามและติดต่อทีมงาน</p>
                      </div>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 group-hover:text-yellow-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    
                    <Link
                      href="/blog"
                      onClick={closeMenu}
                      className="flex items-center px-3 py-3 sm:px-4 sm:py-4 text-white hover:text-yellow-400 hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 rounded-2xl transition-all duration-300 touch-manipulation group transform hover:scale-[1.02] hover:translate-x-1"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500/30 to-indigo-600/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-gradient-to-br group-hover:from-indigo-400/40 group-hover:to-indigo-500/30 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 shadow-lg flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-sm sm:text-base truncate block">บทความและข่าวสาร</span>
                        <p className="text-xs text-white/60 mt-1 truncate">อ่านบทความและข้อมูลข่าวสาร</p>
                      </div>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 group-hover:text-yellow-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    
                    <Link
                      href="/stats"
                      onClick={closeMenu}
                      className="flex items-center px-3 py-3 sm:px-4 sm:py-4 text-white hover:text-yellow-400 hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 rounded-2xl transition-all duration-300 touch-manipulation group transform hover:scale-[1.02] hover:translate-x-1"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-gradient-to-br group-hover:from-cyan-400/40 group-hover:to-cyan-500/30 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 shadow-lg flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-sm sm:text-base truncate block">รายรับ-รายจ่าย</span>
                        <p className="text-xs text-white/60 mt-1 truncate">ดูสถิติการเงินของกองทุน</p>
                      </div>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 group-hover:text-yellow-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* User Menu - Only if logged in */}
                {session && (
                  <div className="mb-8">
                    <div className="px-4 py-3 mb-4 bg-gradient-to-r from-emerald-400/10 to-emerald-500/10 rounded-xl border border-emerald-400/20">
                      <h3 className="text-emerald-300 font-bold text-sm uppercase tracking-wider flex items-center">
                        <div className="w-6 h-6 bg-emerald-400/20 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        บัญชีของฉัน
                      </h3>
                    </div>
                    
                    <div className="space-y-2">
                      <Link
                        href="/my-donations"
                        onClick={closeMenu}
                        className="flex items-center px-3 py-3 sm:px-4 sm:py-4 text-white hover:text-yellow-400 hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 rounded-2xl transition-all duration-300 touch-manipulation group transform hover:scale-[1.02] hover:translate-x-1"
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500/30 to-orange-600/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-gradient-to-br group-hover:from-orange-400/40 group-hover:to-orange-500/30 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 shadow-lg flex-shrink-0">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-sm sm:text-base truncate block">การบริจาคของฉัน</span>
                          <p className="text-xs text-white/60 mt-1 truncate">ดูประวัติการบริจาคของคุณ</p>
                        </div>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 group-hover:text-yellow-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      
                      {(session.user as any)?.role === 'admin' && (
                        <Link
                          href="/dashboard"
                          onClick={closeMenu}
                          className="relative flex items-center px-3 py-3 sm:px-4 sm:py-4 text-white hover:text-yellow-400 hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 rounded-2xl transition-all duration-300 touch-manipulation group transform hover:scale-[1.02] hover:translate-x-1 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500/30 to-red-600/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-gradient-to-br group-hover:from-red-400/40 group-hover:to-red-500/30 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 shadow-lg flex-shrink-0">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                          </div>
                          <div className="relative flex-1 min-w-0">
                            <div className="flex items-center">
                              <span className="font-semibold text-sm sm:text-base truncate">แดชบอร์ดผู้ดูแล</span>
                              <span className="ml-1 sm:ml-2 px-1.5 py-0.5 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30 flex-shrink-0">แอดมิน</span>
                            </div>
                            <p className="text-xs text-white/60 mt-1 truncate">จัดการระบบและข้อมูล</p>
                          </div>
                          <svg className="relative w-4 h-4 sm:w-5 sm:h-5 text-white/40 group-hover:text-yellow-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Section - Fixed at bottom */}
              <div className="px-4 py-4 sm:px-6 sm:py-6 border-t border-white/20 bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-sm">
                {session ? (
                  <div className="space-y-5">
                    {/* Profile Info */}
                    <div className="relative flex items-center px-3 py-3 sm:px-5 sm:py-4 bg-gradient-to-r from-white/15 to-white/10 rounded-2xl border border-white/20 shadow-lg overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-blue-400/5 opacity-50"></div>
                      <Avatar 
                        src={session.user?.image} 
                        name={session.user?.name}
                        size="md"
                        className="mr-3 sm:mr-4 ring-2 ring-yellow-400/30 shadow-lg relative z-10 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 relative z-10">
                        <p className="text-white font-bold text-base sm:text-lg truncate flex items-center">
                          {getFirstName(session.user?.name)}
                          <span className="ml-2 text-yellow-400">✨</span>
                        </p>
                        <p className="text-white/70 text-xs sm:text-sm truncate">{session.user?.email}</p>
                        <div className="flex items-center mt-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                          <span className="text-xs text-green-300 font-medium">ออนไลน์</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Sign Out Button */}
                    <button
                      onClick={() => {
                        closeMenu();
                        signOut({ callbackUrl: '/' });
                      }}
                      className="relative flex items-center justify-center w-full px-5 py-4 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 hover:from-red-500/30 hover:to-red-600/30 hover:text-red-200 rounded-2xl transition-all duration-300 touch-manipulation group border border-red-500/30 hover:border-red-400/50 shadow-lg overflow-hidden"
                      type="button"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <svg className="relative w-5 h-5 mr-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="relative font-semibold">ออกจากระบบ</span>
                      <div className="relative ml-2 w-2 h-2 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-yellow-400/30">
                        <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p className="text-white/80 text-sm mb-2">เข้าสู่ระบบเพื่อเข้าถึง</p>
                      <p className="text-white/60 text-xs">ฟีเจอร์เพิ่มเติมและการบริจาค</p>
                    </div>
                    <button
                      onClick={() => {
                        closeMenu();
                        signIn("google", { callbackUrl: "/my-donations" });
                      }}
                      className="relative flex items-center justify-center w-full px-5 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#204396] font-bold rounded-2xl transition-all duration-300 touch-manipulation hover:from-yellow-300 hover:to-yellow-400 transform hover:scale-[0.98] shadow-xl hover:shadow-yellow-400/25 group overflow-hidden"
                      type="button"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <svg className="relative w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span className="relative">เข้าสู่ระบบด้วย Google</span>
                      <div className="relative ml-2 text-lg animate-pulse">🚀</div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <div className="hidden lg:flex space-x-2 items-center">
        {/* About Fund Dropdown */}
        <div className="relative group">
          <button
            id="about-dropdown-button"
            onClick={() => setIsAboutDropdownOpen(!isAboutDropdownOpen)}
            className="xl:text-lg px-4 py-2 text-white hover:text-yellow-400 transition-all duration-200 flex items-center rounded-lg hover:bg-white/10"
          >
            เกี่ยวกับกองทุน
            <svg 
              className={`ml-1 w-4 h-4 transition-transform ${isAboutDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isAboutDropdownOpen && (
            <div 
              id="about-dropdown"
              className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <Link
                href="/questions"
                onClick={() => setIsAboutDropdownOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#204396] transition"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  คำถามที่พบบ่อย
                </div>
              </Link>
              <Link
                href="/donate"
                onClick={() => setIsAboutDropdownOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#204396] transition"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  วิธีการบริจาค
                </div>
              </Link>
              <Link
                href="/#about"
                onClick={() => setIsAboutDropdownOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#204396] transition"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  เกี่ยวกับกองทุน
                </div>
              </Link>
              <Link
                href="/#contact"
                onClick={() => setIsAboutDropdownOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#204396] transition"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  ติดต่อเรา
                </div>
              </Link>
              <div className="border-t border-gray-200 mt-2 pt-2">
                <Link
                  href="/blog"
                  onClick={() => setIsAboutDropdownOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#204396] transition"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    บทความและข่าวสาร
                  </div>
                </Link>
                <Link
                  href="/stats"
                  onClick={() => setIsAboutDropdownOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#204396] transition"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    รายรับ-รายจ่าย
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown or Sign In */}
        {session ? (
          <div className="relative group">
            <button
              id="profile-dropdown-button"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-2 text-white hover:text-yellow-400 transition-all duration-200 rounded-lg hover:bg-white/10"
            >
              <Avatar 
                src={session.user?.image} 
                name={session.user?.name}
                size="sm"
              />
              <span className="xl:text-lg font-medium">{getFirstName(session.user?.name)}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isProfileDropdownOpen && (
              <div 
                id="profile-dropdown"
                className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <Avatar 
                      src={session.user?.image} 
                      name={session.user?.name}
                      size="md"
                      className="mr-3"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                    </div>
                  </div>
                </div>
                
                <Link
                  href="/my-donations"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#204396] transition"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    การบริจาคของฉัน
                  </div>
                </Link>
                
                {(session.user as any)?.role === 'admin' && (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#204396] transition"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      แดชบอร์ด
                    </div>
                  </Link>
                )}
                
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="block w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      ออกจากระบบ
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => signIn("google", { callbackUrl: "/my-donations" })}
            className="xl:text-lg px-4 py-2 text-white hover:text-yellow-400 transition"
          >
            เข้าสู่ระบบ
          </button>
        )}
        
        <Link
          className="xl:text-lg px-6 py-2 bg-gradient-to-bl from-yellow-600 to-yellow-400 font-bold rounded-lg glowing-box transition hover:scale-95"
          href="/donate"
        >
          บริจาค
        </Link>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Hamburger Menu Button */}
        <button
          id="menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="relative z-[110] p-3 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:text-yellow-400 hover:bg-white/20 transition-all duration-300 touch-manipulation group"
          aria-label="เมนู"
          type="button"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center relative">
            <span 
              className={`block w-6 h-0.5 bg-current transition-all duration-300 origin-center group-hover:w-7 ${
                isMenuOpen ? 'rotate-45 translate-y-0' : 'translate-y-[-5px]'
              }`} 
            />
            <span 
              className={`block w-6 h-0.5 bg-current transition-all duration-300 group-hover:w-5 ${
                isMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              }`} 
            />
            <span 
              className={`block w-6 h-0.5 bg-current transition-all duration-300 origin-center group-hover:w-7 ${
                isMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-[5px]'
              }`} 
            />
          </div>
        </button>
      </div>
    </>
  );
}