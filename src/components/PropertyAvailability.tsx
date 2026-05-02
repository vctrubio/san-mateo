'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, Users, ArrowRight, ChevronDown, ChevronLeft, ChevronRight, X, Moon, Home, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, startOfDay, addDays, isBefore, differenceInDays } from 'date-fns';
import { checkPropertyAvailability, getAllProperties, createInitialBooking, getBusyDates } from '@/app/actions/booking';
import { useRouter } from 'next/navigation';

export default function PropertyAvailability() {
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
  const containerRef = useRef<HTMLDivElement>(null);

  const [config, setConfig] = useState({
    adults: 2, children: 0, babies: 0, needsCrib: false, hasPets: false, dogs: 0, cats: 0
  });

  useEffect(() => {
    getAllProperties().then((data: any) => {
      setProperties(data);
      if (data && data.length > 0) setSelectedProperty(data[0]);
    });

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setTimeout(() => setActivePopover('guests'), 300);
    }
  };

  const handleReserveClick = () => {
    if (!selectedProperty || !dates.start || !dates.end || isAvailable === false) return;
    setShowGuestForm(true);
  };

  const handleBooking = async () => {
    if (!selectedProperty || !dates.start || !dates.end || isAvailable === false) return;
    if (!guestFirstName.trim() || !guestLastName.trim() || !guestEmail.trim()) return;

    setIsBooking(true);
    const res = await createInitialBooking(
      {
        propertyId: selectedProperty.id,
        startDate: dates.start,
        endDate: dates.end,
        ...config,
      },
      guestFirstName,
      guestLastName,
      guestEmail,
    );
    setIsBooking(false);

    if (res.success) {
      router.push(`/booking/${(res as any).reference}`);
    } else {
      alert(`Error: ${(res as any).error}`);
    }
  };

  const renderMonth = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    const emptyDays = Array(start.getDay()).fill(null);

    return (
      <div className="flex-1 min-w-[280px]">
        <h4 className="text-sm font-bold text-slate-900 mb-4 px-2 uppercase tracking-widest">{format(month, 'MMMM yyyy')}</h4>
        <div className="grid grid-cols-7 gap-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-[10px] font-mono text-slate-300 text-center py-2 uppercase">{d}</div>
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
                key={day.toISOString()}
                disabled={isPast || isBusy}
                onClick={() => handleDateClick(day)}
                className={`
                  relative h-10 w-10 flex items-center justify-center text-xs font-medium rounded-full transition-all
                  ${(isPast || isBusy) ? 'text-slate-200 cursor-not-allowed opacity-30' : 'text-slate-600 hover:bg-slate-100'}
                  ${inRange ? 'bg-sky-50 text-ocean rounded-none first:rounded-l-full last:rounded-r-full' : ''}
                  ${isStart || isEnd ? 'bg-ocean text-white z-10 scale-110 shadow-lg shadow-ocean/20' : ''}
                `}
              >
                {isBusy && <div className="absolute top-1 right-1 w-1 h-1 bg-slate-300 rounded-full" />}
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const Counter = ({ label, sub, value, min = 0, onChange }: any) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm font-bold text-slate-900 uppercase">{label}</div>
        <div className="text-[10px] text-slate-400 font-mono uppercase">{sub}</div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => onChange(Math.max(min, value - 1))} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-ocean hover:text-ocean transition-colors">-</button>
        <span className="w-4 text-center font-bold text-slate-900">{value}</span>
        <button onClick={() => onChange(value + 1)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-ocean hover:text-ocean transition-colors">+</button>
      </div>
    </div>
  );

  return (
    <section className="relative" ref={containerRef} id="availability-section">
      <div className="bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-slate-200/50 relative">
          
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
            className="flex-1 grid grid-cols-2 cursor-pointer group relative"
            onClick={() => setActivePopover(activePopover === 'dates' ? null : 'dates')}
          >
            <div className={`p-8 border-r border-slate-50 transition-colors ${activePopover === 'dates' ? 'bg-slate-50' : 'hover:bg-slate-50'}`}>
              <div className="flex items-center gap-3 mb-4">
                <CalendarIcon className="w-4 h-4 text-ocean" />
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Arrive</span>
              </div>
              <div className="text-xl font-bold text-slate-900">
                {dates.start ? format(dates.start, 'MMM d, yyyy') : <span className="text-slate-200 uppercase tracking-widest text-sm">Select Date</span>}
              </div>
            </div>
            <div className={`p-8 border-r border-slate-50 transition-colors ${activePopover === 'dates' ? 'bg-slate-50' : 'hover:bg-slate-50'}`}>
              <div className="flex items-center gap-3 mb-4">
                <CalendarIcon className="w-4 h-4 text-ocean" />
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Depart</span>
              </div>
              <div className="text-xl font-bold text-slate-900">
                {dates.end ? format(dates.end, 'MMM d, yyyy') : <span className="text-slate-200 uppercase tracking-widest text-sm">Select Date</span>}
              </div>
            </div>

            {/* Date Popover */}
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
                      <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} className="p-2 border border-slate-100 rounded-full hover:bg-slate-50 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 border border-slate-100 rounded-full hover:bg-slate-50 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                    <button onClick={() => setDates({ start: null, end: null })} className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest hover:text-ocean transition-colors">Clear Selection</button>
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

            {/* Guest Selector Popover */}
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
                        <button onClick={() => setConfig({...config, hasPets: !config.hasPets})} className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${config.hasPets ? 'bg-ocean text-white border-ocean' : 'text-slate-400 border-slate-100'}`}>
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
                    <button onClick={() => setActivePopover(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest">Apply Selection</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Button with Availability State */}
          <div className="p-6 lg:p-8 flex items-center justify-center">
            <button 
              disabled={isAvailable === false || isChecking}
              onClick={handleReserveClick}
              className={`
                group flex flex-col items-center justify-center gap-1 px-12 py-6 rounded-2xl font-bold transition-all min-w-[260px]
                ${isAvailable === false ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-ocean text-white hover:shadow-xl hover:shadow-ocean/20 hover:-translate-y-1 active:scale-95'}
              `}
            >
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em]">
                {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                 isAvailable === true ? <CheckCircle2 className="w-4 h-4" /> :
                 isAvailable === false ? <XCircle className="w-4 h-4" /> : null}
                {isAvailable === false ? 'Not Available' : 'Reserve Stay'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
              <AnimatePresence>
                {dates.start && dates.end && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="flex items-center gap-2 text-[10px] font-mono text-white/70 uppercase tracking-widest mt-1"
                  >
                    <Moon className="w-3 h-3" />
                    <span>{differenceInDays(dates.end, dates.start)} {differenceInDays(dates.end, dates.start) === 1 ? 'Night' : 'Nights'} Stay</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

        </div>
      {/* Guest Details Modal */}
      <AnimatePresence>
        {showGuestForm && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowGuestForm(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl"
            >
              <button
                onClick={() => setShowGuestForm(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>

              <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean mb-2">Almost there</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tighter mb-1">
                Who is checking in?
              </h3>
              <p className="text-sm text-slate-500 mb-8">
                {selectedProperty?.name} · {dates.start && dates.end ? `${differenceInDays(dates.end, dates.start)} nights` : ''}
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400 mb-2">First name</label>
                    <input
                      type="text"
                      value={guestFirstName}
                      onChange={e => setGuestFirstName(e.target.value)}
                      placeholder="María"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-ocean"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400 mb-2">Last name</label>
                    <input
                      type="text"
                      value={guestLastName}
                      onChange={e => setGuestLastName(e.target.value)}
                      placeholder="García"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-ocean"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400 mb-2">Email address</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={e => setGuestEmail(e.target.value)}
                    placeholder="maria@example.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-ocean"
                  />
                </div>

                <div className="bg-slate-50 rounded-2xl p-5">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>{selectedProperty?.name}</span>
                    <span>{config.adults + config.children} guests</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 mt-1">
                    <span>{dates.start ? format(dates.start, 'MMM d') : ''} → {dates.end ? format(dates.end, 'MMM d, yyyy') : ''}</span>
                    <span>{dates.start && dates.end ? `${differenceInDays(dates.end, dates.start)} nights` : ''}</span>
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  disabled={isBooking || !guestFirstName.trim() || !guestLastName.trim() || !guestEmail.trim()}
                  className="w-full py-4 bg-ocean text-white rounded-2xl font-bold text-sm uppercase tracking-[0.2em] hover:shadow-xl hover:shadow-ocean/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-3"
                >
                  {isBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isBooking ? 'Creating booking…' : 'Confirm booking'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
