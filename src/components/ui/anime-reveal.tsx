"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

type AnimeRevealProps = {
  children: ReactNode;
  className?: string;
  /** Selector (relative to the wrapper) for the items to stagger in. */
  selector?: string;
  delayStep?: number;
  y?: number;
  blur?: number;
  duration?: number;
};

/**
 * Staggered entrance for a group of children using anime.js, layered on top of
 * the existing CSS entrance animations. Renders fully visible on the server and
 * with JS disabled; only hides-then-reveals once mounted, and is a no-op under
 * prefers-reduced-motion so nothing ever depends on the animation to be legible.
 */
export function AnimeReveal({
  children,
  className,
  selector = ":scope > *",
  delayStep = 70,
  y = 16,
  blur = 6,
  duration = 700,
}: AnimeRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const targets = Array.from(root.querySelectorAll<HTMLElement>(selector));
    if (targets.length === 0) return;

    targets.forEach((target) => {
      target.style.opacity = "0";
      target.style.transform = `translateY(${y}px)`;
      target.style.filter = `blur(${blur}px)`;
    });

    let cancelled = false;

    void import("animejs").then(({ animate, stagger }) => {
      if (cancelled) return;

      animate(targets, {
        opacity: [0, 1],
        translateY: [y, 0],
        filter: [`blur(${blur}px)`, "blur(0px)"],
        duration,
        delay: stagger(delayStep),
        ease: "outExpo",
      });
    });

    return () => {
      cancelled = true;
      targets.forEach((target) => {
        target.style.opacity = "";
        target.style.transform = "";
        target.style.filter = "";
      });
    };
  }, [selector, delayStep, y, blur, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
