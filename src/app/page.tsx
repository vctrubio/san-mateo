import HeroLanding from "@/components/HeroLanding";
import DebugColorPanel from "@/components/DebugColorPanel";
import PropertyShowcase from "@/components/PropertyShowcase";
import AboutSection from "@/components/AboutSection";
import PropertyAvailability from "@/components/PropertyAvailability";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroLanding />
      <PropertyShowcase />
      <PropertyAvailability />
      <AboutSection />
      {/* <DebugColorPanel /> */}
    </main>
  );
}
