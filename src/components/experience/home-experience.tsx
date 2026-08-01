"use client";

import type { ReactNode } from "react";
import { HomeScrollDirector } from "@/components/experience/home-scroll-director";
import { MarketingExperience } from "@/components/site/marketing-experience";

type HomeExperienceProps = {
  header: ReactNode;
  story: ReactNode;
  afterStory: ReactNode;
};

/**
 * Homepage Lenis/GSAP substrate. 3D lives inside the hero stage (not a full-page canvas).
 */
export function HomeExperience({ header, story, afterStory }: HomeExperienceProps) {
  return (
    <MarketingExperience>
      <div className="relative z-[1] mx-auto max-w-7xl px-5 pb-24 pt-4 sm:px-8">
        {header}
        <HomeScrollDirector className="home-scroll-story">{story}</HomeScrollDirector>
        {afterStory}
      </div>
    </MarketingExperience>
  );
}
