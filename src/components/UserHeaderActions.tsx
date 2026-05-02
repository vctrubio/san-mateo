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
    <div className="flex items-center gap-2 select-none shrink-0">
      <Link
        href="/"
        title="Go to Homepage"
        className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all duration-200 shadow-sm hover:shadow"
      >
        <Home className="w-4 h-4" />
      </Link>
      <a
        href="mailto:hello@fincasanmateo.test?subject=Finca%20San%20Mateo%20Support"
        title="Contact Host"
        className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all duration-200 shadow-sm hover:shadow"
      >
        <Mail className="w-4 h-4" />
      </a>
      <button
        onClick={handleLogout}
        title="Sign Out"
        className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 transition-all duration-200 shadow-sm hover:shadow select-none cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
