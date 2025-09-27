import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { IBM_Plex_Sans_Thai } from 'next/font/google';
import SessionProvider from './components/SessionProvider';
import Navigation from './components/Navigation';
import { Toaster } from 'react-hot-toast';
 
const ibmPlexSansThai = IBM_Plex_Sans_Thai({ subsets: ['thai', 'latin'], weight: ['100','200','300','400','500','600','700'], display: 'swap' });

export const metadata: Metadata = {
  title: "MWIT Alumni",
  description: "MWIT Alumni",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`antialiased overflow-x-hidden bg-[#204297] ${ibmPlexSansThai.className}`}
      >
        <SessionProvider>
          <div className="fixed top-2 lg:top-6 left-1/2 -translate-x-1/2 z-50 text-white w-[calc(100vw-16px)] lg:w-[calc(100vw-48px)] max-w-[1200px] lg:min-h-[80px] px-3 lg:px-6 py-3 lg:py-4 flex justify-between items-center bg-black/40 border-2 border-white/10 rounded-xl backdrop-blur-sm overflow-visible">
            <Link href="/" className="flex place-items-center flex-1 min-w-0">
              <img src="/img/alumni.png" alt="สมาคมนักเรียนเก่าโรงเรียนโรงเรียนมหิดลวิทยานุสรณ์" className="h-10 lg:h-12 flex-shrink-0" />
              <p className="text-sm lg:text-lg pl-3 lg:pl-5 truncate">
                <span className="hidden sm:inline">สมาคมนักเรียนเก่าโรงเรียนมหิดลวิทยานุสรณ์</span>
                <span className="sm:hidden">สมาคมนักเรียนเก่า MWIT</span>
              </p>
            </Link>
            <div className="flex-shrink-0 relative">
              <Navigation />
            </div>
          </div>
          <div className="mb-20 lg:mb-28"></div>
          <div className="text-white   lg:mx-15">{children}</div>
        </SessionProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a367d',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              fontFamily: 'inherit'
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <div className="bg-gradient-to-r from-[#fde895] from-10% lg:to-[#7c4087] to-[#fde895] to-90%">
          <div className="py-4 px-8 w-full max-w-6xl mx-auto flex flex-col md:flex-row justify-center items-center md:items-start gap-y-4 gap-x-6">
            <img alt="Hello :)" loading="lazy" width="130" decoding="async" data-nimg="1" className="h-20 self-center rounded-xl" style={{ color: "transparent", height: "auto" }} src="/img/alumni.png"/>
            <div className="flex flex-col w-fit max-w-lg gap-3 items-center md:items-start">
              <span className="text-[#2e506f] font-CS font-semibold text-lg md:text-xl text-center">สมาคมนักเรียนเก่าโรงเรียนมหิดลวิทยานุสรณ์
              </span>
              <div className="flex flex-col items-center md:items-start text-center font-IBMPlexLoop gap-x-2">
                <span className="text-[#2e506f] text-sm md:text-base">
                  <b>ติดต่อผู้ดูแลกองทุน: นายวัชชิรทาน  เข็มทอง</b>
                </span>
                <span className="text-[#2e506f] text-xs md:text-sm whitespace-pre-wrap">โรงเรียนมหิดลวิทยานุสรณ์</span>
                <span className="text-[#2e506f] text-xs md:text-sm whitespace-pre-wrap">364 หมู่ 5 ต.ศาลายา อ.พุทธมณฑล จ.นครปฐม 73170</span>
                <span className="text-[#2e506f] text-xs md:text-sm whitespace-pre-wrap">โทร. 02-0277850 ต่อ 242</span>
                <span className="text-[#2e506f] text-xs md:text-sm whitespace-pre-wrap"><a href="mailto:alumni@mwit.ac.th">Email : alumni@mwit.ac.th</a></span>
              </div>
            </div>
            <div className="grow"></div>
          </div>
        </div>
      </body>
    </html>
  );
}
