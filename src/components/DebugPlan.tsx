'use client';

import React from 'react';
import { CheckCircle2, Circle, ArrowRight, ListTodo, Map as MapIcon, CreditCard, Bell, Users, Settings } from 'lucide-react';

const roadmap = [
  { id: 1, title: 'Luxury Frontend', desc: 'Apple-style landing, property peek, and floating availability bar.', status: 'done' },
  { id: 2, title: 'MySQL Architecture', desc: 'Atomic slots, state machines, and resilient booking persistence.', status: 'done' },
  { id: 3, title: 'Live Availability', desc: 'Real-time calendar feedback with direct database check.', status: 'done' },
  { id: 4, title: 'Stripe Integration', desc: 'Secure payment processing and deposit handling.', status: 'todo' },
  { id: 5, title: 'Automated Concierge', desc: 'WhatsApp & Email confirmations for guests and staff.', status: 'todo' },
  { id: 6, title: 'Guest Experience', desc: 'Digital check-in, estate map, and local recommendations.', status: 'todo' },
  { id: 7, title: 'Admin Master', desc: 'Internal dashboard for cleaning staff and booking management.', status: 'todo' },
  { id: 8, title: 'Seasonal Engine', desc: 'Dynamic pricing rules for high/low season and holidays.', status: 'todo' },
];

export default function DebugPlan() {
  return (
    <section className="py-32 px-4 bg-[#F9F7F2] border-t border-slate-100">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-20 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ListTodo className="w-4 h-4 text-ocean" />
              <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean">Project Roadmap</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tighter uppercase">The Grand Vision</h2>
          </div>
          <div className="px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Phase 1: Foundation Complete</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
          {roadmap.map((t) => (
            <div 
              key={t.id} 
              className={`p-10 transition-all ${t.status === 'done' ? 'bg-white border-b-4 border-ocean/20' : 'bg-slate-50/50 border-b-4 border-transparent opacity-60'}`}
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-300">0{t.id}</span>
                {t.status === 'done' ? (
                  <CheckCircle2 className="w-5 h-5 text-ocean" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-200" />
                )}
              </div>
              <h4 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-4">{t.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">{t.desc}</p>
              {t.status === 'todo' && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-ocean uppercase tracking-widest">
                  Upcoming <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Future Integrations */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-slate-200/60">
          <div className="flex items-start gap-4">
            <CreditCard className="w-5 h-5 text-slate-400 mt-1" />
            <div>
              <h5 className="text-xs font-bold text-slate-900 uppercase mb-2">Secure Payments</h5>
              <p className="text-xs text-slate-500 leading-relaxed">Integration with Stripe and RedSys for local Spanish bank support.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Bell className="w-5 h-5 text-slate-400 mt-1" />
            <div>
              <h5 className="text-xs font-bold text-slate-900 uppercase mb-2">WhatsApp API</h5>
              <p className="text-xs text-slate-500 leading-relaxed">Direct automated communication for check-in codes and house rules.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Users className="w-5 h-5 text-slate-400 mt-1" />
            <div>
              <h5 className="text-xs font-bold text-slate-900 uppercase mb-2">Staff Portal</h5>
              <p className="text-xs text-slate-500 leading-relaxed">Mobile dashboard for cleaning schedules and inventory tracking.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
