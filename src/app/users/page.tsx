import Link from "next/link";
import { UserCheck, UserCog, Users } from "lucide-react";
import { getCurrentSession } from "@/lib/auth-session";
import { updateUserRole } from "@/app/actions/users";
import { getAdminUsers } from "@/services/AdminUsersService";
import { getAdminBookingSnapshot } from "@/services/AdminOpsService";

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatMoney(cents: number | null | undefined) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format((cents ?? 0) / 100);
}

const rolePalette: Record<string, { tone: string; label: string }> = {
  admin: { tone: "bg-emerald-50 text-emerald-700 border-emerald-100", label: "Admin" },
  user: { tone: "bg-slate-50 text-slate-700 border-slate-200", label: "User" },
};

export default async function UsersPage() {
  const session = await getCurrentSession();
  const [users, bookingSnapshot] = await Promise.all([
    getAdminUsers(),
    getAdminBookingSnapshot(),
  ]);

  return (
    <main className="min-h-screen bg-[#F5F2ED]">
      <section className="px-6 pt-16 pb-10 border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean">Testing control</p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-900">
              Switch roles, review bookings, and validate access.
            </h1>
            <p className="max-w-3xl text-slate-600 leading-relaxed">
              This is the testing console for admin-only use. Adjust roles, confirm who is signed in, and inspect the
              current booking pipeline before building the deeper admin modules.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ocean"
            >
              Back to admin
            </Link>
            <Link
              href="/user"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean"
            >
              View guest surface
            </Link>
          </div>

          <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-lg md:grid-cols-3">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-slate-400">Signed in as</p>
              <p className="mt-2 text-xl font-bold">{session?.user.name}</p>
              <p className="text-sm text-slate-300">{session?.user.email}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-slate-400">Role</p>
              <p className="mt-2 text-xl font-bold uppercase tracking-[0.2em] text-sky-200">
                {session?.user.role}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-slate-400">Environment</p>
              <p className="mt-2 text-xl font-bold text-slate-50">Development mode</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-slate-400">User control</p>
                <h2 className="text-2xl font-bold text-slate-900">Admin accounts</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-sand px-3 py-1 text-[10px] font-mono uppercase tracking-[0.25em] text-slate-600">
                <Users className="w-3.5 h-3.5" />
                {users.length} total
              </div>
            </div>

            <div className="space-y-4">
              {users.map((user) => {
                const tone = rolePalette[user.role]?.tone ?? "bg-slate-50 text-slate-700 border-slate-200";
                const label = rolePalette[user.role]?.label ?? user.role;

                return (
                  <div
                    key={user.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-slate-900">{user.name}</span>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.24em] ${tone}`}>
                            {label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
                          <span>Created {formatDate(user.createdAt)}</span>
                          <span>Sessions {user.sessions}</span>
                          <span>Last active {formatDate(user.lastActiveAt)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <form action={updateUserRole}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="role" value="user" />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-700 transition-colors hover:border-ocean hover:text-ocean"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Set user
                          </button>
                        </form>
                        <form action={updateUserRole}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="role" value="admin" />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-white transition-colors hover:bg-ocean"
                          >
                            <UserCog className="w-3.5 h-3.5" />
                            Set admin
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-slate-400">Bookings request</p>
              <h3 className="mt-3 text-xl font-bold text-slate-900">Pipeline snapshot</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                View the current distribution of bookings and the most recent requests.
              </p>

              <div className="mt-6 grid gap-3">
                {bookingSnapshot.statusSummary.map((row) => (
                  <div key={row.status} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500">{row.status}</span>
                    <span className="text-lg font-bold text-slate-900">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-slate-400">Latest requests</p>
              <div className="mt-4 space-y-4">
                {(bookingSnapshot.pendingRequests.length > 0
                  ? bookingSnapshot.pendingRequests
                  : bookingSnapshot.recentBookings
                ).map((booking) => (
                  <div key={booking.reference} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{booking.reference}</div>
                        <div className="text-xs text-slate-500 font-mono">
                          {booking.property_name} · {booking.guest_email}
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
                          {formatDate(booking.check_in)} to {formatDate(booking.check_out)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">{formatMoney(booking.total_cents)}</div>
                        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-ocean">{booking.payment_state ?? "unpaid"}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
