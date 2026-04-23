import HeroLanding from "@/components/HeroLanding";
import DebugColorPanel from "@/components/DebugColorPanel";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroLanding />
      <DebugColorPanel />
    </main>
  );
}
