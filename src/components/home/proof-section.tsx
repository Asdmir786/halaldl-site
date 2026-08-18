import Link from "next/link";
import { FeatureShowcase } from "@/components/feature-showcase";
import { CURRENT_RELEASE } from "@/content/releases/registry";
import { MotionField } from "@/components/ui/motion-field";
import { SectionIntro, SectionShell } from "@/components/home/home-shared";
import { FEATURE_STORIES } from "@/lib/site";

export function ProofSection() {
  return (
    <SectionShell>
      <section id="features" className="local-control-story">
        <div className="section-divider mb-16" />

        <MotionField className="local-control-story-intro homepage-motion-reveal">
          <SectionIntro
            eyebrow="Inside the control room"
            title="Every decision stays visible."
            accent="Preview, choose, recover, keep, and create."
            body={`The ${CURRENT_RELEASE.tag} release turns a supported link into a local workflow with clear states—not a black-box queue.`}
            className="max-w-2xl"
          />
          <p className="local-control-story-aside">
            Official product screens from {CURRENT_RELEASE.tag}. <Link href="/guides/halaldl-0-6-0">Read the release guide</Link> for the full change set.
          </p>
        </MotionField>

        <div className="mt-10 pb-8 lg:mt-14 lg:pb-16">
          <FeatureShowcase stories={FEATURE_STORIES} />
        </div>
      </section>
    </SectionShell>
  );
}
