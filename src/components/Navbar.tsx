'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 500) {
        // Show if scrolling up, hide if scrolling down
        if (currentScrollY < lastScrollY) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } else {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  const scrollToBooking = () => {
    const element = document.getElementById('availability-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-[1200px]"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl shadow-slate-200/50 rounded-full px-8 py-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 uppercase tracking-[0.3em]">San Mateo</span>
              <span className="text-[10px] font-mono text-ocean uppercase tracking-widest leading-none">Tarifa</span>
            </div>

            <button 
              onClick={scrollToBooking}
              className="px-6 py-2 bg-slate-900 text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-ocean transition-all duration-300 active:scale-95"
            >
              Reserve
            </button>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
