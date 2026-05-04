import Link from 'next/link';
import { Compass, ExternalLink, Folder, Map, Terminal, FileCode } from 'lucide-react';

const routeGroups = [
  {
    category: 'Guest Routes',
    routes: [
      { path: '/', label: 'Home page', description: 'Public marketing & intro page' },
      { path: '/finca', label: 'Browse properties', description: 'Listing view with real availability widget' },
      { path: '/finca/levante', label: 'Property details', description: 'Comprehensive property breakdown & bookings' },
      { path: '/booking', label: 'Booking lookup', description: 'Track booking details by reference' },
      { path: '/booking/SM-SAMPLE', label: 'Booking confirmation', description: 'Confirmation page after new booking' },
    ],
  },
  {
    category: 'Authentication & Role Management',
    routes: [
      { path: '/sign-in', label: 'Sign-in page', description: 'Authentication portal for operations' },
      { path: '/user', label: 'Role switch tool', description: 'Interactive panel to switch roles between user/admin' },
      { path: '/users', label: 'User management', description: 'User administration and control' },
    ],
  },
  {
    category: 'Admin Management',
    routes: [
      { path: '/admin', label: 'Overview dashboard', description: 'Live revenue, stats, and recent booking items' },
      { path: '/admin/bookings', label: 'All bookings', description: 'Full listings of real-time client registrations' },
      { path: '/admin/bookings/id', label: 'Booking detail', description: 'Cancellation, payments, events, and status forms' },
      { path: '/admin/guests', label: 'All guests', description: 'Spend, completed stays, reviews, and notes' },
      { path: '/admin/guests/id', label: 'Guest profile', description: 'Profiles and lifetime stay details' },
      { path: '/admin/properties', label: 'All properties', description: 'Management of finca properties' },
      { path: '/admin/properties/levante', label: 'Property edit & view', description: 'Manage amenities, photos, and base fees' },
      { path: '/admin/payments', label: 'Payments list', description: 'Deposit and balance settlement history' },
    ],
  },
  {
    category: 'Developer & API',
    routes: [
      { path: '/debug', label: 'Debug dashboard', description: 'Internal testing and database visualization tools' },
      { path: '/api/bookings/SM-SAMPLE', label: 'Booking lookup API', description: 'JSON response endpoint for reference queries' },
      { path: '/api/auth/all', label: 'Authentication API', description: 'Better Auth server plugin listener' },
    ],
  },
];

const worktree = `
san-mateo/src/app/
├── actions/
│   ├── admin-bookings.ts
│   ├── admin-guests.ts
│   ├── auth.ts
│   ├── booking.ts
│   ├── mock.ts
│   └── users.ts
├── admin/
│   ├── bookings/
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── guests/
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── payments/
│   │   └── page.tsx
│   ├── properties/
│   │   ├── [slug]/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── api/
│   ├── auth/
│   │   └── [...all]/
│   │       └── route.ts
│   └── bookings/
│       └── [reference]/
│           └── route.ts
├── booking/
│   ├── [reference]/
│   │   └── page.tsx
│   └── page.tsx
├── debug/
│   └── page.tsx
├── finca/
│   ├── [slug]/
│   │   └── page.tsx
│   └── page.tsx
├── routes/
│   └── page.tsx
├── sign-in/
│   └── page.tsx
├── user/
│   └── page.tsx
├── users/
│   ├── layout.tsx
│   └── page.tsx
├── layout.tsx
└── page.tsx
`.trim();

export default function RoutesPage() {
  return (
    <main className="min-h-screen bg-[#F5F2ED] px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Top heading */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean mb-2">Development utility</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-900">
                Application Map & Worktree
              </h1>
            </div>
            <Link
              href="/"
              className="rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-ocean"
            >
              ← Back to site
            </Link>
          </div>
          <p className="max-w-3xl text-slate-600 leading-relaxed text-sm">
            Quick reference directory outlining all operational pages, dynamic sub-pages, file tree layouts, and API endpoints across the San Mateo platform.
          </p>
        </section>

        {/* 2 column grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* Column 1: Application File Worktree */}
          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Folder className="w-4 h-4 text-ocean" />
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">File structure &amp; worktree</p>
              </div>
              <pre className="text-xs bg-slate-50 border border-slate-100 rounded-2xl p-5 font-mono text-slate-700 leading-relaxed overflow-x-auto select-all h-[calc(100%-2.5rem)]">
                {worktree}
              </pre>
            </div>
          </section>

          {/* Column 2: Route Mapping */}
          <div className="space-y-6">
            {routeGroups.map((group) => (
              <section key={group.category} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Map className="w-4 h-4 text-ocean" />
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">{group.category}</p>
                </div>

                <div className="space-y-3">
                  {group.routes.map((route) => (
                    <Link
                      key={route.path}
                      href={route.path}
                      className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 transition-all hover:-translate-y-0.5 group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-ocean transition-colors" />
                          <span className="text-xs font-mono font-bold tracking-wide text-slate-900">{route.path}</span>
                        </div>
                        <div className="text-sm font-semibold text-slate-700 mt-2">{route.label}</div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{route.description}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-ocean shrink-0 transition-all transform group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
