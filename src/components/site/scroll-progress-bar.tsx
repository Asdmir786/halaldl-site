"use client";

import { useEffect, useRef } from "react";
import { useSmoothScroll } from "@/components/site/smooth-scroll-provider";

/**
 * A thin gradient progress bar fixed at the very top of the viewport.
 * Reads Lenis scroll progress so it stays perfectly in sync with the
 * smooth-scroll position rather than the native scrollbar.
 */
export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const { lenis, reducedMotion } = useSmoothScroll();

  useEffect(() => {
    const bar = barRef.current;
    if (!bar || reducedMotion) return;

    const onScroll = ({ progress }: { progress: number }) => {
      bar.style.transform = `scaleX(${progress})`;
    };

    if (lenis) {
      lenis.on("scroll", onScroll);
      return () => {
        lenis.off("scroll", onScroll);
      };
    }

    // Fallback: native scroll when Lenis hasn't mounted yet
    const onNativeScroll = () => {
      const el = document.documentElement;
      const progress = el.scrollTop / (el.scrollHeight - el.clientHeight);
      if (bar) bar.style.transform = `scaleX(${progress})`;
    };

    window.addEventListener("scroll", onNativeScroll, { passive: true });
    return () => window.removeEventListener("scroll", onNativeScroll);
  }, [lenis, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="scroll-progress-bar"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
