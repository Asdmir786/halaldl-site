"use client";

import type { ReactNode } from "react";
import { MarketingExperience } from "@/components/site/marketing-experience";

type MarketingShellProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Soft first-paint enter + Lenis/GSAP substrate for marketing content.
 * Do not nest inside another opacity-0 reveal for the same above-fold block.
 */
export function MarketingShell({ children, className }: MarketingShellProps) {
  return <MarketingExperience className={className}>{children}</MarketingExperience>;
}
