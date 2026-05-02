'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Building2,
  CalendarCheck,
  LayoutGrid,
  ShieldCheck,
  Users,
  UserCircle2,
  ArrowUpRight,
  Wallet,
} from 'lucide-react';

type AdminSidebarProps = {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
};

const primaryNav = [
  { href: '/admin', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/properties', label: 'Properties', icon: Building2 },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/admin/guests', label: 'Guests', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: Wallet },
];

const adminNav = [
  { href: '/users', label: 'Users & Roles', icon: ShieldCheck },
];

const quickLinks = [
  { href: '/finca', label: 'Guest booking' },
  { href: '/booking', label: 'Booking lookup' },
];

function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: typeof LayoutGrid }) {
  const pathname = usePathname();
  const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
        isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  return (
    <aside className="sticky top-0 h-screen w-72 shrink-0 border-r border-slate-200 bg-white px-6 py-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <UserCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-slate-400">Admin</p>
          <p className="text-sm font-bold text-slate-900">Finca San Mateo</p>
        </div>
      </div>

      <div className="mt-8 space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Navigation</div>
        <div className="space-y-1">
          {primaryNav.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Access</div>
        <div className="space-y-1">
          {adminNav.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Quick links</div>
        <div className="space-y-2">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 hover:border-ocean hover:text-ocean"
            >
              {item.label}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
