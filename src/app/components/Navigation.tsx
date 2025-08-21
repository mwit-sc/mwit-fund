"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navigation() {
  const { data: session } = useSession();

  return (
    <div className="hidden lg:flex space-x-4 items-center">
      <Link
        href="/stats"
        className="xl:text-lg px-4 py-2 text-white hover:text-yellow-400 transition"
      >
        สถิติ
      </Link>
      
      {session ? (
        <>
          <Link
            href="/my-donations"
            className="xl:text-lg px-4 py-2 text-white hover:text-yellow-400 transition"
          >
            การบริจาคของฉัน
          </Link>
          {session.user?.role === 'admin' && (
            <Link
              href="/dashboard"
              className="xl:text-lg px-4 py-2 text-white hover:text-yellow-400 transition"
            >
              แดชบอร์ด
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="xl:text-lg px-4 py-2 text-white hover:text-red-400 transition"
          >
            ออกจากระบบ
          </button>
        </>
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
  );
}