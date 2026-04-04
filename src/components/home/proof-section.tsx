import { FeatureShowcase } from "@/components/feature-showcase";
import { SectionIntro, SectionShell } from "@/components/home/home-shared";
import { FEATURE_STORIES } from "@/lib/site";

export function ProofSection() {
  return (
    <SectionShell>
      <div className="section-divider mb-16" />

      <SectionIntro
        eyebrow="Product Proof"
        title="The interface speaks for itself."
        accent="The stage should feel stable."
        body="As you move through quick flow, subtitle presets, verified updates, notification routing, history, and logs, the screenshot panel should stay pinned, theme-correct, and visually stable instead of collapsing or drifting."
        className="max-w-2xl"
      />

      <div className="mt-12 pb-10 lg:pb-20">
        <FeatureShowcase stories={FEATURE_STORIES} />
      </div>
    </SectionShell>
  );
}
