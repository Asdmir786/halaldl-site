"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { DownloadScrollDirector } from "@/components/experience/download-scroll-director";
import { MarketingExperience } from "@/components/site/marketing-experience";

const DownloadLiteScene = dynamic(
  () =>
    import("@/components/experience/download-lite-scene").then((m) => m.DownloadLiteSceneCanvas),
  { ssr: false, loading: () => null },
);

type DownloadExperienceProps = {
  children: ReactNode;
};

export function DownloadExperience({ children }: DownloadExperienceProps) {
  return (
    <MarketingExperience>
      <div className="relative">
        <DownloadLiteScene className="experience-canvas experience-canvas--download" />
        <DownloadScrollDirector className="relative z-[1]">
          {children}
        </DownloadScrollDirector>
      </div>
    </MarketingExperience>
  );
}
