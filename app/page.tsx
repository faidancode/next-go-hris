import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <LandingNavbar />
      <LandingHero />
      <LandingFeatures />
      <LandingFooter />
    </main>
  );
}
