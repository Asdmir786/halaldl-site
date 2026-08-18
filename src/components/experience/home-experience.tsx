"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { MarketingExperience } from "@/components/site/marketing-experience";

const HomeScrollDirector = dynamic(() =>
  import("@/components/experience/home-scroll-director").then((module) => module.HomeScrollDirector),
);

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
      <div className="relative z-[1] w-full pt-4">
        <div className="mx-auto w-[calc(100%-2rem)] max-w-7xl sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)]">
          {header}
        </div>
        <div className="homepage-body w-full">
          <HomeScrollDirector className="home-scroll-story">{story}</HomeScrollDirector>
          {afterStory}
        </div>
      </div>
    </MarketingExperience>
  );
}
