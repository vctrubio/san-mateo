import Link from 'next/link';
import HeroLanding from '@/components/HeroLanding';
import PropertyShowcase from '@/components/PropertyShowcase';
import PropertyAvailability from '@/components/PropertyAvailability';
import Footer from '@/components/Footer';

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

export default function UserPage() {
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
            <Link href="/admin" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-ocean hover:text-ocean">
              Open admin dashboard
            </Link>
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
