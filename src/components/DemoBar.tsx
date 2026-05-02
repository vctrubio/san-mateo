'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, CalendarSearch, Terminal, Map, Shield, User, ChevronDown, LogOut } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleUserRole } from '@/app/actions/auth';

const links = [
  { href: '/finca',   label: 'Browse & Book', icon: Home },
  { href: '/booking', label: 'My Booking',    icon: CalendarSearch },
  { href: '/admin',   label: 'Admin View',    icon: LayoutDashboard },
  { href: '/routes',  label: 'Routes',        icon: Map },
  { href: '/debug',   label: 'Debug',         icon: Terminal },
];

export default function DemoBar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1 bg-slate-950/90 backdrop-blur-md border border-white/10 rounded-full px-3 py-2 shadow-2xl shadow-black/40">
      <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-white/30 px-2 select-none hidden md:inline">
        Demo
      </span>
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all ${
              active
                ? 'bg-white text-slate-900'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}

      {/* User Session Dropdown toggle */}
      <div className="relative ml-1 select-none">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] text-sky-400 hover:bg-sky-400/10 transition-all cursor-pointer ${
            dropdownOpen ? 'bg-white/15 text-white' : ''
          }`}
        >
          {session ? (
            <>
              <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px]">
                {session.user.name?.[0] ?? '?'}
              </span>
              <span className="hidden md:inline max-w-[80px] truncate">
                {session.user.role ?? 'User'}
              </span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Role</span>
              <span className="sm:hidden">⇄</span>
            </>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Floating role dropdown above the bar */}
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full mb-3 right-0 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 space-y-3 z-50 select-none"
            >
              {session ? (
                <div className="border-b border-white/5 pb-3">
                  <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/40 mb-1">
                    Authenticated as
                  </div>
                  <div className="text-sm font-bold text-white truncate">{session.user.name}</div>
                  <div className="text-[10px] text-white/50 font-mono truncate">{session.user.email}</div>
                  <div className="mt-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[9px] font-mono uppercase tracking-wider font-bold">
                      {session.user.role}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="border-b border-white/5 pb-3">
                  <div className="text-[10px] text-white/50">No active session found</div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <button
                  onClick={async () => {
                    setDropdownOpen(false);
                    await toggleUserRole();
                  }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 text-white/80 hover:text-white transition-colors w-full text-left select-none cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold uppercase tracking-[0.15em]">Switch role</span>
                  </span>
                </button>
                <Link
                  href="/user"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 text-white/80 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold uppercase tracking-[0.15em]">User Dashboard</span>
                  </span>
                </Link>
                <Link
                  href="/sign-in"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 text-white/80 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <LogOut className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold uppercase tracking-[0.15em]">Sign in</span>
                  </span>
                </Link>
                {session && (
                  <button
                    onClick={async () => {
                      setDropdownOpen(false);
                      await authClient.signOut({
                        fetchOptions: {
                          onSuccess: () => {
                            window.location.href = '/';
                          }
                        }
                      });
                    }}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors w-full text-left"
                  >
                    <span className="flex items-center gap-2.5">
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-bold uppercase tracking-[0.15em]">Sign out</span>
                    </span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
