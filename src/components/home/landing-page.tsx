import type { GitHubSnapshot } from "@/lib/github";
import { FaqSection } from "@/components/home/faq-section";
import { HeroSection } from "@/components/home/hero-section";
import { HomeCtaFooter } from "@/components/home/home-cta-footer";
import { HomeHeader } from "@/components/home/home-header";
import { InstallSection } from "@/components/home/install-section";
import { ProofSection } from "@/components/home/proof-section";
import { TrustSection } from "@/components/home/trust-section";
import { WorkflowSection } from "@/components/home/workflow-section";
import { HomeExperience } from "@/components/experience/home-experience";

type LandingPageProps = {
  github: GitHubSnapshot;
};

export function LandingPage({ github }: LandingPageProps) {
  return (
    <main id="main-content">
      <HomeExperience
        header={<HomeHeader />}
        story={
          <>
            <HeroSection github={github} />
            <WorkflowSection />
            <ProofSection />
            <InstallSection github={github} />
          </>
        }
        afterStory={
          <>
            <TrustSection github={github} />
            <FaqSection />
            <HomeCtaFooter github={github} />
          </>
        }
      />
    </main>
  );
}
