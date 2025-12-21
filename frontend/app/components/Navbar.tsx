'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="w-full bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        
        {/* 🔥 LOGO + NAME */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"      // 🔥 your logo
            alt="CheetCode Logo"
            width={36}            // 🔥 NOT small
            height={36}
            priority
          />
          <span className="text-xl font-semibold tracking-wide text-white">
            CheetCode
          </span>
        </Link>

        {/* 🔹 RIGHT SIDE */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-zinc-300 hover:text-white text-sm"
          >
            Dashboard
          </Link>

          <Link
            href="/my-submissions"
            className="text-zinc-300 hover:text-white text-sm"
          >
            My Submissions
          </Link>

          {session && (
            <button
              onClick={() => signOut()}
              className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-sm"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
