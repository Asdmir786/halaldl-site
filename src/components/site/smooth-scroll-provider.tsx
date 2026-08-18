"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePrefersReducedMotion } from "@/components/experience/use-prefers-reduced-motion";

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
 * The runtime is loaded after the first paint so marketing pages keep their motion
 * without making the scroll engine part of the initial mobile bundle.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (reducedMotion) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    const frame = requestAnimationFrame(() => {
      void Promise.all([import("lenis"), import("gsap"), import("gsap/ScrollTrigger")]).then(
        ([lenisModule, gsapModule, scrollTriggerModule]) => {
          if (disposed) return;

          const LenisConstructor = lenisModule.default;
          const gsap = gsapModule.default;
          const { ScrollTrigger } = scrollTriggerModule;
          gsap.registerPlugin(ScrollTrigger);

          const instance = new LenisConstructor({
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

          const publishFrame = requestAnimationFrame(() => {
            if (disposed) return;
            setLenis(instance);
            ScrollTrigger.refresh();
          });

          cleanup = () => {
            cancelAnimationFrame(publishFrame);
            instance.off("scroll", ScrollTrigger.update);
            gsap.ticker.remove(tick);
            instance.destroy();
          };
        },
      );
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cleanup?.();
      setLenis(null);
    };
  }, [reducedMotion]);

  return (
    <SmoothScrollContext.Provider value={{ lenis, reducedMotion }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
