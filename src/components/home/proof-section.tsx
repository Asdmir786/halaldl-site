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
            body={`HalalDL ${CURRENT_RELEASE.tag} keeps the visible local workflow and tightens its privacy and security boundaries.`}
            className="max-w-2xl"
          />
          <p className="local-control-story-aside">
            Core product screens introduced in v0.6.0 remain current. <Link href="/guides/halaldl-0-6-1">Read the v0.6.1 maintenance guide</Link> for the latest boundary changes.
          </p>
        </MotionField>

        <div className="mt-10 pb-8 lg:mt-14 lg:pb-16">
          <FeatureShowcase stories={FEATURE_STORIES} />
        </div>
      </section>
    </SectionShell>
  );
}
