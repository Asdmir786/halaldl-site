"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { downloadSceneState } from "@/components/experience/scroll-progress-store";
import { useSmoothScroll } from "@/components/site/smooth-scroll-provider";

gsap.registerPlugin(ScrollTrigger);

type DownloadScrollDirectorProps = {
  children: ReactNode;
  className?: string;
  /** Selector or element id for the Full vs Lite comparison block */
  compareTriggerId?: string;
};

export function DownloadScrollDirector({
  children,
  className,
  compareTriggerId = "download-variant-compare",
}: DownloadScrollDirectorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useSmoothScroll();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reducedMotion) {
        downloadSceneState.sceneOpacity = reducedMotion ? 0 : 1;
        return;
      }

      const state = downloadSceneState;
      const proxy = {
        camX: state.camera.x,
        camY: state.camera.y,
        camZ: state.camera.z,
        rotY: state.billboardRotationY,
        mix: state.variantMix,
        opacity: state.sceneOpacity,
      };

      const apply = () => {
        state.camera.x = proxy.camX;
        state.camera.y = proxy.camY;
        state.camera.z = proxy.camZ;
        state.billboardRotationY = proxy.rotY;
        state.variantMix = proxy.mix;
        state.sceneOpacity = proxy.opacity;
      };

      const heroTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=70%",
          scrub: 1,
        },
      });

      heroTl.to(proxy, {
        camZ: 4.6,
        rotY: 0.35,
        opacity: 1,
        duration: 1,
        onUpdate: apply,
      });

      const compareEl = document.getElementById(compareTriggerId);
      if (compareEl) {
        gsap.to(proxy, {
          mix: 1,
          camX: 0.35,
          camZ: 4.2,
          rotY: -0.2,
          ease: "none",
          onUpdate: apply,
          scrollTrigger: {
            trigger: compareEl,
            start: "top 75%",
            end: "bottom 40%",
            scrub: 1,
          },
        });
      }

      return () => {
        heroTl.kill();
      };
    },
    { scope: rootRef, dependencies: [reducedMotion, compareTriggerId] },
  );

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
