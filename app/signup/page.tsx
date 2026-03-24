import { LandingNav } from "@/components/landing/LandingNav";
import { SignupSection } from "@/components/landing/SignupSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <LandingNav />
      <SignupSection />
      <LandingFooter />
    </div>
  );
}
