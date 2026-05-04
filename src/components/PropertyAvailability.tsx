'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Users, ArrowRight, ChevronDown, ChevronLeft, ChevronRight, X, Moon, Home, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, startOfDay, addDays, isBefore, differenceInDays } from 'date-fns';
import { checkPropertyAvailability, getAllProperties, createInitialBooking, getBusyDates } from '@/app/actions/booking';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function PropertyAvailability({ preselectedSlug }: { preselectedSlug?: string } = {}) {
  const router = useRouter();
  const [dates, setDates] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activePopover, setActivePopover] = useState<'dates' | 'guests' | 'properties' | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [busyDates, setBusyDates] = useState<Date[]>([]);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  
  // Inline Auth State
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  
  const { data: session } = authClient.useSession();

  const [config, setConfig] = useState({
    adults: 2, children: 0, babies: 0, needsCrib: false, hasPets: false, dogs: 0, cats: 0
  });

  useEffect(() => {
    getAllProperties().then((data: any) => {
      setProperties(data);
      if (data && data.length > 0) {
        const match = preselectedSlug ? data.find((p: any) => p.slug === preselectedSlug) : null;
        setSelectedProperty(match ?? data[0]);
      }
    });

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [preselectedSlug]);

  useEffect(() => {
    if (selectedProperty) {
      getBusyDates(selectedProperty.id, currentMonth).then(dates => {
        setBusyDates(dates);
      });
    }
  }, [selectedProperty, currentMonth]);

  useEffect(() => {
    if (dates.start && dates.end && selectedProperty) {
      setIsChecking(true);
      checkPropertyAvailability(selectedProperty.id, dates.start, dates.end).then(available => {
        setIsAvailable(available);
        setIsChecking(false);
      });
    } else {
      setIsAvailable(null);
    }
  }, [dates, selectedProperty]);

  const totalGuests = config.adults + config.children + config.babies;

  const handleDateClick = (day: Date) => {
    if (!dates.start || (dates.start && dates.end)) {
      setDates({ start: day, end: null });
    } else if (isBefore(day, dates.start) || isSameDay(day, dates.start)) {
      setDates({ start: day, end: null });
    } else {
      setDates({ ...dates, end: day });
      if (!preselectedSlug) {
        setTimeout(() => setActivePopover('guests'), 300);
      }
    }
  };

  const handleReserveClick = () => {
    if (!selectedProperty || !dates.start || !dates.end || isAvailable === false) return;
    setShowGuestForm(true);
  };

  const handleBooking = async () => {
    if (!selectedProperty || !dates.start || !dates.end || isAvailable === false) return;
    
    if (!session?.user && (!guestFirstName.trim() || !guestLastName.trim() || !guestEmail.trim())) return;

    const finalFirstName = session?.user ? session.user.name.split(' ')[0] : guestFirstName;
    const finalLastName = session?.user ? session.user.name.split(' ').slice(1).join(' ') || 'Guest' : guestLastName;
    const finalEmail = session?.user ? session.user.email : guestEmail;

    setIsBooking(true);
    const res = await createInitialBooking(
      {
        propertyId: selectedProperty.id,
        startDate: dates.start,
        endDate: dates.end,
        ...config,
      },
      finalFirstName,
      finalLastName,
      finalEmail,
    );
    setIsBooking(false);

    if (res.success) {
      router.push(`/user?bookingSuccess=true&reference=${(res as any).reference}`);
    } else {
      alert(`Error: ${(res as any).error}`);
    }
  };

  const handleInlineAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;
    if (authMode === 'sign-up' && !authName) return;

    setAuthLoading(true);
    setAuthError(null);

    let res;
    if (authMode === 'sign-in') {
      res = await authClient.signIn.email({ email: authEmail, password: authPassword });
    } else {
      res = await authClient.signUp.email({ email: authEmail, password: authPassword, name: authName });
    }

    if (res.error) {
      setAuthError(res.error.message || 'Authentication failed');
      setAuthLoading(false);
    } else {
      // Success, session will be updated automatically by useSession hook
      setAuthLoading(false);
    }
  };

  const renderMonth = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    const emptyDays = Array(start.getDay()).fill(null);

    return (
      <div className="flex-1 min-w-[260px]">
        <h4 className="text-sm font-bold text-slate-900 mb-4 px-2 uppercase tracking-widest text-center md:text-left">
          {format(month, 'MMMM yyyy')}
        </h4>
        <div className="grid grid-cols-7 gap-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-[10px] font-mono text-slate-300 text-center py-2 uppercase tracking-wider">{d}</div>
          ))}
          {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
          {days.map(day => {
            const isStart = dates.start && isSameDay(day, dates.start);
            const isEnd = dates.end && isSameDay(day, dates.end);
            const inRange = dates.start && dates.end && isWithinInterval(day, { start: dates.start, end: dates.end });
            const isPast = isBefore(day, startOfDay(new Date()));
            const isBusy = busyDates.some(bd => isSameDay(bd, day));

            return (
              <button
                type="button"
                key={day.toISOString()}
                disabled={isPast || isBusy}
                onClick={() => handleDateClick(day)}
                className={`
                  relative h-10 w-10 flex items-center justify-center text-xs font-semibold transition-all mx-auto
                  ${(isPast || isBusy) ? 'text-slate-300 cursor-not-allowed opacity-40' : 'text-slate-700 hover:bg-slate-100/80 rounded-full'}
                  ${inRange ? '!bg-sky-100 !text-sky-950 !rounded-none font-bold' : ''}
                  ${isStart || isEnd ? '!bg-ocean !text-white z-20 !rounded-full scale-110 font-black shadow-lg shadow-ocean/30' : ''}
                `}
              >
                {isBusy && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />}
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const Counter = ({ label, sub, value, min = 0, onChange }: any) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <div>
        <div className="text-xs font-bold text-slate-900 uppercase">{label}</div>
        <div className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">{sub}</div>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-ocean hover:text-ocean transition-colors">-</button>
        <span className="w-3 text-center font-bold text-slate-900 text-sm">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-ocean hover:text-ocean transition-colors">+</button>
      </div>
    </div>
  );

  // ──────────────────────────────────────────────────────────────────────────
  // 1. SPECIFIC PROPERTY (INLINE DESIGN MODE)
  // ──────────────────────────────────────────────────────────────────────────
  if (preselectedSlug) {
    return (
      <section className="relative bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-100/50" ref={containerRef} id="availability-section">
        <div className="flex flex-col gap-8">
          {/* Calendar Side */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean">Dates</p>
                <h3 className="text-xl font-bold text-slate-900 tracking-tighter">Choose your stay</h3>
              </div>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} className="p-2 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {renderMonth(currentMonth)}
              {renderMonth(addMonths(currentMonth, 1))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-50">
              <div className="text-xs text-slate-500 font-medium">
                {dates.start && dates.end ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Selected: {format(dates.start, 'MMM d')} → {format(dates.end, 'MMM d, yyyy')}
                  </span>
                ) : (
                  <span className="text-slate-400">Click a start date to begin</span>
                )}
              </div>
              <button type="button" onClick={() => setDates({ start: null, end: null })} className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest hover:text-ocean transition-colors">Clear</button>
            </div>
          </div>

          {/* Guests & Reserve Action Side */}
          <div className="border-t border-slate-100 pt-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean">Configuration</p>
                <h3 className="text-xl font-bold text-slate-900 tracking-tighter">Who is checking in?</h3>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-3">
                <Counter label="Adults" sub="Ages 18+" value={config.adults} min={1} onChange={(v: number) => setConfig({...config, adults: v})} />
                <Counter label="Children" sub="Ages 2-17" value={config.children} onChange={(v: number) => setConfig({...config, children: v})} />
                <Counter label="Babies" sub="Under 2" value={config.babies} onChange={(v: number) => setConfig({...config, babies: v})} />

                <div className="pt-3 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase">Pets included</span>
                    <button type="button" onClick={() => setConfig({...config, hasPets: !config.hasPets})} className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${config.hasPets ? 'bg-ocean text-white border-ocean' : 'text-slate-400 border-slate-100'}`}>
                      {config.hasPets ? 'Yes' : 'No'}
                    </button>
                  </div>
                  {config.hasPets && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="space-y-3 overflow-hidden pt-3">
                      <Counter label="Dogs" sub="Friendly dogs" value={config.dogs} onChange={(v: number) => setConfig({...config, dogs: v})} />
                      <Counter label="Cats" sub="Indoor cats" value={config.cats} onChange={(v: number) => setConfig({...config, cats: v})} />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Availability & Reserve Button */}
            <div className="mt-6">
              <button 
                type="button"
                disabled={isAvailable === false || isChecking || !dates.start || !dates.end}
                onClick={handleReserveClick}
                className={`
                  w-full group flex flex-col items-center justify-center gap-1.5 p-5 rounded-2xl font-bold transition-all
                  ${!dates.start || !dates.end ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                    isAvailable === false ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                    'bg-ocean text-white hover:shadow-xl hover:shadow-ocean/20 hover:-translate-y-0.5 active:scale-95'}
                `}
              >
                <div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em]">
                  {isChecking ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : 
                   isAvailable === true ? <CheckCircle2 className="w-4 h-4 shrink-0" /> :
                   isAvailable === false ? <XCircle className="w-4 h-4 shrink-0" /> : null}
                  {!dates.start || !dates.end ? 'Select Dates' :
                   isChecking ? 'Checking…' :
                   isAvailable === false ? 'Not available' : 'Reserve Stay'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
                </div>
                {dates.start && dates.end && (
                  <div className="flex items-center gap-2 text-[10px] font-mono text-white/70 uppercase tracking-widest">
                    <Moon className="w-3 h-3" />
                    <span>{differenceInDays(dates.end, dates.start)} Nights Stay</span>
                  </div>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Guest Form Modal for Specific Finca Checkout */}
        <AnimatePresence>
          {showGuestForm && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={() => setShowGuestForm(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl"
              >
                <button
                  type="button"
                  onClick={() => setShowGuestForm(false)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>

                <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean mb-2">Guest check-in</p>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tighter">
                    Confirmation Details
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                  {selectedProperty?.name} · {dates.start && dates.end ? `${differenceInDays(dates.end, dates.start)} nights` : ''}
                </p>

                <div className="space-y-4">
                  {session?.user ? (
                    <div className="bg-ocean/5 border border-ocean/10 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-ocean text-white flex items-center justify-center font-bold uppercase shrink-0 text-lg">
                        {session.user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-ocean uppercase tracking-widest mb-0.5">Booking as</div>
                        <div className="text-sm font-bold text-slate-900 leading-tight">{session.user.name}</div>
                        <div className="text-xs text-slate-500">{session.user.email}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                        <button type="button" onClick={() => setAuthMode('sign-in')} className={`flex-1 text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg transition-colors ${authMode === 'sign-in' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>Sign In</button>
                        <button type="button" onClick={() => setAuthMode('sign-up')} className={`flex-1 text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg transition-colors ${authMode === 'sign-up' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>Register</button>
                      </div>

                      <div className="space-y-3">
                        {authMode === 'sign-up' && (
                          <div>
                            <label className="block text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400 mb-1">Full Name</label>
                            <input type="text" value={authName} onChange={e => setAuthName(e.target.value)} placeholder="María García" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-ocean" />
                          </div>
                        )}
                        <div>
                          <label className="block text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400 mb-1">Email</label>
                          <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="maria@example.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-ocean" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400 mb-1">Password</label>
                          <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-ocean" />
                        </div>
                        {authError && <div className="text-xs text-rose-500 font-medium bg-rose-50 p-2 rounded-lg border border-rose-100">{authError}</div>}
                        <button type="button" onClick={handleInlineAuth} disabled={authLoading || !authEmail || !authPassword || (authMode === 'sign-up' && !authName)} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-ocean transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                          {authLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                          {authLoading ? 'Processing…' : authMode === 'sign-in' ? 'Sign In' : 'Create Account'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-50 rounded-xl p-4 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span className="font-semibold text-slate-700">Guests</span>
                      <span>{totalGuests}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span className="font-semibold text-slate-700">Arrive → Depart</span>
                      <span>{dates.start ? format(dates.start, 'MMM d') : ''} → {dates.end ? format(dates.end, 'MMM d') : ''}</span>
                    </div>
                  </div>

                  {!session?.user ? null : (
                    <button
                      type="button"
                      onClick={handleBooking}
                      disabled={isBooking || !session?.user}
                      className="w-full mt-4 py-3.5 bg-ocean text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:shadow-xl hover:shadow-ocean/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                      {isBooking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isBooking ? 'Processing…' : 'Confirm reservation'}
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. PUBLIC LISTING MODE (BAR LAYOUT)
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <section className="relative" ref={containerRef} id="availability-section">
      <div className="bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-slate-200/50 relative flex flex-wrap lg:flex-nowrap">
          
        {/* Property Selector */}
        <div 
          className={`p-8 lg:w-72 border-r border-slate-50 transition-colors cursor-pointer group relative ${activePopover === 'properties' ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
          onClick={() => setActivePopover(activePopover === 'properties' ? null : 'properties')}
        >
          <div className="flex items-center gap-3 mb-4">
            <Home className="w-4 h-4 text-ocean" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Selection</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-slate-900">{selectedProperty?.name || 'Loading...'}</span>
            <ChevronDown className={`w-4 h-4 text-slate-200 transition-transform ${activePopover === 'properties' ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence>
            {activePopover === 'properties' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                className="absolute top-full left-0 mt-4 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 p-4"
              >
                {properties.map(p => (
                  <button 
                    type="button"
                    key={p.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedProperty(p); setActivePopover('dates'); }}
                    className="w-full p-4 flex flex-col items-start hover:bg-slate-50 rounded-2xl transition-colors mb-1 last:mb-0"
                  >
                    <span className="text-sm font-bold text-slate-900">{p.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Max {p.max_guests} Guests</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dates Trigger */}
        <div 
          className="flex-1 grid grid-cols-2 cursor-pointer group relative min-w-[280px]"
          onClick={() => setActivePopover(activePopover === 'dates' ? null : 'dates')}
        >
          <div className={`p-8 border-r border-slate-50 transition-colors ${activePopover === 'dates' ? 'bg-slate-50' : 'hover:bg-slate-50'}`}>
            <div className="flex items-center gap-3 mb-4">
              <CalendarIcon className="w-4 h-4 text-ocean" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Arrive</span>
            </div>
            <div className="text-xl font-bold text-slate-900">
              {dates.start ? format(dates.start, 'MMM d') : <span className="text-slate-200 uppercase tracking-widest text-sm">Select</span>}
            </div>
          </div>
          <div className={`p-8 border-r border-slate-50 transition-colors ${activePopover === 'dates' ? 'bg-slate-50' : 'hover:bg-slate-50'}`}>
            <div className="flex items-center gap-3 mb-4">
              <CalendarIcon className="w-4 h-4 text-ocean" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Depart</span>
            </div>
            <div className="text-xl font-bold text-slate-900">
              {dates.end ? format(dates.end, 'MMM d') : <span className="text-slate-200 uppercase tracking-widest text-sm">Select</span>}
            </div>
          </div>

          <AnimatePresence>
            {activePopover === 'dates' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 mt-4 w-screen max-w-[700px] bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col md:flex-row gap-12">
                  {renderMonth(currentMonth)}
                  {renderMonth(addMonths(currentMonth, 1))}
                </div>
                <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} className="p-2 border border-slate-100 rounded-full hover:bg-slate-50 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                    <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 border border-slate-100 rounded-full hover:bg-slate-50 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                  <button type="button" onClick={() => setDates({ start: null, end: null })} className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest hover:text-ocean transition-colors">Clear</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Guests & Pets Trigger */}
        <div 
          className={`p-8 lg:w-80 border-r border-slate-50 transition-colors cursor-pointer group relative ${activePopover === 'guests' ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
          onClick={() => setActivePopover(activePopover === 'guests' ? null : 'guests')}
        >
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-4 h-4 text-ocean" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Who is coming</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900">{totalGuests}</span>
              <span className="text-xs font-medium text-slate-400 uppercase">Guests</span>
              {config.hasPets && <span className="ml-2 text-xs font-bold text-ocean uppercase tracking-widest">+ Pets</span>}
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-200 transition-transform ${activePopover === 'guests' ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence>
            {activePopover === 'guests' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-0 lg:left-0 mt-4 w-screen max-w-[360px] bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-6">
                  <Counter label="Adults" sub="Ages 18+" value={config.adults} min={1} onChange={(v: number) => setConfig({...config, adults: v})} />
                  <Counter label="Children" sub="Ages 2-17" value={config.children} onChange={(v: number) => setConfig({...config, children: v})} />
                  <Counter label="Babies" sub="Under 2" value={config.babies} onChange={(v: number) => setConfig({...config, babies: v})} />
                  <div className="pt-4 border-t border-slate-50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-slate-900 uppercase">Pets</span>
                      <button type="button" onClick={() => setConfig({...config, hasPets: !config.hasPets})} className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${config.hasPets ? 'bg-ocean text-white border-ocean' : 'text-slate-400 border-slate-100'}`}>
                        {config.hasPets ? 'Yes' : 'No'}
                      </button>
                    </div>
                    {config.hasPets && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="space-y-4 overflow-hidden">
                        <Counter label="Dogs" sub="Dogs" value={config.dogs} onChange={(v: number) => setConfig({...config, dogs: v})} />
                        <Counter label="Cats" sub="Cats" value={config.cats} onChange={(v: number) => setConfig({...config, cats: v})} />
                      </motion.div>
                    )}
                  </div>
                  <button type="button" onClick={() => setActivePopover(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest">Apply Selection</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Button */}
        <div className="p-6 lg:p-8 flex items-center justify-center flex-1 lg:flex-initial">
          <button 
            type="button"
            disabled={isAvailable === false || isChecking || !dates.start || !dates.end}
            onClick={handleReserveClick}
            className={`
              group flex flex-col items-center justify-center gap-1 px-12 py-6 rounded-2xl font-bold transition-all min-w-[260px]
              ${!dates.start || !dates.end ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                isAvailable === false ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                'bg-ocean text-white hover:shadow-xl hover:shadow-ocean/20 hover:-translate-y-1 active:scale-95'}
            `}
          >
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em]">
              {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : 
               isAvailable === true ? <CheckCircle2 className="w-4 h-4" /> :
               isAvailable === false ? <XCircle className="w-4 h-4" /> : null}
              {!dates.start || !dates.end ? 'Select Dates' :
               isChecking ? 'Checking…' :
               isAvailable === false ? 'Not available' : 'Reserve Stay'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
            {dates.start && dates.end && (
              <div className="flex items-center gap-2 text-[10px] font-mono text-white/70 uppercase tracking-widest mt-1">
                <Moon className="w-3 h-3" />
                <span>{differenceInDays(dates.end, dates.start)} Nights Stay</span>
              </div>
            )}
          </button>
        </div>

      </div>

      {/* Guest Details Modal for Bar Layout */}
      <AnimatePresence>
        {showGuestForm && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setShowGuestForm(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setShowGuestForm(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>

              <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean mb-2">Guest check-in</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tighter mb-1">
                Confirmation Details
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                {selectedProperty?.name} · {dates.start && dates.end ? `${differenceInDays(dates.end, dates.start)} nights` : ''}
              </p>

              <div className="space-y-4">
                {session?.user ? (
                  <div className="bg-ocean/5 border border-ocean/10 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-ocean text-white flex items-center justify-center font-bold uppercase shrink-0 text-lg">
                      {session.user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-ocean uppercase tracking-widest mb-0.5">Booking as</div>
                      <div className="text-sm font-bold text-slate-900 leading-tight">{session.user.name}</div>
                      <div className="text-xs text-slate-500">{session.user.email}</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                      <button type="button" onClick={() => setAuthMode('sign-in')} className={`flex-1 text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg transition-colors ${authMode === 'sign-in' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>Sign In</button>
                      <button type="button" onClick={() => setAuthMode('sign-up')} className={`flex-1 text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg transition-colors ${authMode === 'sign-up' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>Register</button>
                    </div>

                    <div className="space-y-3">
                      {authMode === 'sign-up' && (
                        <div>
                          <label className="block text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400 mb-1">Full Name</label>
                          <input type="text" value={authName} onChange={e => setAuthName(e.target.value)} placeholder="María García" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-ocean" />
                        </div>
                      )}
                      <div>
                        <label className="block text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400 mb-1">Email</label>
                        <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="maria@example.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-ocean" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400 mb-1">Password</label>
                        <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-ocean" />
                      </div>
                      {authError && <div className="text-xs text-rose-500 font-medium bg-rose-50 p-2 rounded-lg border border-rose-100">{authError}</div>}
                      <button type="button" onClick={handleInlineAuth} disabled={authLoading || !authEmail || !authPassword || (authMode === 'sign-up' && !authName)} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-ocean transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {authLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        {authLoading ? 'Processing…' : authMode === 'sign-in' ? 'Sign In' : 'Create Account'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 rounded-xl p-4 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span className="font-semibold text-slate-700">Guests</span>
                    <span>{totalGuests}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="font-semibold text-slate-700">Arrive → Depart</span>
                    <span>{dates.start ? format(dates.start, 'MMM d') : ''} → {dates.end ? format(dates.end, 'MMM d') : ''}</span>
                  </div>
                </div>

                {!session?.user ? null : (
                  <button
                    type="button"
                    onClick={handleBooking}
                    disabled={isBooking || !session?.user}
                    className="w-full mt-4 py-3.5 bg-ocean text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:shadow-xl hover:shadow-ocean/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    {isBooking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    {isBooking ? 'Processing…' : 'Confirm reservation'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
