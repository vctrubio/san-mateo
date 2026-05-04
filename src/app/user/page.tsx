import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Calendar, CreditCard, Shield, User, RefreshCw, Sparkles, MapPin, CheckCircle, Heart, MessageCircle, Bookmark, Compass } from 'lucide-react';
import { updateDevRole } from '@/app/actions/auth';
import { getCurrentSession } from '@/lib/auth-session';
import { pool } from '../../../db/client';
import UserHeaderActions from '@/components/UserHeaderActions';

export default async function UserPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const bookingSuccess = params.bookingSuccess === 'true';
  const reference = typeof params.reference === 'string' ? params.reference : undefined;

  const session = await getCurrentSession();

  if (!session) {
    redirect('/sign-in?callbackUrl=/user');
  }

  // Fetch associated bookings
  let bookings: any[] = [];

  const [rows] = await pool.query(
    `SELECT b.*, p.name as property_name, p.slug as property_slug
     FROM bookings b
     JOIN properties p ON p.id = b.property_id
     WHERE b.user_id = ?
     ORDER BY b.check_in DESC`,
    [session.user.id]
  ) as any[];
  bookings = rows || [];

  // Find the new booking details if referenced in URL
  const activeNewBooking = bookings.find(b => b.reference === reference);


  return (
    <main className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-12 space-y-12">

        {/* Profile Header (High-End Instagram/SaaS style) */}
        <section className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-14 border-b border-slate-200/60 pb-12 select-none">
          {/* Circular Story Avatar */}
          <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-1 shrink-0 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg shadow-rose-500/10">
            <div className="w-full h-full bg-white rounded-full p-1">
              <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center font-extrabold text-3xl md:text-5xl text-slate-700 tracking-tight select-none">
                {session.user.name?.[0] ?? '?'}
              </div>
            </div>
          </div>

          {/* User Info & Quick Links */}
          <div className="flex-1 flex flex-col justify-center gap-5 text-center md:text-left w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
                  {session.user.name}
                </h1>
                <Link 
                  href="/finca"
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold tracking-wide transition-all border border-slate-200/40 select-none"
                >
                  Book a stay
                </Link>
              </div>
              <UserHeaderActions />
            </div>

            {/* Profile Statistics (Instagram style bio layout) */}
            <div className="flex items-center justify-center md:justify-start gap-8 text-sm select-none">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-base">{bookings.length}</span>
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">stays</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-base capitalize">{session.user.role}</span>
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">role</span>
              </div>
            </div>

            {/* Address & Credentials info */}
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800 font-mono tracking-tight">{session.user.email}</p>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-[0.2em]">
                Spain &middot; Tarifa Coastal Estate &middot; San Mateo
              </p>
            </div>
          </div>
        </section>

        {/* Booking Confirmation Alert/Banner */}
        {activeNewBooking && (
          <section className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-200/50 rounded-3xl p-6 md:p-8 space-y-5 flex flex-col md:flex-row md:items-center justify-between gap-6 select-none shadow-sm shadow-emerald-500/5 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-sm text-emerald-600 animate-pulse">
                  🎉
                </div>
                <h3 className="text-sm font-extrabold text-emerald-900 tracking-tight">
                  Booking SM-{activeNewBooking.reference} successfully created!
                </h3>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed max-w-xl">
                Your reservation at <span className="font-extrabold text-slate-900 capitalize">{activeNewBooking.property_name}</span> is confirmed for{' '}
                <span className="font-bold text-slate-800">
                  {new Date(activeNewBooking.check_in).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' to '}
                  {new Date(activeNewBooking.check_out).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>.
                We are now preparing the final arrangements for your upcoming stay.
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="px-2.5 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-bold text-slate-700 shadow-sm uppercase tracking-wider">
                  Total: €{Math.floor(activeNewBooking.total_cents / 100).toLocaleString()}
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100/50 rounded-full text-[10px] font-bold text-emerald-800 shadow-sm uppercase tracking-wider">
                  Deposit: €{Math.floor(activeNewBooking.deposit_cents / 100).toLocaleString()} Paid
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0 sm:w-48">
              <Link
                href={`/booking/${activeNewBooking.reference}`}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm hover:shadow tracking-wider"
              >
                <span>View Receipt</span>
              </Link>
              <Link
                href={`/booking?reference=${activeNewBooking.reference}`}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all shadow-sm hover:shadow tracking-wider"
              >
                <span>Booking lookup</span>
              </Link>
            </div>
          </section>
        )}

        {/* Stories/Quick Collections Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-slate-400 select-none">Finca Stays Collection</h2>
          <div className="flex items-center gap-6 overflow-x-auto py-2 select-none">
            {[
              { id: 'levante', name: 'Levante', image: '/images/levante.png' },
              { id: 'estrecho', name: 'Estrecho', image: '/images/estrecho.png' },
              { id: 'marea', name: 'Marea', image: '/images/marea.png' },
              { id: 'cala', name: 'Cala', image: '/images/cala.png' }
            ].map((col) => (
              <Link
                key={col.id}
                href={`/finca/${col.id}`}
                className="flex flex-col items-center gap-2 group cursor-pointer shrink-0"
              >
                <div className="w-16 h-16 rounded-full border-2 border-slate-200 group-hover:border-rose-500 p-0.5 transition-all duration-300 flex items-center justify-center bg-white shadow-sm overflow-hidden">
                  <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-slate-50 group-hover:scale-110 transition-transform duration-300">
                    <Image
                      src={col.image}
                      alt={col.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                  {col.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Main Stays Feed (Instagram Post Style) */}
        <section className="space-y-8 select-none">
          <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-slate-400">Your stays feed</h2>

          {bookings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-4">
              <Compass className="w-10 h-10 text-slate-300 animate-pulse" />
              <div>
                <p className="font-semibold text-slate-700 text-base">No bookings found yet</p>
                <p className="text-slate-400 text-xs mt-1">Ready to experience Finca San Mateo? Tap below to explore.</p>
              </div>
              <Link
                href="/finca"
                className="mt-2 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white hover:bg-ocean hover:shadow-lg transition-all"
              >
                Browse stays
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {bookings.map((booking) => (
                <div 
                  key={booking.id}
                  className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  {/* Post top header */}
                  <div className="p-4 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center font-bold text-xs text-rose-500">
                        {booking.property_name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>{booking.property_name}</span>
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono uppercase tracking-wider ${
                            booking.status === 'confirmed' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                            booking.status === 'completed' ? 'border-sky-200 bg-sky-50 text-sky-700' :
                            'border-amber-200 bg-amber-50 text-amber-700'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono tracking-wider">
                          Ref: {booking.reference}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/booking/${booking.reference}`}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 uppercase tracking-widest flex items-center gap-1 transition-colors"
                    >
                      View receipt
                    </Link>
                  </div>

                  {/* High Quality Visual Image */}
                  <div className="relative aspect-[16/9] w-full bg-slate-100">
                    <Image
                      src={`/images/${booking.property_slug}.png`}
                      alt={booking.property_name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Booking Financial Overview */}
                  <div className="p-4 flex items-center justify-between border-b border-slate-50 bg-slate-50/40">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Financial Summary
                    </span>
                    <span className="text-xs font-bold text-slate-800 tracking-wide bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                      Deposit paid: €{Math.floor(booking.deposit_cents / 100).toLocaleString()}
                    </span>
                  </div>

                  {/* Caption / Stay Details */}
                  <div className="p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5 text-xs text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-800">
                          {new Date(booking.check_in).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' - '}
                          {new Date(booking.check_out).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-800">
                          Total: €{Math.floor(booking.total_cents / 100).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-500 border-t border-slate-50 pt-3">
                      <span className="font-bold text-slate-900 mr-2">{booking.property_name}</span>
                      Your stay was requested directly through our finca portal. We are getting the final arrangements ready for your upcoming trip!
                    </p>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

        {/* Fast Development Components Section below the main layout */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean">Developer Tooling</span>
              <span className="px-2 py-0.5 rounded-full border border-slate-200 bg-sand text-[9px] font-mono uppercase tracking-widest text-slate-600">Role Switcher</span>
            </div>
            <p className="text-xs text-slate-500">
              Quickly jump between different account capabilities for easy local verification.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <form action={updateDevRole}>
              <input type="hidden" name="role" value="user" />
              <button
                type="submit"
                className="w-full flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all hover:shadow-sm"
              >
                <span className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Use User Account</span>
                </span>
                <RefreshCw className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </button>
            </form>

            <form action={updateDevRole}>
              <input type="hidden" name="role" value="admin" />
              <button
                type="submit"
                className="w-full flex items-center justify-between rounded-xl bg-slate-900 px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-ocean transition-all hover:shadow-lg hover:shadow-ocean/10 hover:-translate-y-0.5"
              >
                <span className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Use Admin Account</span>
                </span>
                <RefreshCw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            </form>
          </div>
        </section>

      </div>
    </main>
  );
}
