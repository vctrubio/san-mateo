'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, CalendarSearch, Terminal, Map } from 'lucide-react';

const links = [
  { href: '/finca',   label: 'Browse & Book', icon: Home },
  { href: '/booking', label: 'My Booking',    icon: CalendarSearch },
  { href: '/admin',   label: 'Admin View',    icon: LayoutDashboard },
  { href: '/routes',  label: 'Routes',        icon: Map },
  { href: '/debug',   label: 'Debug',         icon: Terminal },
];

export default function DemoBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1 bg-slate-950/90 backdrop-blur-md border border-white/10 rounded-full px-3 py-2 shadow-2xl shadow-black/40">
      <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-white/30 px-2 select-none hidden sm:inline">
        Demo
      </span>
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all ${
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
      <Link
        href="/user"
        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] text-sky-400 hover:bg-sky-400/10 transition-all"
      >
        <span className="hidden sm:inline">Switch role</span>
        <span className="sm:hidden">⇄</span>
      </Link>
    </div>
  );
}
