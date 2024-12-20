import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { IBM_Plex_Sans_Thai } from 'next/font/google'
 
const ibmPlexSansThai = IBM_Plex_Sans_Thai({ subsets: ['thai', 'latin'], weight: ['100','200','300','400','500','600','700'] });

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
    <html lang="en">
      <body
        className={`antialiased overflow-x-hidden bg-[#204297] ${ibmPlexSansThai.className}`}
      >
        <div className="fixed top-4 lg:top-6 left-1/2 -translate-x-1/2 z-50 text-white w-[calc(100vw-24px-24px)] max-w-[1200px] h-[80px] px-6 py-4 flex justify-between items-center bg-black/40 border-2 border-white/10 rounded-xl backdrop-blur-sm">
          <Link href="/" className="flex place-items-center">
            <img src="/img/alumni.png" alt="สมาคมศิษย์เก่าโรงเรียนโรงเรียนมหิดลวิทยานุสรณ์" className="h-12" />
            <p className="text-lg pl-5">สมาคมศิษย์เก่าโรงเรียนโรงเรียนมหิดลวิทยานุสรณ์</p>
          </Link>
          <div className="hidden lg:flex space-x-8 items-center">
            <Link
              className="xl:text-lg px-6 py-2 bg-gradient-to-bl from-yellow-600 to-yellow-400 font-bold rounded-lg glowing-box transition hover:scale-95"
              href="/#howtodonate"
            >
              บริจาค
            </Link>
          </div>
        </div>
        <div className="mb-28"></div>
        <div className="text-white m-4 mx-2 lg:mx-15">{children}</div>
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
