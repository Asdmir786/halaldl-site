"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useSmoothScroll } from "@/components/site/smooth-scroll-provider";

gsap.registerPlugin(ScrollTrigger);

type ScrollBeatsProps = {
  children: ReactNode;
  className?: string;
  /** CSS selector for beat nodes inside this root */
  beatSelector?: string;
};

/**
 * Once-in-view stagger for `[data-scroll-beat]` (or custom selector) blocks.
 */
export function ScrollBeats({
  children,
  className,
  beatSelector = "[data-scroll-beat]",
}: ScrollBeatsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useSmoothScroll();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reducedMotion) return;

      const beats = root.querySelectorAll<HTMLElement>(beatSelector);
      if (beats.length === 0) return;

      gsap.set(beats, { autoAlpha: 0, y: 32 });

      beats.forEach((beat, index) => {
        gsap.to(beat, {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          delay: Math.min(index * 0.04, 0.2),
          ease: "power3.out",
          scrollTrigger: {
            trigger: beat,
            start: "top 90%",
            once: true,
          },
        });
      });
    },
    { scope: rootRef, dependencies: [reducedMotion, beatSelector] },
  );

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}

type StickyCompareProps = {
  children: ReactNode;
  className?: string;
};

/** Desktop soft-pin for Full vs Lite comparison grids — shorter, cheaper. */
export function StickyCompare({ children, className }: StickyCompareProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useSmoothScroll();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reducedMotion) return;
      if (window.matchMedia("(max-width: 1023px)").matches) return;

      ScrollTrigger.create({
        trigger: root,
        start: "top 18%",
        end: "+=45%",
        pin: true,
        pinSpacing: true,
        scrub: false,
        anticipatePin: 1,
      });
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}

type GuideReadingProgressProps = {
  /** Article element id to track */
  targetId?: string;
};

export function GuideReadingProgress({ targetId = "guide-article-body" }: GuideReadingProgressProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useSmoothScroll();

  useGSAP(
    () => {
      const bar = barRef.current;
      const article = document.getElementById(targetId);
      if (!bar || !article || reducedMotion) return;

      gsap.set(bar, { width: "0%" });

      gsap.to(bar, {
        width: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: article,
          start: "top 20%",
          end: "bottom 80%",
          scrub: 0.35,
        },
      });
    },
    { dependencies: [reducedMotion, targetId] },
  );

  return <div ref={barRef} className="guide-scroll-progress" aria-hidden="true" />;
}
