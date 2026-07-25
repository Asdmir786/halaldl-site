"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient drifting glass orbs + grid behind the hero, driven by anime.js.
 * Purely decorative (aria-hidden), sits behind hero content, and is a no-op
 * under prefers-reduced-motion — the orbs still render, they simply hold still.
 */
export function HeroAtmosphere() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void import("animejs").then(({ animate, stagger, utils }) => {
      if (cancelled || !rootRef.current) return;

      const orbs = rootRef.current.querySelectorAll<HTMLElement>(".hero-atmosphere-orb");
      if (orbs.length === 0) return;

      const animation = animate(orbs, {
        translateX: () => utils.random(-30, 30),
        translateY: () => utils.random(-24, 18),
        scale: [1, 1.08, 1],
        duration: 9000,
        delay: stagger(500),
        loop: true,
        alternate: true,
        ease: "inOutSine",
      });

      cleanup = () => animation.pause();
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div ref={rootRef} className="hero-atmosphere" aria-hidden="true">
      <span className="hero-atmosphere-orb hero-atmosphere-orb--mint" />
      <span className="hero-atmosphere-orb hero-atmosphere-orb--steel" />
      <span className="hero-atmosphere-grid" />
    </div>
  );
}
