"use client";

import type { ReactNode } from "react";
import { SmoothScrollProvider } from "@/components/site/smooth-scroll-provider";

type MarketingExperienceProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Marketing-only experience shell: Lenis + GSAP substrate + first-paint enter.
 */
export function MarketingExperience({ children, className }: MarketingExperienceProps) {
  return (
    <SmoothScrollProvider>
      <div className={["marketing-shell-enter", className].filter(Boolean).join(" ")}>
        {children}
      </div>
    </SmoothScrollProvider>
  );
}
