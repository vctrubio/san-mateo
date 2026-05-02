import Link from 'next/link';
import { Shield, User, ArrowLeft, RefreshCw, LogOut } from 'lucide-react';
import { updateDevRole } from '@/app/actions/auth';
import { getCurrentSession } from '@/lib/auth-session';

export default async function UserPage() {
  const session = await getCurrentSession();

  return (
    <main className="min-h-screen bg-[#F5F2ED] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-2xl shadow-slate-200/60 space-y-6">
        
        {/* Header info */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean">Account context</span>
            <span className="px-2.5 py-1 rounded-full border border-slate-200 bg-sand text-[9px] font-mono uppercase tracking-widest text-slate-600">Dev Tool</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-slate-900">Change role status</h1>
          <p className="text-xs text-slate-500 leading-relaxed mt-1">
            Quickly switch the role of the logged-in session for end-to-end testing.
          </p>
        </div>

        {/* Current user session */}
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-ocean/10 flex items-center justify-center text-ocean font-bold">
              {session?.user.name?.[0] ?? '?'}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{session?.user.name ?? 'Guest'}</div>
              <div className="text-xs text-slate-400 font-mono">{session?.user.email ?? 'No email available'}</div>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Current active role</span>
            <span className="px-2.5 py-0.5 rounded-full border border-sky-200 bg-sky-50 text-[10px] font-mono uppercase tracking-wider text-ocean font-bold">
              {session?.user.role ?? 'guest'}
            </span>
          </div>
        </div>

        {/* Action switch buttons */}
        <div className="space-y-3">
          <form action={updateDevRole}>
            <input type="hidden" name="role" value="user" />
            <button
              type="submit"
              className="w-full flex items-center justify-between rounded-xl bg-white border border-slate-200 px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all hover:shadow-sm"
            >
              <span className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Switch to user</span>
              </span>
              <RefreshCw className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            </button>
          </form>

          <form action={updateDevRole}>
            <input type="hidden" name="role" value="admin" />
            <button
              type="submit"
              className="w-full flex items-center justify-between rounded-xl bg-slate-900 px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-ocean transition-all hover:shadow-lg hover:shadow-ocean/20 hover:-translate-y-0.5"
            >
              <span className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Switch to admin</span>
              </span>
              <RefreshCw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
          </form>
        </div>

        {/* Back navigation */}
        <div className="border-t border-slate-100 pt-5 flex items-center justify-between flex-wrap gap-3">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-ocean transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to site</span>
          </Link>
          <Link href="/sign-in" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign in again</span>
          </Link>
        </div>

      </div>
    </main>
  );
}
