import Link from 'next/link';
import HeroLanding from '@/components/HeroLanding';
import PropertyShowcase from '@/components/PropertyShowcase';
import PropertyAvailability from '@/components/PropertyAvailability';
import Footer from '@/components/Footer';
import { updateDevRole } from '@/app/actions/auth';
import { getCurrentSession } from '@/lib/auth-session';

const userSteps = [
  {
    title: 'Browse properties',
    description: 'See the four stays, their capacity, and the character of each space.',
  },
  {
    title: 'Check dates',
    description: 'Use the availability flow to compare dates and guest counts.',
  },
  {
    title: 'Reserve a stay',
    description: 'Create a booking request and move toward deposit collection.',
  },
];

export default async function UserPage() {
  const session = await getCurrentSession();

  return (
    <main className="min-h-screen">
      <section className="px-6 pt-10 pb-8 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean">Guest view</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-900 max-w-4xl">
            This is what the booking experience should feel like for a guest.
          </h1>
          <p className="max-w-3xl text-slate-600 leading-relaxed">
            The public route stays focused on discovery, availability, and reservation intent. It hides the admin-only
            operational panels and keeps the booking path simple.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ocean">
              Back to landing
            </Link>
            <Link href="/finca" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean">
              Browse finca stays
            </Link>
            <Link href="/admin" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean">
              Open admin dashboard
            </Link>
            {session?.user.role === 'admin' ? (
              <Link href="/users" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean">
                User control panel
              </Link>
            ) : null}
            <Link href="/sign-in" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean">
              Sign in again
            </Link>
          </div>

          <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-lg md:grid-cols-[1.3fr_0.7fr]">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-slate-400">Current session</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">{session?.user.name}</h2>
              <p className="text-sm text-slate-300">{session?.user.email}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.35em] text-sky-200">Role: {session?.user.role}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-slate-300">Development tool</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Switch your own Better Auth role here so you can test both guest and admin experiences without
                leaving the app.
              </p>

              {process.env.NODE_ENV !== 'production' ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <form action={updateDevRole}>
                    <input type="hidden" name="role" value="user" />
                    <button
                      type="submit"
                      className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition-colors hover:bg-white/20"
                    >
                      Switch to user
                    </button>
                  </form>
                  <form action={updateDevRole}>
                    <input type="hidden" name="role" value="admin" />
                    <button
                      type="submit"
                      className="w-full rounded-full bg-sky-500 px-4 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition-colors hover:bg-sky-400"
                    >
                      Switch to admin
                    </button>
                  </form>
                </div>
              ) : (
                <p className="mt-4 text-xs text-slate-400">Role switching is disabled in production.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-10 bg-[#F5F2ED] border-b border-slate-200">
        <div className="max-w-6xl mx-auto grid gap-4 md:grid-cols-3">
          {userSteps.map((step, index) => (
            <div key={step.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-slate-400 mb-4">Step {index + 1}</p>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h2>
              <p className="text-sm leading-relaxed text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <HeroLanding />
      <PropertyShowcase />
      <PropertyAvailability />
      <Footer />
    </main>
  );
}
