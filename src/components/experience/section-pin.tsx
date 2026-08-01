"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useSmoothScroll } from "@/components/site/smooth-scroll-provider";

gsap.registerPlugin(ScrollTrigger);

type SectionPinProps = {
  children: ReactNode;
  className?: string;
  /** Scroll distance while pinned, e.g. "+=100%" */
  end?: string;
  pin?: boolean;
  scrub?: boolean | number;
  id?: string;
};

/**
 * Pins a section and exposes a scrubbed timeline via data attributes for children.
 * Under reduced motion, renders children without ScrollTrigger.
 */
export function SectionPin({
  children,
  className,
  end = "+=100%",
  pin = true,
  scrub = 1,
  id,
}: SectionPinProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useSmoothScroll();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reducedMotion) return;

      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const pinDistance = isMobile ? "+=60%" : end;

      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: pinDistance,
        pin: pin && !isMobile,
        scrub,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });
    },
    { scope: rootRef, dependencies: [reducedMotion, end, pin, scrub] },
  );

  return (
    <div ref={rootRef} id={id} className={className} data-section-pin="">
      {children}
    </div>
  );
}

type ScrollRevealGsapProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

/** Lightweight GSAP once-in-view reveal for marketing pages using Lenis. */
export function ScrollRevealGsap({
  children,
  className,
  delay = 0,
  y = 28,
}: ScrollRevealGsapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useSmoothScroll();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reducedMotion) return;

      gsap.fromTo(
        el,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        },
      );
    },
    { scope: ref, dependencies: [reducedMotion, delay, y] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
