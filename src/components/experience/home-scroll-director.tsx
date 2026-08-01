"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { bumpScene, homeSceneState } from "@/components/experience/scroll-progress-store";
import { useSmoothScroll } from "@/components/site/smooth-scroll-provider";

gsap.registerPlugin(ScrollTrigger);

type HomeScrollDirectorProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Gentle hero-stage parallax while the hero is on screen.
 * Keeps the canvas cheap: no multi-texture scrub, no full-page camera cinema.
 */
export function HomeScrollDirector({ children, className }: HomeScrollDirectorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useSmoothScroll();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reducedMotion) {
        homeSceneState.sceneOpacity = 1;
        return;
      }

      const state = homeSceneState;
      const proxy = {
        camX: state.camera.x,
        camY: state.camera.y,
        camZ: state.camera.z,
        rotY: state.billboardRotationY,
        scale: state.billboardScale,
        opacity: state.sceneOpacity,
      };

      const apply = () => {
        state.camera.x = proxy.camX;
        state.camera.y = proxy.camY;
        state.camera.z = proxy.camZ;
        state.billboardRotationY = proxy.rotY;
        state.billboardScale = proxy.scale;
        state.sceneOpacity = proxy.opacity;
        bumpScene(state);
      };

      const hero = root.querySelector<HTMLElement>("[data-hero-3d-stage]");

      gsap.to(proxy, {
        camX: 0.45,
        camY: 0.35,
        camZ: 4.85,
        rotY: -0.42,
        scale: 1.04,
        ease: "none",
        onUpdate: apply,
        scrollTrigger: {
          trigger: hero ?? root,
          start: "top 20%",
          end: "bottom top",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      gsap.to(proxy, {
        opacity: 0,
        ease: "none",
        onUpdate: apply,
        scrollTrigger: {
          trigger: hero ?? root,
          start: "bottom 55%",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  return (
    <div ref={rootRef} className={className} data-home-scroll-director="">
      {children}
    </div>
  );
}
