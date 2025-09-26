"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navigation() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);

  // Close menu when clicking outside or on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsAboutDropdownOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const nav = document.getElementById('mobile-nav');
      const button = document.getElementById('menu-button');
      const dropdown = document.getElementById('about-dropdown');
      const dropdownButton = document.getElementById('about-dropdown-button');
      
      if (nav && button && !nav.contains(e.target as Node) && !button.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
      
      if (dropdown && dropdownButton && !dropdown.contains(e.target as Node) && !dropdownButton.contains(e.target as Node)) {
        setIsAboutDropdownOpen(false);
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
  }, [isMenuOpen, isAboutDropdownOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:flex space-x-2 items-center">
        {/* About Fund Dropdown */}
        <div className="relative">
          <button
            id="about-dropdown-button"
            onClick={() => setIsAboutDropdownOpen(!isAboutDropdownOpen)}
            className="xl:text-lg px-4 py-2 text-white hover:text-yellow-400 transition flex items-center"
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
              className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
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
                {session && (
                  <>
                    <Link
                      href="/my-donations"
                      onClick={() => setIsAboutDropdownOpen(false)}
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
                        onClick={() => setIsAboutDropdownOpen(false)}
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
                  </>
                )}
              </div>
            </div>
          )}
        </div>
{session ? (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="xl:text-lg px-4 py-2 text-white hover:text-red-400 transition"
          >
            ออกจากระบบ
          </button>
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
          className="relative z-50 p-2 text-white hover:text-yellow-400 transition-colors touch-manipulation"
          aria-label="เมนู"
          type="button"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span 
              className={`block w-6 h-0.5 bg-current transition-all duration-300 origin-center ${
                isMenuOpen ? 'rotate-45 translate-y-0' : 'translate-y-[-4px]'
              }`} 
            />
            <span 
              className={`block w-6 h-0.5 bg-current transition-all duration-300 ${
                isMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              }`} 
            />
            <span 
              className={`block w-6 h-0.5 bg-current transition-all duration-300 origin-center ${
                isMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-[4px]'
              }`} 
            />
          </div>
        </button>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
              onClick={closeMenu}
            />
            
            {/* Menu Panel */}
            <div 
              id="mobile-nav"
              className="absolute top-0 right-0 w-80 max-w-[85vw] h-full bg-gradient-to-b from-[#204396] to-[#152a5f] border-l-2 border-white/10 shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out"
              style={{
                transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)'
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                <div className="flex items-center">
                  <img src="/img/alumni.png" alt="Alumni" className="w-8 h-8 mr-3" />
                  <h2 className="text-lg font-semibold text-white">เมนู</h2>
                </div>
                <button
                  onClick={closeMenu}
                  className="p-2 -mr-2 text-white hover:text-red-400 transition-colors touch-manipulation"
                  aria-label="ปิดเมนู"
                  type="button"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 px-6 py-4 space-y-2 pb-safe">
                {/* Primary CTA */}
                <Link
                  href="/donate"
                  onClick={closeMenu}
                  className="block w-full px-6 py-4 bg-gradient-to-bl from-yellow-600 to-yellow-400 text-[#204396] font-bold rounded-lg text-center transition hover:scale-95 mb-4 touch-manipulation"
                >
                  บริจาค
                </Link>

                {/* Menu Items */}
                <div className="space-y-2">
                  <div className="px-4 py-2 text-yellow-400 font-semibold text-sm uppercase tracking-wide">
                    เกี่ยวกับกองทุน
                  </div>
                  
                  <Link
                    href="/questions"
                    onClick={closeMenu}
                    className="block px-4 py-3 text-white hover:text-yellow-400 hover:bg-white/5 rounded-lg transition ml-4 touch-manipulation"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      คำถามที่พบบ่อย
                    </div>
                  </Link>
                  
                  <Link
                    href="/#about"
                    onClick={closeMenu}
                    className="block px-4 py-3 text-white hover:text-yellow-400 hover:bg-white/5 rounded-lg transition ml-4 touch-manipulation"
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
                    onClick={closeMenu}
                    className="block px-4 py-3 text-white hover:text-yellow-400 hover:bg-white/5 rounded-lg transition ml-4 touch-manipulation"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      ติดต่อเรา
                    </div>
                  </Link>
                  
                  <div className="border-t border-white/10 my-4 pt-4">
                    <Link
                      href="/stats"
                      onClick={closeMenu}
                      className="block px-4 py-3 text-white hover:text-yellow-400 hover:bg-white/5 rounded-lg transition touch-manipulation"
                    >
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        รายรับ-รายจ่าย
                      </div>
                    </Link>
                  </div>
                </div>

                {session && (
                  <div className="border-t border-white/10 my-4 pt-4">
                    <Link
                      href="/my-donations"
                      onClick={closeMenu}
                      className="block px-4 py-3 text-white hover:text-yellow-400 hover:bg-white/5 rounded-lg transition touch-manipulation"
                    >
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        การบริจาคของฉัน
                      </div>
                    </Link>
                    
                    {(session.user as any)?.role === 'admin' && (
                      <Link
                        href="/dashboard"
                        onClick={closeMenu}
                        className="block px-4 py-3 text-white hover:text-yellow-400 hover:bg-white/5 rounded-lg transition touch-manipulation"
                      >
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                          แดชบอร์ด
                        </div>
                      </Link>
                    )}
                  </div>
                )}

                {/* User Profile & Auth Section */}
                <div className="border-t border-white/10 my-4 pt-4">
                  {session ? (
                    <>
                      <div className="px-4 py-2 mb-2">
                        <div className="flex items-center">
                          <img 
                            src={session.user?.image || '/img/alumni.png'} 
                            alt="Profile" 
                            className="w-8 h-8 rounded-full mr-3"
                          />
                          <div>
                            <p className="text-sm font-medium text-white">{session.user?.name}</p>
                            <p className="text-xs text-white/60">{session.user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          closeMenu();
                          signOut({ callbackUrl: '/' });
                        }}
                        className="block w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition text-left touch-manipulation"
                        type="button"
                      >
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          ออกจากระบบ
                        </div>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        closeMenu();
                        signIn("google", { callbackUrl: "/my-donations" });
                      }}
                      className="block w-full px-4 py-3 text-white hover:text-yellow-400 hover:bg-white/5 rounded-lg transition text-left touch-manipulation"
                      type="button"
                    >
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        เข้าสู่ระบบ
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}