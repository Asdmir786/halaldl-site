"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
  amount?: number;
  margin?: string;
  blur?: number;
};

/**
 * Content-safe scroll entrance. The wrapper renders normally before JavaScript
 * activates, so copy and actions never depend on an animation callback to exist.
 */
export function ScrollReveal({ children, delay = 0, className }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const activate = () => element.classList.add("is-motion-active");

    if (!("IntersectionObserver" in window)) {
      activate();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        activate();
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: "0px 0px -8%" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const style = { "--scroll-reveal-delay": `${delay}s` } as CSSProperties;

  return (
    <div ref={ref} className={`scroll-reveal-motion ${className ?? ""}`.trim()} style={style}>
      {children}
    </div>
  );
}
