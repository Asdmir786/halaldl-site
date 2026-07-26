import { FeatureShowcase } from "@/components/feature-showcase";
import { SectionIntro, SectionShell } from "@/components/home/home-shared";
import { FEATURE_STORIES } from "@/lib/site";

export function ProofSection() {
  return (
    <SectionShell>
      <div className="section-divider mb-16" />

      <SectionIntro
        eyebrow="Product Proof"
        title="Trust, feedback, and speed land where you touch the app."
        accent="The stage follows along."
        body="Install trust, one-click diagnostics, support prompts that wait for real usage, faster startup, and raw logs — each with its own shot, in light or dark mode."
        className="max-w-2xl"
      />

      <div className="mt-12 pb-10 lg:pb-20">
        <FeatureShowcase stories={FEATURE_STORIES} />
      </div>
    </SectionShell>
  );
}
