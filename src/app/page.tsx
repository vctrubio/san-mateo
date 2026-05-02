import HeroLanding from "@/components/HeroLanding";
import PropertyShowcase from "@/components/PropertyShowcase";
import AboutSection from "@/components/AboutSection";
import PropertyAvailability from "@/components/PropertyAvailability";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroLanding />
      <PropertyShowcase />
      <section className="py-20 px-4 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <PropertyAvailability />
        </div>
      </section>
      <AboutSection />
      <Footer />
    </main>
  );
}

