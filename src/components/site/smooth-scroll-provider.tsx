"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/components/experience/use-prefers-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

type SmoothScrollContextValue = {
  lenis: Lenis | null;
  reducedMotion: boolean;
};

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  reducedMotion: false,
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

type SmoothScrollProviderProps = {
  children: ReactNode;
};

/**
 * Lenis smooth scroll synced to the GSAP ticker so ScrollTrigger scrub stays locked.
 * Marketing routes only.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      ScrollTrigger.config({ limitCallbacks: true });
      return;
    }

    const instance = new Lenis({
      autoRaf: false,
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
      syncTouch: false,
    });

    instance.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      instance.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Defer so Lenis construction stays outside the synchronous effect render path.
    const frame = requestAnimationFrame(() => {
      setLenis(instance);
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(frame);
      instance.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, [reducedMotion]);

  return (
    <SmoothScrollContext.Provider value={{ lenis, reducedMotion }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
