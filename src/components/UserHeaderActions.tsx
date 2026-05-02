'use client';

import Link from 'next/link';
import { Home, LogOut, Mail } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function UserHeaderActions() {
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/';
        }
      }
    });
  };

  return (
    <div className="flex items-center gap-2 select-none">
      <Link
        href="/"
        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors border border-slate-200 bg-white"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Home</span>
      </Link>
      <a
        href="mailto:hello@fincasanmateo.test?subject=Finca%20San%20Mateo%20Support"
        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors border border-slate-200 bg-white"
      >
        <Mail className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Contact</span>
      </a>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-50 rounded-lg text-xs font-bold text-red-600 hover:text-red-700 transition-colors border border-slate-200 bg-white select-none cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </div>
  );
}
