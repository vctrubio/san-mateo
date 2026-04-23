'use client';

import React from 'react';
import { CheckCircle2, Database, Zap, Shield, Layout } from 'lucide-react';

const tasks = [
  { id: 1, title: 'Atomic Schema', desc: 'MySQL slots table with unique constraints to prevent double-booking.', status: 'done', icon: Database },
  { id: 2, title: 'State Machine', desc: 'Bookings move through PENDING -> RESERVED -> CONFIRMED states.', status: 'done', icon: Shield },
  { id: 3, title: 'Pricing Engine', desc: 'Automated calculation of cleaning fees and pet surcharges.', status: 'done', icon: Zap },
  { id: 4, title: 'Premium UI', desc: 'Flight-style availability bar with real-time feedback and modals.', status: 'done', icon: Layout },
];

export default function DebugPlan() {
  return (
    <section className="py-24 px-4 bg-slate-950 text-white">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-2 h-2 bg-ocean rounded-full animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean">System Architecture Audit</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tasks.map((t) => (
            <div key={t.id} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-ocean/30 transition-all group">
              <div className="mb-6 flex items-center justify-between">
                <t.icon className="w-6 h-6 text-ocean" />
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-3 group-hover:text-ocean transition-colors">{t.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">{t.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-4">
            <h5 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Active Services</h5>
            <div className="flex flex-wrap gap-3">
              {['BookingService', 'AvailabilityService', 'PricingEngine', 'StateOrchestrator'].map(s => (
                <span key={s} className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-mono text-slate-300 border border-white/10">{s}</span>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h5 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Security Layer</h5>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-green-500" />
              <span className="text-[10px] font-mono text-slate-300 uppercase">Atomic Transactions Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
