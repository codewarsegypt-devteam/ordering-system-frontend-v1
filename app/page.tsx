import { LandingNav } from "@/components/landing/LandingNav";
import { LandingHero } from "@/components/landing/LandingHero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PlansSection } from "@/components/landing/PlansSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <LandingNav />
      <LandingHero />
      <HowItWorks />
      <FeaturesSection />
      <TestimonialsSection />
      <PlansSection />
      <LandingFooter />
    </div>
  );
}
