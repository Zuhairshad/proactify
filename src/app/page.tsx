import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { LandingNavbar } from "@/components/landing/landing-navbar";

export default function LandingPage() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#030303]">
      <LandingNavbar />
      
      <HeroGeometric 
        badge="Risk & Issue Management"
        title1="Proactive Risk"
        title2="Management Platform"
      />
      
      {/* Footer with Designer Credit */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-[#030303] to-transparent py-6">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-sm text-white/40">
            Designed & Developed by{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-rose-400 font-semibold">
              Uzair Ahmad
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
