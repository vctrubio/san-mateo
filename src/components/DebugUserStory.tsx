import Link from "next/link";
import { ArrowUpRight, ClipboardList, Lock, User } from "lucide-react";

const quickLinks = [
  { href: "/sign-in", label: "Sign in / sign up", description: "Create or access a Better Auth user." },
  { href: "/finca", label: "Finca inventory", description: "Browse stays and start a booking." },
  { href: "/user", label: "Guest surface", description: "Preview the guest-facing flow." },
  { href: "/booking", label: "Booking lookup", description: "Check booking status by reference." },
  { href: "/admin", label: "Admin dashboard", description: "View operational summaries." },
  { href: "/users", label: "User control", description: "Switch roles and see booking snapshot." },
  { href: "/admin/bookings", label: "Bookings", description: "Placeholder booking pipeline." },
  { href: "/admin/properties", label: "Properties", description: "Placeholder inventory editor." },
  { href: "/admin/guests", label: "Guests", description: "Placeholder guest CRM view." },
];

export default function DebugUserStory() {
  return (
    <section className="px-6 py-16 bg-white border-t border-slate-200">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean">Debug user story</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-900">
            Jump straight into the current testing flow.
          </h2>
          <p className="max-w-3xl text-slate-600 leading-relaxed">
            Use these shortcuts to move between the guest and admin surfaces, switch roles, and validate the
            seeded booking data while we keep building.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-ocean/40 hover:bg-white hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono uppercase tracking-[0.3em] text-slate-400">Shortcut</p>
                <ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-ocean" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{link.label}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{link.description}</p>
            </Link>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 text-slate-300">
              <ClipboardList className="h-4 w-4 text-sky-200" />
              <p className="text-[10px] font-mono uppercase tracking-[0.35em]">Suggested path</p>
            </div>
            <ol className="mt-4 space-y-3 text-sm text-slate-100">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-300" />
                Sign in as the seeded admin or create a new account.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-300" />
                Use <span className="font-semibold">/users</span> to toggle roles and verify access.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-300" />
                Review bookings, guests, and analytics placeholders.
              </li>
            </ol>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-sand p-6 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <Lock className="h-4 w-4" />
              <p className="text-[10px] font-mono uppercase tracking-[0.35em]">Seeded admin</p>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center gap-2 text-slate-700">
                <User className="h-4 w-4 text-ocean" />
                <span className="text-sm font-semibold">admin@sanmateo.test</span>
              </div>
              <div className="mt-2 font-mono text-[11px] text-slate-500">Password: SanMateoAdmin123!</div>
            </div>
            <p className="mt-4 text-xs text-slate-500 leading-relaxed">
              Reset the database any time to restore the seed data and admin credentials.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
