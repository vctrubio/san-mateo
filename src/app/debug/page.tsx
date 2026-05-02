import Link from 'next/link';
import DebugColorPanel from '@/components/DebugColorPanel';
import DebugDatabasePanel from '@/components/DebugDatabasePanel';
import DebugPlan from '@/components/DebugPlan';
import DebugSchema from '@/components/DebugSchema';
import DebugUserStory from '@/components/DebugUserStory';

export default async function DebugPage() {
  return (
    <main className="min-h-screen bg-[#F5F2ED] px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Top Header */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean mb-2">Internal Utility</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-900">
                Debug &amp; Architecture Suite
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
            Visual workspace showing the system architecture, design systems, physical models, data schemas, and user stories so far.
          </p>
        </section>

        {/* Database & Schema section */}
        <div className="space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400">Database &amp; Storage</p>
          <div className="space-y-6">
            <DebugDatabasePanel />
            <DebugSchema />
          </div>
        </div>

        {/* Color system & typography */}
        <div className="space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400">UI Theme &amp; Typography</p>
          <DebugColorPanel />
        </div>

        {/* Development planning and User Stories */}
        <div className="space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400">Project Blueprint &amp; Stories</p>
          <div className="space-y-6">
            <DebugPlan />
            <DebugUserStory />
          </div>
        </div>

      </div>
    </main>
  );
}
