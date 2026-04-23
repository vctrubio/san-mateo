import HeroLanding from "@/components/HeroLanding";
import PropertyShowcase from "@/components/PropertyShowcase";
import AboutSection from "@/components/AboutSection";
import PropertyAvailability from "@/components/PropertyAvailability";
import Footer from "@/components/Footer";
import DebugPlan from "@/components/DebugPlan";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroLanding />
      <PropertyShowcase />
      <PropertyAvailability />
      <AboutSection />
      <Footer />
      <DebugPlan />
    </main>
  );
}
