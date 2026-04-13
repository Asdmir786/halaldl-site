import { FeatureShowcase } from "@/components/feature-showcase";
import { SectionIntro, SectionShell } from "@/components/home/home-shared";
import { FEATURE_STORIES } from "@/lib/site";

export function ProofSection() {
  return (
    <SectionShell>
      <div className="section-divider mb-16" />

      <SectionIntro
        eyebrow="Product Proof"
        title="Daily polish lands where people touch the app."
        accent="The stage stays stable."
        body="Preset filename templates, compact quick downloads, saved behavior settings, clearer finished cards, latest-result spotlight, and raw logs all stay easy to compare in light or dark mode."
        className="max-w-2xl"
      />

      <div className="mt-12 pb-10 lg:pb-20">
        <FeatureShowcase stories={FEATURE_STORIES} />
      </div>
    </SectionShell>
  );
}
