import type { GitHubSnapshot } from "@/lib/github";
import { FaqSection } from "@/components/home/faq-section";
import { HeroSection } from "@/components/home/hero-section";
import { HomeCtaFooter } from "@/components/home/home-cta-footer";
import { HomeHeader } from "@/components/home/home-header";
import { InstallSection } from "@/components/home/install-section";
import { ProofSection } from "@/components/home/proof-section";
import { TrustSection } from "@/components/home/trust-section";
import { WorkflowSection } from "@/components/home/workflow-section";

type LandingPageProps = {
  github: GitHubSnapshot;
};

export function LandingPage({ github }: LandingPageProps) {
  return (
    <main id="main-content">
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-4 sm:px-8">
        <HomeHeader />
        <HeroSection github={github} />
        <WorkflowSection />
        <ProofSection />
        <InstallSection github={github} />
        <TrustSection github={github} />
        <FaqSection />
        <HomeCtaFooter github={github} />
      </div>
    </main>
  );
}
